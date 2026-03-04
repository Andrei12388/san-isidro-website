import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Fetch attendance summary by event
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const eventId = searchParams.get('eventId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const onlyRegular = searchParams.get('onlyRegular') === 'true';
    const recurrence = searchParams.get('recurrence');

    if (!eventId) {
      return NextResponse.json(
        { error: 'eventId is required' },
        { status: 400 }
      );
    }

    // Get event details
    const event = await prisma.event.findUnique({
      where: { id: parseInt(eventId) },
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Get all users (or filter by role/group if needed)
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        personalInformation: {
          select: {
            firstName: true,
            lastName: true,
            profileImage: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Get actual attendance records for this event
    const attendanceRecords = await prisma.eventAttendance.findMany({
      where: {
        eventId: parseInt(eventId),
      },
      include: {
        user: {
          include: {
            personalInformation: true,
          },
        },
      },
    });

    // Create a map of userId -> attendance record
    const attendanceMap = new Map(
      attendanceRecords.map((record) => [record.userId, record])
    );

    // Build complete attendance list
    const completeAttendance = allUsers.map((user) => {
      const attendance = attendanceMap.get(user.id);

      if (attendance) {
        // User has checked in
        return {
          userId: user.id,
          userName: user.name,
          userEmail: user.email,
          firstName: user.personalInformation?.firstName,
          lastName: user.personalInformation?.lastName,
          profileImage: user.personalInformation?.profileImage,
          isPresent: attendance.isPresent,
          timeIn: attendance.timeIn,
          date: attendance.date,
          attendanceId: attendance.id,
          checkedIn: true,
        };
      } else {
        // User has NOT checked in
        return {
          userId: user.id,
          userName: user.name,
          userEmail: user.email,
          firstName: user.personalInformation?.firstName,
          lastName: user.personalInformation?.lastName,
          profileImage: user.personalInformation?.profileImage,
          isPresent: false,
          timeIn: null,
          date: null,
          attendanceId: null,
          checkedIn: false,
        };
      }
    });

    return NextResponse.json({
      event: {
        id: event.id,
        title: event.title,
        description: event.description,
        location: event.location,
        start: event.start,
        end: event.end,
        isRegular: event.isRegular,
        recurrence: event.recurrence,
      },
      attendance: completeAttendance,
      stats: {
        totalUsers: allUsers.length,
        present: completeAttendance.filter((a) => a.isPresent).length,
        absent: completeAttendance.filter((a) => !a.isPresent).length,
        checkedIn: completeAttendance.filter((a) => a.checkedIn).length,
        notCheckedIn: completeAttendance.filter((a) => !a.checkedIn).length,
      },
    });
  } catch (error) {
    console.error('Error fetching event attendance summary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch event attendance summary' },
      { status: 500 }
    );
  }
}
