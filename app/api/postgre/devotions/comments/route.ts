import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/middleware/auth";

// POST - create a new comment
export async function POST(request: NextRequest) {
  try {
    const currentUserId: number | null = verifyAuth(request);
    if (!currentUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { devotionId, comment } = await request.json();
    if (!devotionId || !comment || typeof comment !== "string") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const newComment = await prisma.devotionComment.create({
      data: {
        comment,
        devotion: { connect: { id: devotionId } },
        user: { connect: { id: currentUserId } },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            personalInformation: { select: { profileImage: true } },
          },
        },
      },
    });

    return NextResponse.json({ data: newComment }, { status: 201 });
  } catch (error: unknown) {
    console.error("Create comment error:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
