// ============================================================
// MEMEVERSE - Global TypeScript Types
// ============================================================

export type MediaType = "image" | "video" | "gif";
export type ContentSource = "reddit" | "upload" | "twitter" | "tiktok";
export type MemeCategory = "global" | "turkish" | "trending" | "classic" | "nsfw";
export type SoundCategory = "funny" | "bass" | "anime" | "gaming" | "movie" | "turkish" | "meme" | "classic";
export type ContentType = "meme" | "sound";
export type UserRole = "user" | "moderator" | "admin";

// ============================================================
// DATABASE MODELS
// ============================================================

export interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  role: UserRole;
  upload_count: number;
  like_count: number;
  created_at: string;
  updated_at: string;
}

export interface Meme {
  id: string;
  title: string;
  description: string | null;
  url: string;
  thumbnail_url: string | null;
  media_type: MediaType;
  width: number | null;
  height: number | null;
  file_size: number | null;
  source: ContentSource;
  source_id: string | null;
  source_url: string | null;
  subreddit: string | null;
  author_name: string | null;
  category: MemeCategory;
  language: string;
  tags: string[];
  views: number;
  likes: number;
  shares: number;
  score: number;
  reddit_score: number;
  is_active: boolean;
  is_nsfw: boolean;
  is_featured: boolean;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  user_liked?: boolean;
  user_favorited?: boolean;
  uploader?: Pick<Profile, "id" | "username" | "avatar_url">;
}

export interface Sound {
  id: string;
  title: string;
  description: string | null;
  url: string;
  duration_ms: number | null;
  file_size: number | null;
  category: SoundCategory;
  tags: string[];
  language: string;
  plays: number;
  likes: number;
  is_active: boolean;
  is_featured: boolean;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  user_liked?: boolean;
  user_favorited?: boolean;
}

export interface Like {
  id: string;
  user_id: string;
  content_type: ContentType;
  content_id: string;
  created_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  content_type: ContentType;
  content_id: string;
  created_at: string;
}

// ============================================================
// API TYPES
// ============================================================

export interface ApiResponse<T> {
  data: T;
  error: null;
}

export interface ApiError {
  data: null;
  error: {
    message: string;
    code?: string;
    status?: number;
  };
}

export type ApiResult<T> = ApiResponse<T> | ApiError;

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ============================================================
// QUERY PARAMS
// ============================================================

export interface MemesQueryParams {
  category?: MemeCategory | "all";
  mediaType?: MediaType | "all";
  language?: string;
  /** Local feed: trending = score, newest = time, random = daily seed, top maps to trending */
  sort?: "trending" | "newest" | "top" | "random";
  search?: string;
  page?: number;
  pageSize?: number;
  tag?: string;
}

export interface SoundsQueryParams {
  category?: SoundCategory | "all";
  search?: string;
  sort?: "popular" | "newest";
  page?: number;
  pageSize?: number;
}

// ============================================================
// SCRAPER TYPES
// ============================================================

export interface RedditPost {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  preview?: {
    images: Array<{
      source: { url: string; width: number; height: number };
      resolutions: Array<{ url: string; width: number; height: number }>;
    }>;
  };
  is_video: boolean;
  media?: {
    reddit_video?: { fallback_url: string; width: number; height: number };
  };
  score: number;
  subreddit: string;
  author: string;
  is_nsfw: boolean;
  created_utc: number;
  permalink: string;
  post_hint?: string;
  url_overridden_by_dest?: string;
}

export interface ScraperResult {
  source: string;
  fetched: number;
  inserted: number;
  skipped: number;
  errors: number;
  duration_ms: number;
}

// ============================================================
// UI STATE TYPES
// ============================================================

export interface AuthUser {
  id: string;
  email: string;
  profile: Profile;
}

export interface UINotification {
  id: string;
  type: "success" | "error" | "info" | "warning";
  message: string;
  duration?: number;
}

export interface MemeUploadData {
  file: File;
  title: string;
  description?: string;
  category: MemeCategory;
  tags: string[];
}

export interface SoundUploadData {
  file: File;
  title: string;
  description?: string;
  category: SoundCategory;
  tags: string[];
}
