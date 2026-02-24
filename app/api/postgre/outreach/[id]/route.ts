import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/middleware/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUserId = verifyAuth(request);
    const outreachId = parseInt(params.id);

    if (!currentUserId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const outreach = await prisma.outreach.findUnique({
      where: { id: outreachId },
      include: {
        pastor: {
          select: { id: true, name: true, email: true },
        },
        disciples: {
          select: {
            id: true,
            userId: true,
            level: true,
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        activities: {
          select: { id: true, title: true, date: true },
        },
      },
    });

    if (!outreach) {
      return NextResponse.json(
        { error: "Outreach not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: outreach }, { status: 200 });
  } catch (error) {
    console.error("Get outreach error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUserId = verifyAuth(request);
    const outreachId = parseInt(params.id);

    if (!currentUserId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const outreach = await prisma.outreach.findUnique({
      where: { id: outreachId },
    });

    if (!outreach || outreach.assignedPastor !== currentUserId) {
      return NextResponse.json(
        { error: "Unauthorized to update this outreach" },
        { status: 403 }
      );
    }

    const body = await request.json();

    const updated = await prisma.outreach.update({
      where: { id: outreachId },
      data: body,
      include: {
        pastor: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json(
      { data: updated, message: "Outreach updated" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update outreach error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUserId = verifyAuth(request);
    const outreachId = parseInt(params.id);

    if (!currentUserId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const outreach = await prisma.outreach.findUnique({
      where: { id: outreachId },
    });

    if (!outreach || outreach.assignedPastor !== currentUserId) {
      return NextResponse.json(
        { error: "Unauthorized to delete this outreach" },
        { status: 403 }
      );
    }

    await prisma.outreach.delete({
      where: { id: outreachId },
    });

    return NextResponse.json(
      { message: "Outreach deleted" },
      { status: 204 }
    );
  } catch (error) {
    console.error("Delete outreach error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
