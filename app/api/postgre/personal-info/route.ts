import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/middleware/auth";
import type { PersonalInformation, User, DiscipleInformation, Prisma } from "@prisma/client";

// Flattened response type
type FlattenedPersonalInfo = PersonalInformation & {
  user: User & {
    discipleInformation: DiscipleInformation | null;
  };
  level: string | undefined;
  groupName: string | null;
};

// Helper to flatten disciple info
const formatPersonalInfo = (
  personalInfo: PersonalInformation & { user: User & { discipleInformation: DiscipleInformation | null } }
): FlattenedPersonalInfo => {
  const discipleInfo = personalInfo.user.discipleInformation;
  return {
    ...personalInfo,
    user: personalInfo.user,
    level: discipleInfo?.level ?? undefined,
    groupName: discipleInfo?.groupName ?? null,
  };
};


// ------------------- GET -------------------
export async function GET(request: NextRequest) {
  try {
    const currentUserId = verifyAuth(request);
    if (!currentUserId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const personalInfo = await prisma.personalInformation.findUnique({
      where: { userId: currentUserId },
      include: { user: { include: { discipleInformation: true } } },
    });

    if (!personalInfo)
      return NextResponse.json({ error: "Personal information not found" }, { status: 404 });

    return NextResponse.json({ data: formatPersonalInfo(personalInfo) }, { status: 200 });
  } catch (error) {
    console.error("Get personal info error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ------------------- POST -------------------
export async function POST(request: NextRequest) {
  try {
    const currentUserId = verifyAuth(request);
    if (!currentUserId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body: Partial<PersonalInformation> & { birthday?: string } = await request.json();
    const birthdayDate = body.birthday ? new Date(body.birthday) : null;

    const personalInfo = await prisma.personalInformation.upsert({
      where: { userId: currentUserId },
      update: {
        firstName: body.firstName ?? null,
        middleName: body.middleName ?? null,
        lastName: body.lastName ?? null,
        phone: body.phone ?? null,
        birthday: birthdayDate,
        gender: body.gender ?? null,
        houseNumber: body.houseNumber ?? null,
        city: body.city ?? null,
        barangay: body.barangay ?? null,
        country: body.country ?? null,
        bio: body.bio ?? null,
        profileImage: body.profileImage ?? null,
      },
      create: {
        userId: currentUserId,
        firstName: body.firstName ?? null,
        middleName: body.middleName ?? null,
        lastName: body.lastName ?? null,
        phone: body.phone ?? null,
        birthday: birthdayDate,
        gender: body.gender ?? null,
        houseNumber: body.houseNumber ?? null,
        city: body.city ?? null,
        barangay: body.barangay ?? null,
        country: body.country ?? null,
        bio: body.bio ?? null,
        profileImage: body.profileImage ?? null,
      },
      include: { user: { include: { discipleInformation: true } } },
    });

    return NextResponse.json(
      { data: formatPersonalInfo(personalInfo), message: "Personal information created" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create personal info error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ------------------- PUT -------------------

export async function PUT(request: NextRequest) {
  try {
    const currentUserId = verifyAuth(request);
    if (!currentUserId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body: Partial<PersonalInformation> & { birthday?: string; level?: string; groupName?: string } =
      await request.json();

    const birthdayDate = body.birthday ? new Date(body.birthday) : null;

    // 1️⃣ Update personal information
    const updatedPersonalInfo = await prisma.personalInformation.update({
      where: { userId: currentUserId },
      data: {
        firstName: body.firstName ?? null,
        middleName: body.middleName ?? null,
        lastName: body.lastName ?? null,
        phone: body.phone ?? null,
        birthday: birthdayDate,
        gender: body.gender ?? null,
        houseNumber: body.houseNumber ?? null,
        city: body.city ?? null,
        barangay: body.barangay ?? null,
        country: body.country ?? null,
        bio: body.bio ?? null,
        profileImage: body.profileImage ?? null,
      }as Prisma.PersonalInformationUpdateInput,
    });

    // 2️⃣ Upsert disciple information (level & groupName)
    const discipleInfo = await prisma.discipleInformation.upsert({
      where: { userId: currentUserId },
      create: {
        userId: currentUserId,
        level: body.level ?? undefined,
        groupName: body.groupName ?? null,
      },
      update: {
        level: body.level ?? undefined,
        groupName: body.groupName ?? undefined,
      },
    });

    // 3️⃣ Fetch and return full flattened info with included relations
    const personalInfoWithRelations = await prisma.personalInformation.findUnique({
      where: { userId: currentUserId },
      include: { user: { include: { discipleInformation: true } } },
    });

    if (!personalInfoWithRelations)
      return NextResponse.json({ error: "Failed to fetch updated personal info" }, { status: 500 });

    return NextResponse.json(
      { data: formatPersonalInfo(personalInfoWithRelations), message: "Personal information updated" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update personal info error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ------------------- DELETE -------------------
export async function DELETE(request: NextRequest) {
  try {
    const currentUserId = verifyAuth(request);
    if (!currentUserId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const deleted = await prisma.personalInformation.delete({
      where: { userId: currentUserId },
      include: { user: { include: { discipleInformation: true } } },
    });

    return NextResponse.json(
      { data: formatPersonalInfo(deleted), message: "Personal information deleted" },
      { status: 200 } // 204 can't have a body
    );
  } catch (error) {
    console.error("Delete personal info error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}