import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_APIKEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prefix } = body; // e.g., `user_123_`

    if (!prefix) {
      return new Response(JSON.stringify({ error: "Prefix is required" }), {
        status: 400,
      });
    }

    // 1️⃣ List all images with the given prefix
    const resources = await cloudinary.api.resources({
      type: "upload",
      prefix,
      max_results: 500,
    });

    if (resources.resources.length === 0) {
      return new Response(JSON.stringify({ message: "No duplicates found" }), {
        status: 200,
      });
    }

    // 2️⃣ Extract all public_ids
    const publicIds = resources.resources.map((r: any) => r.public_id);

    // 3️⃣ Delete all
    const result = await cloudinary.api.delete_resources(publicIds);

    return new Response(
      JSON.stringify({ deleted: result.deleted, total: publicIds.length }),
      {
        status: 200,
      },
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}
