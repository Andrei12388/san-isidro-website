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
  
    const activityId = parseInt(id);

   const authUser = await verifyAuth(request); // <-- await here
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUserId = authUser.userId; // <-- extract userId from object


    const activity = await prisma.ministryActivities.findUnique({
      where: { id: activityId },
      include: {
        organizer: { select: { id: true, name: true, email: true } },
        outreach: { select: { id: true, name: true, location: true } },
        attendances: { select: { id: true, userId: true, isPresent: true } },
      },
    });

    if (!activity) {
      return NextResponse.json(
        { error: "Ministry activity not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ data: activity }, { status: 200 });
  } catch (error) {
    console.error("Get ministry activity error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// ------------------ PUT ------------------
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
   
    const activityId = parseInt(id);

   const authUser = await verifyAuth(request); // <-- await here
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUserId = authUser.userId; // <-- extract userId from object


    const activity = await prisma.ministryActivities.findUnique({
      where: { id: activityId },
    });

    if (!activity || activity.organizerId !== currentUserId) {
      return NextResponse.json(
        { error: "Unauthorized to update this activity" },
        { status: 403 },
      );
    }

    const body = await request.json();

    const updated = await prisma.ministryActivities.update({
      where: { id: activityId },
      data: body,
      include: {
        organizer: { select: { id: true, name: true, email: true } },
        outreach: { select: { id: true, name: true, location: true } },
      },
    });

    return NextResponse.json(
      { data: updated, message: "Ministry activity updated" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Update ministry activity error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// ------------------ DELETE ------------------
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
  
    const activityId = parseInt(id);

   const authUser = await verifyAuth(request); // <-- await here
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUserId = authUser.userId; // <-- extract userId from object


    const activity = await prisma.ministryActivities.findUnique({
      where: { id: activityId },
    });

    if (!activity || activity.organizerId !== currentUserId) {
      return NextResponse.json(
        { error: "Unauthorized to delete this activity" },
        { status: 403 },
      );
    }

    await prisma.ministryActivities.delete({ where: { id: activityId } });

    // 204 No Content responses should not have a body
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Delete ministry activity error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
