import { NextResponse } from 'next/server';
import { getCloudinary } from '@/lib/cloudinary/client';
import { requireAdminUser } from '@/lib/auth/server-auth';

export async function POST() {
  try {
    // 1. Authorize admin user
    await requireAdminUser();

    // 2. Generate signed upload parameters
    const cloudinary = getCloudinary();
    const timestamp = Math.round(Date.now() / 1000);
    const folder = 'muscle-weapon/products';

    const paramsToSign = {
      folder,
      timestamp,
    };

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET!
    );

    return NextResponse.json({
      signature,
      timestamp,
      apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      folder,
    });
  } catch (err: unknown) {
    console.error('[Cloudinary Sign API] Error:', err);
    const message = err instanceof Error ? err.message : 'Unauthorized or failed to sign Cloudinary request';
    return NextResponse.json(
      { error: message },
      { status: 401 }
    );
  }
}
