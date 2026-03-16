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

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  const { id, memberId } = await params;

  const ministryId = parseInt(id, 10);
  const mId = parseInt(memberId, 10);

  if (isNaN(ministryId) || isNaN(mId)) {
    return NextResponse.json({ error: "Invalid IDs" }, { status: 400 });
  }

  const body = await req.json();
  const { status } = body;

  if (!["APPROVED", "REJECTED"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  try {
    const updatedMember = await prisma.ministryMember.update({
      where: { id: mId },
      data: { status },
    });

    return NextResponse.json({ data: updatedMember });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }
}