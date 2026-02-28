import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/middleware/auth";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/* ===================== PUT ===================== */
export async function PUT(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const currentUserId = verifyAuth(request);
    if (!currentUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params; // ⭐ MUST await
    const commentId = Number(id);

    const { comment } = await request.json();
    if (!comment || typeof comment !== "string") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const existing = await prisma.devotionComment.findUnique({
      where: { id: commentId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    if (existing.userId !== currentUserId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await prisma.devotionComment.update({
      where: { id: commentId },
      data: { comment },
    });

    return NextResponse.json({ data: updated });
  } catch (error: unknown) {
    console.error("Update comment error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/* ===================== DELETE ===================== */
export async function DELETE(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const currentUserId = verifyAuth(request);
    if (!currentUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params; // ⭐ MUST await
    const commentId = Number(id);

    const existing = await prisma.devotionComment.findUnique({
      where: { id: commentId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    if (existing.userId !== currentUserId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.devotionComment.delete({
      where: { id: commentId },
    });

    return NextResponse.json({ message: "Comment deleted" });
  } catch (error: unknown) {
    console.error("Delete comment error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}