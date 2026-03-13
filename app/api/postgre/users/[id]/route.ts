import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/middleware/auth";
import { hashPassword } from "@/utils/password";

// ------------------ GET ------------------
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const currentUserId = verifyAuth(request);
    const userId = parseInt(id);
    const auth = await verifyAuth(request);
    // User can only access their own data
  if (!auth) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

if (auth.userId !== userId && auth.role !== "ADMIN") {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ data: user }, { status: 200 });
  } catch (error) {
    console.error("Get user error:", error);
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
    const currentUserId = verifyAuth(request);
    const userId = parseInt(id);
    const auth = await verifyAuth(request);

    if (!currentUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!auth) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

if (auth.userId !== userId && auth.role !== "ADMIN") {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

    const body = await request.json();
    const { name, email, password } = body;

    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (password) updateData.password = await hashPassword(password);

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: { id: true, name: true, email: true, updatedAt: true },
    });

    return NextResponse.json(
      { data: user, message: "User updated successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Update user error:", error);
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
    const currentUserId = verifyAuth(request);
    const userId = parseInt(id);
    const auth = await verifyAuth(request);

    if (!currentUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

   if (!auth) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

if (auth.role !== "ADMIN") {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

    await prisma.user.delete({ where: { id: userId } });

    // 204 No Content responses should not have a body
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
