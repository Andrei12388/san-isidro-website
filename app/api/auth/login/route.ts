import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export const authLoginApi = "https://isidro-webapi.onrender.com/api/auth/login"

export async function POST(req: Request) {
  console.log("calling route.ts login");

  const { email, password } = await req.json();

  // call external API
  const response = await fetch(authLoginApi, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const result = await response.json();

  // store access_token in cookie
  const cookieStore = await cookies();

  cookieStore.set("access_token", result.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  //store id in cookie
  cookieStore.set("user_id", result.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  // if you want to store user info in memory (not in cookie)
  const cookieData = {
    id: result.id,
    access_token: result.access_token,
  };

  console.log("Cookie data:", cookieData);

  return NextResponse.json(result);
}
