import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/middleware/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUserId = verifyAuth(request);
    const attendanceId = parseInt(params.id);

    if (!currentUserId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const attendance = await prisma.attendanceInformation.findUnique({
      where: { id: attendanceId },
      include: {
        ministryActivity: {
          select: { id: true, title: true, date: true },
        },
        training: {
          select: { id: true, title: true },
        },
      },
    });

    if (!attendance || attendance.userId !== currentUserId) {
      return NextResponse.json(
        { error: "Attendance not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: attendance }, { status: 200 });
  } catch (error) {
    console.error("Get attendance error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUserId = verifyAuth(request);
    const attendanceId = parseInt(params.id);

    if (!currentUserId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const attendance = await prisma.attendanceInformation.findUnique({
      where: { id: attendanceId },
    });

    if (!attendance || attendance.userId !== currentUserId) {
      return NextResponse.json(
        { error: "Attendance not found" },
        { status: 404 }
      );
    }

    const body = await request.json();

    const updated = await prisma.attendanceInformation.update({
      where: { id: attendanceId },
      data: body,
      include: {
        ministryActivity: {
          select: { id: true, title: true, date: true },
        },
        training: {
          select: { id: true, title: true },
        },
      },
    });

    return NextResponse.json(
      { data: updated, message: "Attendance updated" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update attendance error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUserId = verifyAuth(request);
    const attendanceId = parseInt(params.id);

    if (!currentUserId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const attendance = await prisma.attendanceInformation.findUnique({
      where: { id: attendanceId },
    });

    if (!attendance || attendance.userId !== currentUserId) {
      return NextResponse.json(
        { error: "Attendance not found" },
        { status: 404 }
      );
    }

    await prisma.attendanceInformation.delete({
      where: { id: attendanceId },
    });

    return NextResponse.json(
      { message: "Attendance deleted" },
      { status: 204 }
    );
  } catch (error) {
    console.error("Delete attendance error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
