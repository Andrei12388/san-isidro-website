import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const getUserApi = "https://isidro-webapi.onrender.com/users/"

export async function GET() {
  const cookieStore = await cookies();
  const access_token = cookieStore.get("access_token")?.value ?? null;
  const userCookie = cookieStore.get("user_id")?.value;

  let user = null;
  if (userCookie) {
    try {
      user = JSON.parse(userCookie);
    } catch {
      user = null;
    }
  }

  return NextResponse.json({ access_token, user });
}
