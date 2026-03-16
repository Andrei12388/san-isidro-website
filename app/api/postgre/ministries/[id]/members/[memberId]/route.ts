import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  // unwrap the params promise
  const { id, memberId } = await params;

  const ministryId = parseInt(id, 10);
  const mId = parseInt(memberId, 10);

  if (isNaN(ministryId) || isNaN(mId)) {
    return NextResponse.json(
      { error: "Invalid ministry or member ID" },
      { status: 400 }
    );
  }

  const { status } = await req.json();
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
    console.error("PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to update member status" },
      { status: 500 }
    );
  }
}