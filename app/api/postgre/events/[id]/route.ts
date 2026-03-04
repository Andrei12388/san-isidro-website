import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/middleware/auth";

// ------------------ GET ------------------
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const currentUserId = verifyAuth(request);
    const eventId = parseInt(id);

    if (!currentUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        creator: {
          select: { id: true, name: true },
        },
        attendees: {
          include: {
            user: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ data: event }, { status: 200 });
  } catch (error) {
    console.error("Get event error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// ------------------ PUT (creator only) ------------------
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const currentUserId = verifyAuth(request);
    const eventId = parseInt(id);

    if (!currentUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    // only creator can update
    if (!event || event.creatorId !== currentUserId) {
      return NextResponse.json(
        { error: "Event not found or forbidden" },
        { status: 404 },
      );
    }

    const body = await request.json();

    const updated = await prisma.event.update({
      where: { id: eventId },
      data: {
        title: body.title,
        description: body.description,
        image: body.image,
        start: body.start ? new Date(body.start) : undefined,
        end: body.end ? new Date(body.end) : undefined,
      },
    });

    return NextResponse.json(
      { data: updated, message: "Event updated" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Update event error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// ------------------ DELETE (creator only) ------------------
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const currentUserId = verifyAuth(request);
    const eventId = parseInt(id);

    if (!currentUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    // only creator can delete
    if (!event || event.creatorId !== currentUserId) {
      return NextResponse.json(
        { error: "Event not found or forbidden" },
        { status: 404 },
      );
    }

    await prisma.event.delete({
      where: { id: eventId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Delete event error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}