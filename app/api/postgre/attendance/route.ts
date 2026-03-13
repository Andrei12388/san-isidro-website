import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/middleware/auth";

export async function POST(request: NextRequest) {
  try {
    const currentUserId = verifyAuth(request);

    if (!currentUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const attendance = await prisma.attendanceInformation.create({
      data: {
        userId: currentUserId,
        ...body,
      },
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
      { data: attendance, message: "Attendance created" },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create attendance error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const authUser = await verifyAuth(request); // <-- await here
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUserId = authUser.userId; // <-- extract userId from object


    const skip = parseInt(request.nextUrl.searchParams.get("skip") || "0");
    const take = parseInt(request.nextUrl.searchParams.get("take") || "100");

    const attendances = await prisma.attendanceInformation.findMany({
      where: { userId: currentUserId },
      skip,
      take,
      include: {
        ministryActivity: {
          select: { id: true, title: true, date: true },
        },
        training: {
          select: { id: true, title: true },
        },
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json({ data: attendances }, { status: 200 });
  } catch (error) {
    console.error("Get attendance error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
