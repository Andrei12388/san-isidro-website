import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId, accessToken } = await req.json();

    // Call FB Graph API using this token only
    const fbRes = await fetch(
      `https://graph.facebook.com/v2.11/${userId}?fields=id,name,email,picture&access_token=${accessToken}`
    );
    const fbData = await fbRes.json();
    console.log("Fb passed Data:", fbData)
    if (!fbData.id) {
      return NextResponse.json({ success: false, message: "Invalid Facebook token" }, { status: 400 });
    }

    // Return user info without storing accessToken anywhere
    return NextResponse.json({
      success: true,
      user: {
        id: fbData.id,
        name: fbData.name,
        email: fbData.email,
        picture: fbData.picture?.data?.url ?? "",
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: "Facebook login failed" }, { status: 500 });
  }
}
