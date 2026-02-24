import type { NextApiRequest, NextApiResponse } from 'next';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_APIKEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prefix } = req.body; // e.g., `user_123_` to match all uploads for user 123
    if (!prefix) return res.status(400).json({ error: 'Prefix is required' });

    // 1️⃣ List all images with the given prefix
    const resources = await cloudinary.api.resources({ type: 'upload', prefix, max_results: 500 });

    if (resources.resources.length === 0) {
      return res.status(200).json({ message: 'No duplicates found' });
    }

    // 2️⃣ Extract all public_ids
    const publicIds = resources.resources.map((r: any) => r.public_id);

    // 3️⃣ Delete all
    const result = await cloudinary.api.delete_resources(publicIds);

    res.status(200).json({ deleted: result.deleted, total: publicIds.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}