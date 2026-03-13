import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/middleware/auth";

export async function POST(request: NextRequest) {
  try {
    const currentUserId = verifyAuth(request);

    if (!currentUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const discipleInfo = await prisma.discipleInformation.create({
      data: {
        userId: currentUserId,
        ...body,
      },
    });

    return NextResponse.json(
      { data: discipleInfo, message: "Disciple information created" },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create disciple info error:", error);
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


    const discipleInfo = await prisma.discipleInformation.findUnique({
      where: { userId: currentUserId },
      include: {
        mentor: {
          select: { id: true, name: true, email: true },
        },
        outreach: {
          select: { id: true, name: true, location: true },
        },
      },
    });

    if (!discipleInfo) {
      return NextResponse.json(
        { error: "Disciple information not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ data: discipleInfo }, { status: 200 });
  } catch (error) {
    console.error("Get disciple info error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authUser = await verifyAuth(request); // <-- await here
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUserId = authUser.userId; // <-- extract userId from object


    const body = await request.json();

    const discipleInfo = await prisma.discipleInformation.update({
      where: { userId: currentUserId },
      data: body,
      include: {
        mentor: {
          select: { id: true, name: true, email: true },
        },
        outreach: {
          select: { id: true, name: true, location: true },
        },
      },
    });

    return NextResponse.json(
      { data: discipleInfo, message: "Disciple information updated" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Update disciple info error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authUser = await verifyAuth(request); // <-- await here
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUserId = authUser.userId; // <-- extract userId from object


    await prisma.discipleInformation.delete({
      where: { userId: currentUserId },
    });

    return NextResponse.json(
      { message: "Disciple information deleted" },
      { status: 204 },
    );
  } catch (error) {
    console.error("Delete disciple info error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
