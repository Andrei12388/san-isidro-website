import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/middleware/auth";

// ------------------ GET all ------------------
export async function GET(request: NextRequest) {
  try {

    const events = await prisma.event.findMany({
      orderBy: { start: "asc" },
      include: {
        creator: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ data: events });
  } catch (error) {
    console.error("List events error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// ------------------ CREATE ------------------
export async function POST(request: NextRequest) {
  try {
    const currentUserId = verifyAuth(request);

    if (!currentUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const event = await prisma.event.create({
      data: {
        creatorId: currentUserId, // auto from auth (safer)
        title: body.title,
        description: body.description,
        image: body.image,
        start: new Date(body.start),
        end: new Date(body.end),
      },
    });

    return NextResponse.json(
      { data: event, message: "Event created" },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create event error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}