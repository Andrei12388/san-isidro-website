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

    const category = await prisma.trainingCategory.create({
      data: body,
    });

    return NextResponse.json(
      { data: category, message: "Training category created" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create training category error:", error);
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

    const categories = await prisma.trainingCategory.findMany({
      skip,
      take,
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ data: categories }, { status: 200 });
  } catch (error) {
    console.error("Get training categories error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
