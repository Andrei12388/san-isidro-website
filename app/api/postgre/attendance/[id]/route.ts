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
    
    const attendanceId = parseInt(id);

    const authUser = await verifyAuth(request); // <-- await here
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUserId = authUser.userId; // <-- extract userId from object


    const attendance = await prisma.attendanceInformation.findUnique({
      where: { id: attendanceId },
      include: {
        ministryActivity: { select: { id: true, title: true, date: true } },
        training: { select: { id: true, title: true } },
      },
    });

    if (!attendance || attendance.userId !== currentUserId) {
      return NextResponse.json(
        { error: "Attendance not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ data: attendance }, { status: 200 });
  } catch (error) {
    console.error("Get attendance error:", error);
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
    
    const attendanceId = parseInt(id);

    const authUser = await verifyAuth(request); // <-- await here
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUserId = authUser.userId; // <-- extract userId from object


    const attendance = await prisma.attendanceInformation.findUnique({
      where: { id: attendanceId },
    });

    if (!attendance || attendance.userId !== currentUserId) {
      return NextResponse.json(
        { error: "Attendance not found" },
        { status: 404 },
      );
    }

    const body = await request.json();

    const updated = await prisma.attendanceInformation.update({
      where: { id: attendanceId },
      data: body,
      include: {
        ministryActivity: { select: { id: true, title: true, date: true } },
        training: { select: { id: true, title: true } },
      },
    });

    return NextResponse.json(
      { data: updated, message: "Attendance updated" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Update attendance error:", error);
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
   
    const attendanceId = parseInt(id);

    const authUser = await verifyAuth(request); // <-- await here
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUserId = authUser.userId; // <-- extract userId from object


    const attendance = await prisma.attendanceInformation.findUnique({
      where: { id: attendanceId },
    });

    if (!attendance || attendance.userId !== currentUserId) {
      return NextResponse.json(
        { error: "Attendance not found" },
        { status: 404 },
      );
    }

    await prisma.attendanceInformation.delete({ where: { id: attendanceId } });

    // 204 No Content responses should not have a body
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Delete attendance error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
