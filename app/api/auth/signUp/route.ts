import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const authSignupApi = "https://isidro-webapi.onrender.com/users/";

export async function POST(req: Request) {
  try {
    // Read the body once
    const body = await req.json();

    console.log("Received body:", body); // safe now

    const { fullname, email, password } = body;

    if (!fullname || !email || !password) {
      return NextResponse.json(
        { message: "Full name, email, and password are required" },
        { status: 400 }
      );
    }

    const response = await fetch("https://isidro-webapi.onrender.com/users/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fullname, // API expects "name"
        email,
        password,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { message: errorData.detail || "Signup failed" },
        { status: response.status }
      );
    }

    const result = await response.json();

    const cookieStore = await cookies();

    // Set cookies if returned
    if (result.access_token) {
      cookieStore.set("access_token", result.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    if (result.refresh_token) {
      cookieStore.set("refresh_token", result.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });
    }

    if (result.id) {
      cookieStore.set("user_id", String(result.id), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    return NextResponse.json({ success: true, user: result });

  } catch (err: any) {
    console.error("Signup error:", err);
    return NextResponse.json(
      { message: err.message },
      { status: 500 }
    );
  }
}
