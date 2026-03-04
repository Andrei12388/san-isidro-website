import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Face enrollment endpoint - stores face descriptor for a user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, descriptor } = body;

    if (!userId || !descriptor) {
      return NextResponse.json(
        { error: 'userId and descriptor are required' },
        { status: 400 }
      );
    }

    // Validate descriptor is an array of numbers (128 dimensions)
    if (!Array.isArray(descriptor) || descriptor.length !== 128) {
      return NextResponse.json(
        { error: 'Invalid face descriptor. Must be an array of 128 numbers' },
        { status: 400 }
      );
    }

    // Store face descriptor in database as JSON string
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: {
        faceDescriptor: JSON.stringify(descriptor),
      },
    });

    console.log(`Face enrolled successfully for user ${userId}`);

    return NextResponse.json({
      success: true,
      message: 'Face enrolled successfully',
      userId: updatedUser.id,
    });
  } catch (error) {
    console.error('Error enrolling face:', error);
    return NextResponse.json(
      { error: 'Failed to enroll face data' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve stored face descriptor (for testing/debugging)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: { faceDescriptor: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const hasDescriptor = !!user.faceDescriptor;

    return NextResponse.json({
      hasDescriptor,
      descriptorLength: hasDescriptor ? JSON.parse(user.faceDescriptor!).length : 0,
    });
  } catch (error) {
    console.error('Error retrieving face descriptor:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve face data' },
      { status: 500 }
    );
  }
}
