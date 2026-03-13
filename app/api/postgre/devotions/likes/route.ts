import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/middleware/auth";

export async function POST(request: NextRequest) {
  try {
     const authUser = await verifyAuth(request); // <-- await here
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUserId = authUser.userId; // <-- extract userId from object

    const { devotionId } = await request.json();
    if (!devotionId) {
      return NextResponse.json(
        { error: "Missing devotionId" },
        { status: 400 },
      );
    }

    // check if user already liked
    const existing = await prisma.devotionLike.findUnique({
      where: { userId_devotionId: { userId: currentUserId, devotionId } },
    });

    let userLiked = false;

    if (existing) {
      // remove like
      await prisma.devotionLike.delete({ where: { id: existing.id } });
    } else {
      // create like
      await prisma.devotionLike.create({
        data: {
          user: { connect: { id: currentUserId } },
          devotion: { connect: { id: devotionId } },
        },
      });
      userLiked = true;
    }

    const likesCount = await prisma.devotionLike.count({
      where: { devotionId },
    });

    return NextResponse.json({ likesCount, userLiked }, { status: 200 });
  } catch (error: unknown) {
    console.error("Toggle like error:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
