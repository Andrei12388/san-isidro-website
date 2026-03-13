import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/middleware/auth";

// ------------------ GET ------------------
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
  
    const trainingId = parseInt(id);

  const authUser = await verifyAuth(request); // <-- await here
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUserId = authUser.userId; // <-- extract userId from object


    const training = await prisma.training.findUnique({
      where: { id: trainingId },
      include: { category: { select: { id: true, name: true, type: true } } },
    });

    if (!training || training.userId !== currentUserId) {
      return NextResponse.json(
        { error: "Training not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ data: training }, { status: 200 });
  } catch (error) {
    console.error("Get training error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// ------------------ PUT ------------------
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
   
    const trainingId = parseInt(id);
 const authUser = await verifyAuth(request); // <-- await here
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUserId = authUser.userId; // <-- extract userId from object


    const training = await prisma.training.findUnique({
      where: { id: trainingId },
    });

    if (!training || training.userId !== currentUserId) {
      return NextResponse.json(
        { error: "Training not found" },
        { status: 404 },
      );
    }

    const body = await request.json();

    const updated = await prisma.training.update({
      where: { id: trainingId },
      data: body,
      include: { category: { select: { id: true, name: true, type: true } } },
    });

    return NextResponse.json(
      { data: updated, message: "Training updated" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Update training error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// ------------------ DELETE ------------------
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    
    const trainingId = parseInt(id);

     const authUser = await verifyAuth(request); // <-- await here
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUserId = authUser.userId; // <-- extract userId from object


    const training = await prisma.training.findUnique({
      where: { id: trainingId },
    });

    if (!training || training.userId !== currentUserId) {
      return NextResponse.json(
        { error: "Training not found" },
        { status: 404 },
      );
    }

    await prisma.training.delete({ where: { id: trainingId } });

    // 204 No Content responses should not have a body
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Delete training error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
