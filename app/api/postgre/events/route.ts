import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/middleware/auth";

// ------------------ GET all ------------------
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const allowRegistration = searchParams.get('allowRegistration');

    const where: any = {};
    
    // Filter by allowRegistration if specified
    if (allowRegistration === 'true') {
      where.allowRegistration = true;
    }

    const events = await prisma.event.findMany({
      where,
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
     const authUser = await verifyAuth(request); // <-- await here
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUserId = authUser.userId; // <-- extract userId from object


    const body = await request.json();

    const event = await prisma.event.create({
      data: {
        creatorId: currentUserId, // auto from auth (safer)
        title: body.title,
        description: body.description,
        image: body.image,
        location: body.location || "TBD",
        locationLatitude: body.locationLatitude ? parseFloat(body.locationLatitude) : null,
        locationLongitude: body.locationLongitude ? parseFloat(body.locationLongitude) : null,
        locationRadius: body.locationRadius ? parseFloat(body.locationRadius) : 100,
        allowRegistration: body.allowRegistration !== undefined ? body.allowRegistration : false,
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