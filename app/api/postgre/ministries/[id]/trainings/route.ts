import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  // Await params if it's a Promise
  const resolvedParams = await params;

  const ministryId = parseInt(resolvedParams.id);

  if (isNaN(ministryId)) {
    return NextResponse.json(
      { error: "Invalid ministry ID" },
      { status: 400 }
    );
  }

  const trainings = await prisma.ministryTraining.findMany({
    where: { ministryId },
  });

  return NextResponse.json({ data: trainings });
}