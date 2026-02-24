import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/middleware/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUserId = verifyAuth(request);
    const trainingId = parseInt(params.id);

    if (!currentUserId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const training = await prisma.training.findUnique({
      where: { id: trainingId },
      include: {
        category: {
          select: { id: true, name: true, type: true },
        },
      },
    });

    if (!training || training.userId !== currentUserId) {
      return NextResponse.json(
        { error: "Training not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: training }, { status: 200 });
  } catch (error) {
    console.error("Get training error:", error);
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
    const trainingId = parseInt(params.id);

    if (!currentUserId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const training = await prisma.training.findUnique({
      where: { id: trainingId },
    });

    if (!training || training.userId !== currentUserId) {
      return NextResponse.json(
        { error: "Training not found" },
        { status: 404 }
      );
    }

    const body = await request.json();

    const updated = await prisma.training.update({
      where: { id: trainingId },
      data: body,
      include: {
        category: {
          select: { id: true, name: true, type: true },
        },
      },
    });

    return NextResponse.json(
      { data: updated, message: "Training updated" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update training error:", error);
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
    const trainingId = parseInt(params.id);

    if (!currentUserId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const training = await prisma.training.findUnique({
      where: { id: trainingId },
    });

    if (!training || training.userId !== currentUserId) {
      return NextResponse.json(
        { error: "Training not found" },
        { status: 404 }
      );
    }

    await prisma.training.delete({
      where: { id: trainingId },
    });

    return NextResponse.json(
      { message: "Training deleted" },
      { status: 204 }
    );
  } catch (error) {
    console.error("Delete training error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
