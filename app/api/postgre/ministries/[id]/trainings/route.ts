import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  const { id } = await params;
  const ministryId = parseInt(id);

  if (isNaN(ministryId)) {
    return NextResponse.json({ error: "Invalid ministry ID" }, { status: 400 });
  }

  const trainings = await prisma.ministryTraining.findMany({
    where: { ministryId },
    include: {
      completions: { include: { member: { include: { user: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ data: trainings });
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  const { id } = await params;
  const ministryId = parseInt(id);

  if (isNaN(ministryId)) {
    return NextResponse.json({ error: "Invalid ministry ID" }, { status: 400 });
  }

  const body = await req.json();
  const { title, description } = body;

  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const training = await prisma.ministryTraining.create({
    data: {
      ministryId,
      title,
      description,
    },
  });

  return NextResponse.json({ data: training });
}