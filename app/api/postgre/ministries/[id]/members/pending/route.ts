// app/api/postgre/ministries/[id]/members/pending/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const ministryId = parseInt(resolvedParams.id);

  if (isNaN(ministryId)) {
    return NextResponse.json({ error: "Invalid ministry ID" }, { status: 400 });
  }

  const pendingMembers = await prisma.ministryMember.findMany({
    where: {
      ministryId,
      status: "PENDING",
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          personalInformation: {
            select: { profileImage: true },
          },
        },
      },
    },
  });

  return NextResponse.json({ data: pendingMembers });
}