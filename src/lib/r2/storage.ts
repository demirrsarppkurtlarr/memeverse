import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";

const R2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.R2_BUCKET_NAME!;
const PUBLIC_URL = process.env.R2_PUBLIC_URL!;

export type UploadFolder = "memes" | "sounds" | "avatars" | "thumbnails";

export interface UploadResult {
  key: string;
  url: string;
}

export async function uploadFile(
  file: Buffer,
  mimeType: string,
  folder: UploadFolder,
  extension: string
): Promise<UploadResult> {
  const key = `${folder}/${uuidv4()}.${extension}`;

  await R2.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: file,
      ContentType: mimeType,
      CacheControl: "public, max-age=31536000, immutable",
    })
  );

  return {
    key,
    url: `${PUBLIC_URL}/${key}`,
  };
}

export async function deleteFile(key: string): Promise<void> {
  await R2.send(
    new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: key,
    })
  );
}

export async function getPresignedUploadUrl(
  folder: UploadFolder,
  mimeType: string,
  extension: string
): Promise<{ uploadUrl: string; key: string; publicUrl: string }> {
  const key = `${folder}/${uuidv4()}.${extension}`;

  const uploadUrl = await getSignedUrl(
    R2,
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      ContentType: mimeType,
    }),
    { expiresIn: 3600 }
  );

  return {
    uploadUrl,
    key,
    publicUrl: `${PUBLIC_URL}/${key}`,
  };
}

export function getExtensionFromMimeType(mimeType: string): string {
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "image/webp": "webp",
    "video/mp4": "mp4",
    "video/webm": "webm",
    "audio/mpeg": "mp3",
    "audio/mp3": "mp3",
    "audio/wav": "wav",
    "audio/ogg": "ogg",
  };
  return map[mimeType] || "bin";
}

export function getMimeTypeCategory(mimeType: string): "image" | "video" | "audio" | "unknown" {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  return "unknown";
}

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
export const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm"];
export const ALLOWED_AUDIO_TYPES = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg"];
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024;  // 10MB
export const MAX_VIDEO_SIZE = 50 * 1024 * 1024;  // 50MB
export const MAX_AUDIO_SIZE = 10 * 1024 * 1024;  // 10MB
