import { useAuth } from "@/context/AuthContext";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Toggle completion for a training by a member
export async function POST(
  req: Request,
  { params }: { params: { trainingId: string } | Promise<{ trainingId: string }> }
) {
  console.log("Completion route hit");
  const { trainingId } = await params;
  const tId = parseInt(trainingId);

  if (isNaN(tId)) {
    return NextResponse.json({ error: "Invalid training ID" }, { status: 400 });
  }

  const body = await req.json();
  const { memberId, completed } = body;

  if (!memberId) {
    return NextResponse.json({ error: "memberId is required" }, { status: 400 });
  }

  const existing = await prisma.ministryTrainingCompletion.findUnique({
    where: { ministryMemberId_trainingId: { ministryMemberId: memberId, trainingId: tId } },
  });

  if (existing) {
    // Update existing completion
    const updated = await prisma.ministryTrainingCompletion.update({
      where: { id: existing.id },
      data: { completed, completedAt: completed ? new Date() : null },
    });
    return NextResponse.json({ data: updated });
  }

  // Create new completion
  const created = await prisma.ministryTrainingCompletion.create({
    data: {
      ministryMemberId: memberId,
      trainingId: tId,
      completed,
      completedAt: completed ? new Date() : null,
    },
  });

  return NextResponse.json({ data: created });
}