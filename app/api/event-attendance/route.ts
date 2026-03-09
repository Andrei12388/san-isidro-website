import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST - Record attendance
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, eventId, timeIn, isPresent } = body;

    if (!userId || !eventId) {
      return NextResponse.json(
        { error: 'userId and eventId are required' },
        { status: 400 }
      );
    }

    const parsedUserId = parseInt(userId);
    const parsedEventId = parseInt(eventId);

    // ✅ Check if attendance already exists
    const existingAttendance = await prisma.eventAttendance.findFirst({
      where: {
        userId: parsedUserId,
        eventId: parsedEventId,
      },
    });

    if (existingAttendance) {
      return NextResponse.json(
        { error: 'Attendance already recorded for this event.' },
        { status: 409 }
      );
    }

    // ✅ Create attendance if not existing
    const attendance = await prisma.eventAttendance.create({
      data: {
        userId: parsedUserId,
        eventId: parsedEventId,
        date: new Date(),
        timeIn: timeIn ? new Date(timeIn) : new Date(),
        isPresent: isPresent ?? true,
      },
      include: {
        user: {
          include: {
            personalInformation: true,
          },
        },
        event: true,
      },
    });

    return NextResponse.json(attendance, { status: 201 });
  } catch (error) {
    console.error('Error recording attendance:', error);
    return NextResponse.json(
      { error: 'Failed to record attendance' },
      { status: 500 }
    );
  }
}

// GET - Fetch attendance records with filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const eventId = searchParams.get('eventId');
    const userId = searchParams.get('userId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const onlyRegular = searchParams.get('onlyRegular') === 'true';
    const recurrence = searchParams.get('recurrence'); // weekly, monthly

    const where: any = {};

    if (eventId) {
      where.eventId = parseInt(eventId);
    }

    if (userId) {
      where.userId = parseInt(userId);
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

    // Filter by regular events
    if (onlyRegular || recurrence) {
      where.event = {
        isRegular: true,
      };
      if (recurrence) {
        where.event.recurrence = recurrence;
      }
    }

    const attendances = await prisma.eventAttendance.findMany({
      where,
      include: {
        user: {
          include: {
            personalInformation: true,
          },
        },
        event: true,
      },
      orderBy: {
        date: 'desc',
      },
    });

    return NextResponse.json(attendances);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch attendance records' },
      { status: 500 }
    );
  }
}
