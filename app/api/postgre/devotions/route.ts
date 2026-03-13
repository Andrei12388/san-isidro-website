import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/middleware/auth";

/* ============================= */
/* Types */
/* ============================= */

type DevotionBody = {
  title: string;
  content: string;
  image: string;
  scriptureReference?: string | null;
  devotionDate: string | Date;
};

/* ============================= */
/* POST — Create devotion */
/* ============================= */

export async function POST(request: NextRequest) {
  try {
     const authUser = await verifyAuth(request); // <-- await here
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUserId = authUser.userId; // <-- extract userId from object


    const body: DevotionBody = await request.json();
    console.log("Devotion POST body:", body);

    const createData = {
      title: body.title,
      content: body.content,
      image: body.image,
      scriptureReference: body.scriptureReference ?? null,
      devotionDate: new Date(body.devotionDate),

      user: {
        connect: { id: currentUserId },
      },
    };

    const devotion = await prisma.devotion.create({
      data: createData,
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

    return NextResponse.json(
      { data: devotion, message: "Devotion created" },
      { status: 201 },
    );
  } catch (error: unknown) {
    console.error("Create devotion error:", error);

    const message =
      error instanceof Error ? error.message : "Internal server error";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/* ============================= */
/* GET — Fetch devotions */
/* ============================= */

export async function GET(request: NextRequest) {
  try {
    const authUser = await verifyAuth(request); // <-- await here
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUserId = authUser.userId; // <-- extract userId from object


    const skip = Number(request.nextUrl.searchParams.get("skip") ?? 0);
    const take = Number(request.nextUrl.searchParams.get("take") ?? 100);
    const fetchAll = request.nextUrl.searchParams.get("all") === "true";

    const devotions = await prisma.devotion.findMany({
      where: fetchAll ? {} : { userId: currentUserId },
      skip,
      take,
      orderBy: { devotionDate: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            personalInformation: { select: { profileImage: true } },
          },
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                personalInformation: { select: { profileImage: true } },
              },
            },
          },
        },
        likes: true, // we only need the count and to check if current user liked
      },
    });

    // map/augment the result so the client has counts and a flag indicating
    // whether the currently authenticated user has liked each devotion
    const mapped = devotions.map((d) => {
      const likesCount = d.likes.length;
      const userLiked = d.likes.some((l) => l.userId === currentUserId);
      return {
        id: d.id,
        title: d.title,
        content: d.content,
        image: d.image,
        scriptureReference: d.scriptureReference,
        devotionDate: d.devotionDate,
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
        comments: d.comments.map((c) => ({
          id: c.id,
          userId: c.userId,
          devotionId: c.devotionId,
          comment: c.comment,
          createdAt: c.createdAt,
          updatedAt: c.updatedAt,
          user: c.user
            ? {
                id: c.user.id,
                name: c.user.name,
                profileImage: c.user.personalInformation?.profileImage || null,
              }
            : undefined,
        })),
        likesCount,
        userLiked,
        user: d.user
          ? {
              id: d.user.id,
              name: d.user.name,
              profileImage: d.user.personalInformation?.profileImage || null,
            }
          : undefined,
      };
    });

    return NextResponse.json({ data: mapped }, { status: 200 });
  } catch (error: unknown) {
    console.error("Get devotions error:", error);

    const message =
      error instanceof Error ? error.message : "Internal server error";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
