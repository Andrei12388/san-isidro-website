import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/middleware/auth";
import { hashPassword } from "@/utils/password";

// ------------------ GET ------------------
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
     const { id } = await params; // unwrap
  const userId = parseInt(id, 10);
    const auth = await verifyAuth(req);

    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (auth.userId !== userId && auth.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, createdAt: true, updatedAt: true, role: true },
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json({ data: user }, { status: 200 });
  } catch (error) {
    console.error("GET user error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ------------------ PUT ------------------
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
  const { id } = await params; // unwrap
  const userId = parseInt(id, 10);
    const auth = await verifyAuth(req);

    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (auth.userId !== userId && auth.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { name, email, password } = body;

    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (password) updateData.password = await hashPassword(password);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: { id: true, name: true, email: true, updatedAt: true },
    });

    return NextResponse.json({ data: updatedUser, message: "User updated successfully" }, { status: 200 });
  } catch (error) {
    console.error("PUT user error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ------------------ PATCH (role only) ------------------
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
     const { id } = await params; // unwrap
  const userId = parseInt(id, 10);
    const auth = await verifyAuth(req);

    if (!auth || auth.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { role } = body;

    if (!role) return NextResponse.json({ error: "Role is required" }, { status: 400 });

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    });

    return NextResponse.json({ data: updatedUser }, { status: 200 });
  } catch (error) {
    console.error("PATCH user error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ------------------ DELETE ------------------
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
     const { id } = await params; // unwrap
  const userId = parseInt(id, 10);
    const auth = await verifyAuth(req);

    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (auth.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await prisma.user.delete({ where: { id: userId } });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("DELETE user error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}