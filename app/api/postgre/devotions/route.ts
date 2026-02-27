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
    console.log("Devotion POST body:", body);

    // build create data without spreading to avoid mismatched client types
    const createData: any = {
      title: body.title,
      content: body.content,
      image: body.image,
      scriptureReference: body.scriptureReference,
      devotionDate: body.devotionDate,
    };

    // connect the authenticated user explicitly
    createData.user = { connect: { id: currentUserId } };

    const devotion = await prisma.devotion.create({
      data: createData,
    });

    return NextResponse.json(
      { data: devotion, message: "Devotion created" },
      { status: 201 }
    );
  } catch (error: any) {
    // log full error stack and message
    console.error("Create devotion error:", error);
    const msg = error?.message || "Internal server error";
    return NextResponse.json(
      { error: msg },
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

    const devotions = await prisma.devotion.findMany({
      where: { userId: currentUserId },
      skip,
      take,
      orderBy: { devotionDate: "desc" },
    });

    return NextResponse.json({ data: devotions }, { status: 200 });
  } catch (error) {
    console.error("Get devotions error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
