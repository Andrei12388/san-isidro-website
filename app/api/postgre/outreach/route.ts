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


    const body = await request.json();

    const outreach = await prisma.outreach.create({
      data: body,
      include: {
        pastor: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json(
      { data: outreach, message: "Outreach created" },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create outreach error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const authUser = await verifyAuth(request); // <-- await here
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUserId = authUser.userId; // <-- extract userId from object


    const skip = parseInt(request.nextUrl.searchParams.get("skip") || "0");
    const take = parseInt(request.nextUrl.searchParams.get("take") || "100");

    const outreaches = await prisma.outreach.findMany({
      skip,
      take,
      include: {
        pastor: {
          select: { id: true, name: true, email: true },
        },
        disciples: {
          select: { id: true, userId: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ data: outreaches }, { status: 200 });
  } catch (error) {
    console.error("Get outreaches error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
