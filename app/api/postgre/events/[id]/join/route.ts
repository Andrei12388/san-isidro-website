import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
  params: { id: string };
}

/**
 * POST → join event
 */
export async function POST(req: NextRequest, { params }: Params) {
  const eventId = Number(params.id);
  const { userId } = await req.json();

  const join = await prisma.eventAttendee.create({
    data: {
      eventId,
      userId,
    },
  });

  return NextResponse.json(join);
}

/**
 * DELETE → leave event
 */
export async function DELETE(req: NextRequest, { params }: Params) {
  const eventId = Number(params.id);
  const { userId } = await req.json();

  await prisma.eventAttendee.delete({
    where: {
      eventId_userId: {
        eventId,
        userId,
      },
    },
  });

  return NextResponse.json({ message: "Left event" });
}