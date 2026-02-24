import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/middleware/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUserId = verifyAuth(request);
    const devotionId = parseInt(params.id);

    if (!currentUserId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const devotion = await prisma.devotion.findUnique({
      where: { id: devotionId },
    });

    if (!devotion || devotion.userId !== currentUserId) {
      return NextResponse.json(
        { error: "Devotion not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: devotion }, { status: 200 });
  } catch (error) {
    console.error("Get devotion error:", error);
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
    const devotionId = parseInt(params.id);

    if (!currentUserId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const devotion = await prisma.devotion.findUnique({
      where: { id: devotionId },
    });

    if (!devotion || devotion.userId !== currentUserId) {
      return NextResponse.json(
        { error: "Devotion not found" },
        { status: 404 }
      );
    }

    const body = await request.json();

    const updated = await prisma.devotion.update({
      where: { id: devotionId },
      data: body,
    });

    return NextResponse.json(
      { data: updated, message: "Devotion updated" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update devotion error:", error);
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
    const devotionId = parseInt(params.id);

    if (!currentUserId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const devotion = await prisma.devotion.findUnique({
      where: { id: devotionId },
    });

    if (!devotion || devotion.userId !== currentUserId) {
      return NextResponse.json(
        { error: "Devotion not found" },
        { status: 404 }
      );
    }

    await prisma.devotion.delete({
      where: { id: devotionId },
    });

    return NextResponse.json(
      { message: "Devotion deleted" },
      { status: 204 }
    );
  } catch (error) {
    console.error("Delete devotion error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
