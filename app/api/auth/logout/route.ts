import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "Logged out successfully",
  });

  const cookiesToClear = [
    "access_token",
    "refresh_token",
    "refreshToken",
    "sidebar_state",
    "user_id",
    "name",
    "email",
    "profileImage",
    "role",
  ];

  cookiesToClear.forEach((cookie) => {
    response.cookies.set(cookie, "", {
      expires: new Date(0),
      path: "/",
    });
  });

  return response;
}