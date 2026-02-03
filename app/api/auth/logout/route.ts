import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  const cookieStore = await cookies();

  // delete cookies by setting empty value + expired date
  cookieStore.set("access_token", "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  });

  cookieStore.set("user_id", "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  });

  return NextResponse.json({
    success: true,
    message: "Logged out successfully",
  });
}
