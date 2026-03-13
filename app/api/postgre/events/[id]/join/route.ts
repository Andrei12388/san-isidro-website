import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/middleware/auth";

// In App Router, params can be a Promise
type RouteParams = { id: string };

/**
 * POST → join event
 */
export async function POST(
  req: NextRequest,
  context: { params: Promise<RouteParams> } // ✅ params is a Promise
) {
  try {
    const { id } = await context.params; // ✅ await it

    // Verify user
  const authUser = await verifyAuth(req); // <-- await here
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUserId = authUser.userId; // <-- extract userId from object


    // Parse event ID
    const eventId = parseInt(id, 10);
    if (isNaN(eventId)) {
      return NextResponse.json({ error: "Invalid event ID" }, { status: 400 });
    }

    // Prevent double-join
    const existing = await prisma.eventAttendee.findUnique({
      where: { eventId_userId: { eventId, userId: currentUserId } },
    });

    if (existing) {
      return NextResponse.json({ status: "already_joined" }, { status: 200 });
    }

    // Join event
    const join = await prisma.eventAttendee.create({
      data: { eventId, userId: currentUserId },
    });

    return NextResponse.json({ message: "joined", data: join });
  } catch (err) {
    console.error("Join event error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * DELETE → leave event
 */
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<RouteParams> } // ✅ also a Promise here
) {
  try {
    const { id } = await context.params; // ✅ await it

    // Verify user
   const authUser = await verifyAuth(req); // <-- await here
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUserId = authUser.userId; // <-- extract userId from object


    // Parse event ID
    const eventId = parseInt(id, 10);
    if (isNaN(eventId)) {
      return NextResponse.json({ error: "Invalid event ID" }, { status: 400 });
    }

    // Check if attendance exists
    const attendance = await prisma.eventAttendee.findUnique({
      where: { eventId_userId: { eventId, userId: currentUserId } },
    });

    if (!attendance) {
      return NextResponse.json({ error: "Not joined" }, { status: 404 });
    }

    // Delete attendance
    await prisma.eventAttendee.delete({
      where: { eventId_userId: { eventId, userId: currentUserId } },
    });

    return NextResponse.json({ status: "left" });
  } catch (err) {
    console.error("Leave event error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}