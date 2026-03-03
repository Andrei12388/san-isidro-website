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
    const devotionId = parseInt(id);

    if (!currentUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const devotion = await prisma.devotion.findUnique({
      where: { id: devotionId },
    });

    if (!devotion || devotion.userId !== currentUserId) {
      return NextResponse.json(
        { error: "Devotion not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ data: devotion }, { status: 200 });
  } catch (error) {
    console.error("Get devotion error:", error);
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
    const currentUserId = verifyAuth(request);
    const devotionId = parseInt(id);

    if (!currentUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const devotion = await prisma.devotion.findUnique({
      where: { id: devotionId },
    });

    if (!devotion || devotion.userId !== currentUserId) {
      return NextResponse.json(
        { error: "Devotion not found" },
        { status: 404 },
      );
    }

    const body = await request.json();

    const updated = await prisma.devotion.update({
      where: { id: devotionId },
      data: body,
    });

    return NextResponse.json(
      { data: updated, message: "Devotion updated" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Update devotion error:", error);
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
    const currentUserId = verifyAuth(request);
    const devotionId = parseInt(id);

    if (!currentUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const devotion = await prisma.devotion.findUnique({
      where: { id: devotionId },
    });

    if (!devotion || devotion.userId !== currentUserId) {
      return NextResponse.json(
        { error: "Devotion not found" },
        { status: 404 },
      );
    }

    await prisma.devotion.delete({ where: { id: devotionId } });

    // 204 No Content responses should not have a body
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Delete devotion error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
