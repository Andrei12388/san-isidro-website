import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const eventId = searchParams.get('eventId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const onlyRegular = searchParams.get('onlyRegular') === 'true';
    const recurrence = searchParams.get('recurrence');

    const where: any = {};

    if (eventId) {
      where.eventId = parseInt(eventId);
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        where.date.lte = new Date(endDate);
      }
    }

    if (onlyRegular || recurrence) {
      where.event = {
        isRegular: true,
      };
      if (recurrence) {
        where.event.recurrence = recurrence;
      }
    }

    // Total unique users who attended
    const totalUsers = await prisma.eventAttendance.groupBy({
      by: ['userId'],
      where: {
        ...where,
        isPresent: true,
      },
    });

    // Total attendance records
    const totalAttendance = await prisma.eventAttendance.count({
      where: {
        ...where,
        isPresent: true,
      },
    });

    // Attendance by event
    const attendanceByEvent = await prisma.eventAttendance.groupBy({
      by: ['eventId'],
      where: {
        ...where,
        isPresent: true,
      },
      _count: {
        id: true,
      },
    });

    // Get event details for each attendance count
    const eventIds = attendanceByEvent.map((a: any) => a.eventId);
    const events = await prisma.event.findMany({
      where: {
        id: {
          in: eventIds,
        },
      },
      select: {
        id: true,
        title: true,
        start: true,
        end: true,
        isRegular: true,
        recurrence: true,
      },
    });

    const attendanceByEventWithDetails = attendanceByEvent.map((attendance: any) => {
      const event = events.find((e: any) => e.id === attendance.eventId);
      return {
        eventId: attendance.eventId,
        eventTitle: event?.title || 'Unknown Event',
        count: attendance._count.id,
        isRegular: event?.isRegular,
        recurrence: event?.recurrence,
        start: event?.start,
        end: event?.end,
      };
    });

    // Attendance rate
    const totalRecords = await prisma.eventAttendance.count({
      where,
    });

    const attendanceRate =
      totalRecords > 0 ? (totalAttendance / totalRecords) * 100 : 0;

    // Daily attendance trend (last 30 days or date range)
    const dailyAttendance = await prisma.eventAttendance.groupBy({
      by: ['date'],
      where: {
        ...where,
        isPresent: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        date: 'asc',
      },
    });

    return NextResponse.json({
      totalUniqueUsers: totalUsers.length,
      totalAttendance,
      totalRecords,
      attendanceRate: Math.round(attendanceRate * 100) / 100,
      attendanceByEvent: attendanceByEventWithDetails,
      dailyAttendance: dailyAttendance.map((d: any) => ({
        date: d.date,
        count: d._count.id,
      })),
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
