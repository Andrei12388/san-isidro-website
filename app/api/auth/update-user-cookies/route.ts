import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export interface ResultType {
  id?: number;
  name?: string;
  email?: string;
  profileImage?: string;
}

export async function POST(req: Request) {
  try {
    const result: ResultType = await req.json();
    if (!result) return NextResponse.json({ message: "No data provided" }, { status: 400 });

    const cookieStore = await cookies();

    if (result.id !== undefined) {
      cookieStore.set("user_id", String(result.id), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    if (result.name !== undefined) {
      cookieStore.set("name", String(result.name), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    if (result.email !== undefined) {
      cookieStore.set("email", String(result.email), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    if (result.profileImage !== undefined) {
      cookieStore.set("profileImage", String(result.profileImage), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    console.log("Updated cookies:", result);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed updating cookies:", err);
    return NextResponse.json({ message: "Update failed" }, { status: 500 });
  }
}
