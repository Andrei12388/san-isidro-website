import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {

    const events = await prisma.event.findMany({
      where: {
    allowRegistration: true,
  },
      include: {
        attendances: {
          include: {
            user: {
              include: {
                personalInformation: true,
              },
            },
          },
        },
      },
    });

    const chartData = events.map((event) => {
      let male = 0;
      let female = 0;

      event.attendances.forEach((att) => {
        if (!att.isPresent) return;
        const gender = att.user.personalInformation?.gender;
        if (gender === "male") male++;
        else if (gender === "female") female++;
      });

      return {
        date: event.start.toISOString().split("T")[0], // "YYYY-MM-DD"
        male,
        female,
        eventName: event.title
      };
    });

    // Sort by date
    chartData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return NextResponse.json({ data: chartData });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}