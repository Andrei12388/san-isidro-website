import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/middleware/auth";

export async function POST(request: NextRequest) {
  try {
    const currentUserId = verifyAuth(request);

    if (!currentUserId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const personalInfo = await prisma.personalInformation.create({
      data: {
        userId: currentUserId,
        ...body,
      },
    });

    return NextResponse.json(
      { data: personalInfo, message: "Personal information created" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create personal info error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const currentUserId = verifyAuth(request);

    if (!currentUserId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const personalInfo = await prisma.personalInformation.findUnique({
      where: { userId: currentUserId },
    });

    if (!personalInfo) {
      return NextResponse.json(
        { error: "Personal information not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: personalInfo }, { status: 200 });
  } catch (error) {
    console.error("Get personal info error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const currentUserId = verifyAuth(request);

    if (!currentUserId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const personalInfo = await prisma.personalInformation.update({
      where: { userId: currentUserId },
      data: body,
    });

    return NextResponse.json(
      { data: personalInfo, message: "Personal information updated" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update personal info error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const currentUserId = verifyAuth(request);

    if (!currentUserId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await prisma.personalInformation.delete({
      where: { userId: currentUserId },
    });

    return NextResponse.json(
      { message: "Personal information deleted" },
      { status: 204 }
    );
  } catch (error) {
    console.error("Delete personal info error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
