import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> } // note: Promise
) {
  // Unwrap the params promise
  const { id } = await params;

  const ministryId = parseInt(id, 10);
  if (isNaN(ministryId)) {
    return NextResponse.json({ error: "Invalid ministry ID" }, { status: 400 });
  }

  try {
    const members = await prisma.ministryMember.findMany({
      where: { ministryId }, // fetch all statuses
      include: {
        user: {
          select: {
            id: true,
            name: true,
            personalInformation: { select: { profileImage: true } },
          },
        },
        completions: { include: { training: true } },
      },
      orderBy: { id: "asc" },
    });

    return NextResponse.json({ data: members });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch members" }, { status: 500 });
  }
}