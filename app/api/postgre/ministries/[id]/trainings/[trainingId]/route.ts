import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string; trainingId: string } | Promise<{ id: string; trainingId: string }> }
) {
  const { id, trainingId } = await params;
  const ministryId = parseInt(id);
  const tId = parseInt(trainingId);

  if (isNaN(ministryId) || isNaN(tId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const body = await req.json();
  const { title, description } = body;

  const updated = await prisma.ministryTraining.update({
    where: { id: tId },
    data: { title, description },
  });

  return NextResponse.json({ data: updated });
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string; trainingId: string } | Promise<{ id: string; trainingId: string }> }
) {
  const { id, trainingId } = await params;
  const ministryId = parseInt(id);
  const tId = parseInt(trainingId);

  if (isNaN(ministryId) || isNaN(tId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  await prisma.ministryTraining.delete({ where: { id: tId } });

  return NextResponse.json({ message: "Training deleted successfully" });
}