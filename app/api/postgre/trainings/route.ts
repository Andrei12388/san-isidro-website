import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/middleware/auth";

export async function POST(request: NextRequest) {
  try {
    const currentUserId = verifyAuth(request);

    if (!currentUserId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const training = await prisma.training.create({
      data: {
        userId: currentUserId,
        ...body,
      },
      include: {
        category: {
          select: { id: true, name: true, type: true },
        },
      },
    });

    return NextResponse.json(
      { data: training, message: "Training created" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create training error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const currentUserId = verifyAuth(request);

    if (!currentUserId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const skip = parseInt(request.nextUrl.searchParams.get("skip") || "0");
    const take = parseInt(request.nextUrl.searchParams.get("take") || "100");

    const trainings = await prisma.training.findMany({
      where: { userId: currentUserId },
      skip,
      take,
      include: {
        category: {
          select: { id: true, name: true, type: true },
        },
      },
      orderBy: { trainingDate: "desc" },
    });

    return NextResponse.json({ data: trainings }, { status: 200 });
  } catch (error) {
    console.error("Get trainings error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
