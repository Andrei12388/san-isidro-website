import { NextRequest } from "next/server";

export async function POST(req: NextRequest){
    const requestBody = await req.json();
    console.log(requestBody);

    // Server Verification
    let urlGraphFacebook = `https://graph.facebook.com/v2.11/${requestBody.userId}/?fields=id,name,picture,email&access_token=${requestBody.accessToken}`

    const response = await fetch(urlGraphFacebook);
    const data = await response.json();

    console.log("data fb:", data);
    return Response.json({success: true});
}