import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/middleware/auth";
import { hashPassword } from "@/utils/password";

/* GET — Fetch all users with discipline info */
export async function GET(request: NextRequest) {
  try {
    const currentUserId = verifyAuth(request);

    if (!currentUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const skip = Number(request.nextUrl.searchParams.get("skip") ?? 0);
    const take = Number(request.nextUrl.searchParams.get("take") ?? 100);

   const users = await prisma.user.findMany({
  skip,
  take,
  include: {
    personalInformation: true,
    discipleInformation: true,
    ministryMemberships: {
      where: { status: "APPROVED" },
      include: { ministry: true },
    },
  },
  orderBy: { createdAt: "desc" },
});

const mapped = users.map((u) => {
  const addressParts = [
    u.personalInformation?.houseNumber,
    u.personalInformation?.barangay,
    u.personalInformation?.city,
    u.personalInformation?.country,
  ].filter(Boolean);
  const address = addressParts.length > 0 ? addressParts.join(", ") : "N/A";

  function getAge(birthday: Date | null | undefined): number {
    if (!birthday) return 0;
    const today = new Date();
    let age = today.getFullYear() - birthday.getFullYear();
    const hasHadBirthdayThisYear =
      today.getMonth() > birthday.getMonth() ||
      (today.getMonth() === birthday.getMonth() &&
        today.getDate() >= birthday.getDate());
    if (!hasHadBirthdayThisYear) age--;
    return age;
  }

  return {
    id: u.id,
    name: u.name,
    role: u.role,
    email: u.email,
    age: getAge(u.personalInformation?.birthday),
    gender: u.personalInformation?.gender || "N/A",
    phone: u.personalInformation?.phone || "N/A",
    address,
    level: u.discipleInformation?.level || "disciple",
    group_name: u.discipleInformation?.groupName || "N/A",
    mentor_id: u.discipleInformation?.mentorId || 0,
    image: u.personalInformation?.profileImage || "",
    birthday: u.personalInformation?.birthday
      ? new Date(u.personalInformation.birthday).toISOString().split("T")[0]
      : null,
    ministries: u.ministryMemberships?.map((m) => ({
      id: m.ministry.id,
      name: m.ministry.name,
      role: m.role ?? null,
      status: m.status,
      joinedAt: m.joinedAt,
    })) || [],
  };
});

    return NextResponse.json({ data: mapped }, { status: 200 });
  } catch (error: unknown) {
    console.error("Get users error:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/* POST — Create a new user */
export async function POST(request: NextRequest) {
  try {
    const currentUserId = await verifyAuth(request);
    const currentUser = await verifyAuth(request);

if (!currentUser || currentUser.role !== "ADMIN") {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

    if (!currentUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 },
      );
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "MEMBER",
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      { data: newUser, message: "User created successfully" },
      { status: 201 },
    );
  } catch (error: unknown) {
    console.error("Create user error:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
