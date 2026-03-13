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

    const activity = await prisma.ministryActivities.create({
      data: {
        organizerId: currentUserId,
        ...body,
      },
      include: {
        organizer: {
          select: { id: true, name: true, email: true },
        },
        outreach: {
          select: { id: true, name: true, location: true },
        },
      },
    });

    return NextResponse.json(
      { data: activity, message: "Ministry activity created" },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create ministry activity error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const currentUserId = verifyAuth(request);

    if (!currentUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const skip = parseInt(request.nextUrl.searchParams.get("skip") || "0");
    const take = parseInt(request.nextUrl.searchParams.get("take") || "100");

    const activities = await prisma.ministryActivities.findMany({
      skip,
      take,
      include: {
        organizer: {
          select: { id: true, name: true, email: true },
        },
        outreach: {
          select: { id: true, name: true, location: true },
        },
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json({ data: activities }, { status: 200 });
  } catch (error) {
    console.error("Get ministry activities error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
