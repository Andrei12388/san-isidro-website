import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/utils/password";

// Helper to create default personal info for a new user
async function createDefaultPersonalInfo(userId: number) {
  return prisma.personalInformation.create({
    data: {
      userId,
      firstName: null,
      middleName: null,
      lastName: null,
      phone: null,
      birthday: null,
      gender: null,
      houseNumber: null,
      city: null,
      barangay: null,
      country: null,
      bio: null,
      profileImage: null,
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 },
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 },
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
      select: { id: true, name: true, email: true, createdAt: true },
    });

    // Automatically create personal info for the new user
    await createDefaultPersonalInfo(user.id);

    return NextResponse.json(
      { data: user, message: "User created successfully with personal info" },
      { status: 201 },
    );
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
