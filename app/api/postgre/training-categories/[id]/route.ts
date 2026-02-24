import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/middleware/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUserId = verifyAuth(request);
    const categoryId = parseInt(params.id);

    if (!currentUserId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const category = await prisma.trainingCategory.findUnique({
      where: { id: categoryId },
      include: {
        trainings: {
          select: { id: true, title: true },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Training category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: category }, { status: 200 });
  } catch (error) {
    console.error("Get training category error:", error);
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
    const categoryId = parseInt(params.id);

    if (!currentUserId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const updated = await prisma.trainingCategory.update({
      where: { id: categoryId },
      data: body,
    });

    return NextResponse.json(
      { data: updated, message: "Training category updated" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update training category error:", error);
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
    const categoryId = parseInt(params.id);

    if (!currentUserId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await prisma.trainingCategory.delete({
      where: { id: categoryId },
    });

    return NextResponse.json(
      { message: "Training category deleted" },
      { status: 204 }
    );
  } catch (error) {
    console.error("Delete training category error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
