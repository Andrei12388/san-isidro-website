// pages/api/postgre/ministries/[id]/status.ts
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/middleware/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
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

  // Check if user is a member of this ministry
  const member = await prisma.ministryMember.findUnique({
    where: {
      userId_ministryId: {
        userId: auth.userId,
        ministryId,
      },
    },
  });

  if (!member) {
    return NextResponse.json({ status: "NOT_JOINED" });
  }

  return NextResponse.json({ status: member.status }); // PENDING | APPROVED | REJECTED
}