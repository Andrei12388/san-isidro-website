import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/middleware/auth";
import { MinistryStatus } from "@/prisma/generated/prisma/enums";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const ministryId = parseInt(resolvedParams.id);

  if (isNaN(ministryId)) {
    return NextResponse.json({ error: "Invalid ministry ID" }, { status: 400 });
  }

  // Verify authentication
  const auth = await verifyAuth(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if user already joined
  const existing = await prisma.ministryMember.findUnique({
    where: {
      userId_ministryId: {
        userId: auth.userId,
        ministryId,
      },
    },
  });

  if (existing) {
    return NextResponse.json({ status: existing.status });
  }

  // Create new ministry member with pending status
  const member = await prisma.ministryMember.create({
    data: {
      userId: auth.userId,
      ministryId,
      status: MinistryStatus.PENDING,
    },
  });

  return NextResponse.json({ data: member });
}