import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
}

export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes === 0) return `${seconds}s`;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

export function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d ago`;
  if (seconds < 31536000) return `${Math.floor(seconds / 2592000)}mo ago`;
  return `${Math.floor(seconds / 31536000)}y ago`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[ğ]/g, "g")
    .replace(/[ü]/g, "u")
    .replace(/[ş]/g, "s")
    .replace(/[ı]/g, "i")
    .replace(/[ö]/g, "o")
    .replace(/[ç]/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - 3) + "...";
}

export function getAspectRatioClass(width: number | null, height: number | null): string {
  if (!width || !height) return "aspect-video";
  const ratio = width / height;
  if (ratio > 1.7) return "aspect-video";
  if (ratio > 1.2) return "aspect-[4/3]";
  if (ratio > 0.9) return "aspect-square";
  if (ratio > 0.6) return "aspect-[3/4]";
  return "aspect-[9/16]";
}

export function isImageUrl(url: string): boolean {
  return /\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(url) ||
    url.includes("i.redd.it") ||
    url.includes("i.imgur.com") ||
    url.includes("preview.redd.it");
}

export function isVideoUrl(url: string): boolean {
  return /\.(mp4|webm|mov)(\?.*)?$/i.test(url) ||
    url.includes("v.redd.it");
}

export function buildApiUrl(path: string, params?: Record<string, string | number | boolean | undefined>): string {
  const url = new URL(path, process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000");
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    });
  }
  return url.toString();
}

export function rateLimit(maxRequests: number, windowMs: number) {
  const requests = new Map<string, number[]>();

  return function check(identifier: string): boolean {
    const now = Date.now();
    const windowStart = now - windowMs;

    const userRequests = requests.get(identifier) || [];
    const validRequests = userRequests.filter((time) => time > windowStart);

    if (validRequests.length >= maxRequests) {
      return false;
    }

    validRequests.push(now);
    requests.set(identifier, validRequests);

    // Cleanup old entries periodically
    if (requests.size > 10000) {
      for (const [key, times] of requests.entries()) {
        if (times.every((t) => t < windowStart)) {
          requests.delete(key);
        }
      }
    }

    return true;
  };
}

// Simple in-memory rate limiter for API routes
export const apiRateLimiter = rateLimit(60, 60 * 1000); // 60 req/min
export const uploadRateLimiter = rateLimit(10, 60 * 1000); // 10 uploads/min

export function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}
