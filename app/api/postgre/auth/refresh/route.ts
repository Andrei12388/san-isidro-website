import { NextRequest, NextResponse } from "next/server";
import { verifyRefreshToken, createAccessToken } from "@/utils/jwt";

export async function POST(request: NextRequest) {
  try {
    // Get refresh token from cookie or body
    const cookies = request.cookies;
    let refreshToken = cookies.get("refreshToken")?.value;

    if (!refreshToken) {
      const body = await request.json();
      refreshToken = body.refreshToken;
    }

    if (!refreshToken) {
      return NextResponse.json(
        { error: "Refresh token is required" },
        { status: 401 },
      );
    }

    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      return NextResponse.json(
        { error: "Invalid or expired refresh token" },
        { status: 401 },
      );
    }

    // Create new access token
    const newAccessToken = createAccessToken(payload.userId, payload.role);

    return NextResponse.json(
      {
        accessToken: newAccessToken,
        tokenType: "Bearer",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Refresh token error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
