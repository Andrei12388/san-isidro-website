import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/utils/jwt";

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    const payload = verifyAccessToken(token);

    if (!payload) {
      return NextResponse.json(
        { valid: false, error: "Invalid or expired token" },
        { status: 401 },
      );
    }

    return NextResponse.json(
      {
        valid: true,
        userId: payload.userId,
        message: "Token is valid",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Token verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
