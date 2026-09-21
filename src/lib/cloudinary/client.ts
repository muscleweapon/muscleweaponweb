import 'server-only';

import { v2 as cloudinary } from 'cloudinary';

/**
 * Server-only Cloudinary client configuration.
 * All API secret usage is restricted strictly to server components and actions.
 */
let isConfigured = false;

export function getCloudinary() {
  if (!isConfigured) {
    cloudinary.config({
      cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });
    isConfigured = true;
  }
  return cloudinary;
}

export async function checkCloudinaryConnection(): Promise<{
  connected: boolean;
  cloudName?: string;
  error?: string;
}> {
  try {
    const client = getCloudinary();
    const result = await client.api.ping();
    if (result && result.status === 'ok') {
      return {
        connected: true,
        cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      };
    }
    return {
      connected: false,
      error: 'Cloudinary ping did not return status ok',
    };
  } catch (err) {
    return {
      connected: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
