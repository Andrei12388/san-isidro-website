import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Calculate Euclidean distance between two face descriptors
function euclideanDistance(descriptor1: number[], descriptor2: number[]): number {
  if (descriptor1.length !== descriptor2.length) {
    throw new Error('Descriptors must have the same length');
  }

  let sum = 0;
  for (let i = 0; i < descriptor1.length; i++) {
    const diff = descriptor1[i] - descriptor2[i];
    sum += diff * diff;
  }

  return Math.sqrt(sum);
}

// Face verification endpoint using face-api.js descriptors
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, eventId, descriptor, imageData } = body;

    if (!userId || !eventId || !descriptor) {
      return NextResponse.json(
        { error: 'userId, eventId, and descriptor are required' },
        { status: 400 }
      );
    }

    // Validate descriptor format
    if (!Array.isArray(descriptor) || descriptor.length !== 128) {
      return NextResponse.json(
        { error: 'Invalid face descriptor. Must be an array of 128 numbers' },
        { status: 400 }
      );
    }

    // Fetch stored face descriptor from database
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: { faceDescriptor: true, name: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (!user.faceDescriptor) {
      return NextResponse.json(
        {
          verified: false,
          confidence: 0,
          message: 'User has not enrolled face data. Please enroll first.',
        },
        { status: 400 }
      );
    }

    // Parse stored descriptor
    const storedDescriptor: number[] = JSON.parse(user.faceDescriptor);

    // Calculate distance between descriptors
    const distance = euclideanDistance(descriptor, storedDescriptor);

    // face-api.js face recognition distance threshold
    // Typical values:
    // - distance < 0.6: Same person (high confidence)
    // - distance 0.6-0.7: Possible match (medium confidence)
    // - distance > 0.7: Different person (low confidence)
    const VERIFICATION_THRESHOLD = 0.6;

    const verified = distance < VERIFICATION_THRESHOLD;
    
    // Convert distance to confidence score (0-1, where 1 is perfect match)
    // Using exponential decay: confidence = e^(-distance * 2)
    const confidence = Math.exp(-distance * 2);

    console.log(
      `Face verification for user ${userId} (${user.name}): distance=${distance.toFixed(4)}, threshold=${VERIFICATION_THRESHOLD}, verified=${verified}, confidence=${(confidence * 100).toFixed(2)}%`
    );

    return NextResponse.json({
      verified,
      confidence,
      distance,
      threshold: VERIFICATION_THRESHOLD,
      message: verified
        ? `Face verified successfully for ${user.name}`
        : `Face verification failed - distance ${distance.toFixed(4)} exceeds threshold ${VERIFICATION_THRESHOLD}`,
    });
  } catch (error) {
    console.error('Error in face verification:', error);
    return NextResponse.json(
      { error: 'Failed to process facial verification' },
      { status: 500 }
    );
  }
}

// GET endpoint to check if user has enrolled their face
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

    // Check if user has face descriptor stored
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

    const hasEnrolled = !!user.faceDescriptor;

    return NextResponse.json({
      hasEnrolled,
      message: hasEnrolled
        ? 'User has enrolled face data'
        : 'User needs to enroll face data first',
    });
  } catch (error) {
    console.error('Error checking face enrollment:', error);
    return NextResponse.json(
      { error: 'Failed to check face enrollment' },
      { status: 500 }
    );
  }
}
