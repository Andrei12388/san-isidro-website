import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const authLoginApi = "https://isidro-webapi.onrender.com/api/auth/login";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const response = await fetch(authLoginApi, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const result = await response.json();

    const cookieStore = await cookies();

    console.log("cookie fetch data", result, cookieStore)

    // ✅ access token
    cookieStore.set("access_token", result.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    // ✅ refresh token (NEW)
    

    // ✅ user id (KEEP OLD WORKING VERSION)
    cookieStore.set("user_id", String(result.id), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    
    // ✅ Name
    cookieStore.set("name", String(result.name), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

      // ✅ Email
    cookieStore.set("email", String(result.email), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    console.log("Cookies set:", {
      id: result.id,
      name: result.name,
      email: result.email,
      hasRefresh: !!result.refresh_token,
    });

    return NextResponse.json({ success: true });

  } catch (err) {
    return NextResponse.json(
      { message: "Login failed" },
      { status: 500 }
    );
  }
}
