import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {

  const cookieStore = await cookies();
  console.log("Cookie Store", cookieStore);

  const access_token = cookieStore.get("access_token")?.value ?? null;
  const refresh_token = cookieStore.get("refresh_token")?.value ?? null;
  const userIdStr = cookieStore.get("user_id")?.value;
  const name = cookieStore.get("name")?.value ?? null;
  const email = cookieStore.get("email")?.value ?? null;
  

  // ✅ Convert user_id string to number safely
 const user = userIdStr ? Number(userIdStr) : null;

  // Optional: handle NaN
 if (user !== null && isNaN(user)) {
  console.warn("Invalid user_id cookie value:", userIdStr);
}

  return NextResponse.json({
    access_token,
    refresh_token,
    user, // now an integer or null
    name,
    email,
  });
}
