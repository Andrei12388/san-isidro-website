import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, hashPassword } from "@/utils/password";
import { createAccessToken, createRefreshToken } from "@/utils/jwt";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    // Create tokens
    const accessToken = createAccessToken(user.id);
    const refreshToken = createRefreshToken(user.id);

    // Create response with refresh token in httpOnly cookie
    const result = {
      id: user.id,
      name: user.name,
      email: user.email,
      accessToken,
      tokenType: "Bearer",
      message: "Login successful",
    };
    const response = NextResponse.json(result, { status: 200 });
    const cookieStore = await cookies();

    console.log("cookie fetch data", result, cookieStore);

    // ✅ access token
    cookieStore.set("access_token", result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

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

    //Fetch image from personal user info api

    const API_BASE =
      process.env.NODE_ENV === "production"
        ? process.env.NEXT_PUBLIC_APP_URL
        : "http://localhost:3000";

    const personalInfoRes = await fetch(
      `${API_BASE}/api/postgre/personal-info/`,
      {
        headers: {
          Authorization: `Bearer ${result.accessToken}`,
        },
      },
    );

    if (!personalInfoRes.ok) {
      console.log("Error fetching image");
    }
    const imageRes = await personalInfoRes.json();
    console.log("Image Fetch:", imageRes.data.profileImage);

    // ✅ Image
    cookieStore.set("profileImage", String(imageRes.data.profileImage), {
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
      profileImage: imageRes.profileImage,
      hasRefresh: !!refreshToken,
    });

    // Set refresh token in httpOnly cookie
    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 15, // 15 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
