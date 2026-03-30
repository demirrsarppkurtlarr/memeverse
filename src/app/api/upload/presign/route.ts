import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getPresignedUploadUrl,
  getExtensionFromMimeType,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES,
  ALLOWED_AUDIO_TYPES,
  MAX_IMAGE_SIZE,
  MAX_VIDEO_SIZE,
  MAX_AUDIO_SIZE,
} from "@/lib/r2/storage";
import { uploadRateLimiter, getClientIp } from "@/lib/utils";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  if (!uploadRateLimiter(ip)) {
    return NextResponse.json({ error: { message: "Upload rate limit exceeded" } }, { status: 429 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: { message: "Unauthorized" } }, { status: 401 });

  let body: { mimeType: string; size: number; contentType: "meme" | "sound" | "avatar" };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: { message: "Invalid JSON" } }, { status: 400 });
  }

  const { mimeType, size, contentType } = body;

  // Validate mime type
  const allAllowed = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES, ...ALLOWED_AUDIO_TYPES];
  if (!allAllowed.includes(mimeType)) {
    return NextResponse.json(
      { error: { message: `Unsupported file type: ${mimeType}` } },
      { status: 400 }
    );
  }

  // Validate file size
  let maxSize = MAX_IMAGE_SIZE;
  if (ALLOWED_VIDEO_TYPES.includes(mimeType)) maxSize = MAX_VIDEO_SIZE;
  if (ALLOWED_AUDIO_TYPES.includes(mimeType)) maxSize = MAX_AUDIO_SIZE;

  if (size > maxSize) {
    return NextResponse.json(
      { error: { message: `File too large. Maximum: ${Math.round(maxSize / 1024 / 1024)}MB` } },
      { status: 400 }
    );
  }

  // Determine folder
  let folder: "memes" | "sounds" | "avatars" = "memes";
  if (contentType === "sound") folder = "sounds";
  if (contentType === "avatar") folder = "avatars";

  const extension = getExtensionFromMimeType(mimeType);

  try {
    const result = await getPresignedUploadUrl(folder, mimeType, extension);
    return NextResponse.json(result);
  } catch (err) {
    console.error("Presign error:", err);
    return NextResponse.json(
      { error: { message: "Failed to generate upload URL" } },
      { status: 500 }
    );
  }
}
