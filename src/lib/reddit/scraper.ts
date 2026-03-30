// ============================================================
// REDDIT SCRAPER
// Fetches trending memes from multiple subreddits
// ============================================================

import { createAdminClient } from "@/lib/supabase/server";
import {
  detectLanguage,
  classifyCategory,
  generateTags,
  normalizeTitle,
  isLikelyMemeContent,
  getMediaTypeFromUrl,
} from "@/lib/ai/tagger";
import type { RedditPost, ScraperResult } from "@/types";

const SUBREDDITS = [
  { name: "memes", limit: 25 },
  { name: "dankmemes", limit: 25 },
  { name: "funny", limit: 20 },
  { name: "me_irl", limit: 15 },
  { name: "wholesomememes", limit: 10 },
];

const REDDIT_BASE = "https://oauth.reddit.com";
const REDDIT_AUTH = "https://www.reddit.com/api/v1/access_token";

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }

  const credentials = Buffer.from(
    `${process.env.REDDIT_CLIENT_ID}:${process.env.REDDIT_CLIENT_SECRET}`
  ).toString("base64");

  const response = await fetch(REDDIT_AUTH, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": process.env.REDDIT_USER_AGENT || "MemeVerse/1.0",
    },
    body: new URLSearchParams({
      grant_type: "password",
      username: process.env.REDDIT_USERNAME || "",
      password: process.env.REDDIT_PASSWORD || "",
    }),
  });

  if (!response.ok) {
    throw new Error(`Reddit auth failed: ${response.status}`);
  }

  const data = await response.json();
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };

  return cachedToken.token;
}

async function fetchSubredditPosts(
  subreddit: string,
  limit: number,
  sort: "hot" | "top" | "new" = "hot"
): Promise<RedditPost[]> {
  const token = await getAccessToken();

  const url = `${REDDIT_BASE}/r/${subreddit}/${sort}.json?limit=${limit}&t=day`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "User-Agent": process.env.REDDIT_USER_AGENT || "MemeVerse/1.0",
    },
  });

  if (!response.ok) {
    throw new Error(`Reddit fetch failed for r/${subreddit}: ${response.status}`);
  }

  const data = await response.json();
  return data.data?.children?.map((child: { data: RedditPost }) => child.data) || [];
}

function extractBestImageUrl(post: RedditPost): string | null {
  // Try preview images first (Reddit CDN, more reliable)
  if (post.preview?.images?.[0]) {
    const preview = post.preview.images[0];
    // Get highest resolution that's not too large
    const source = preview.source;
    if (source?.url) {
      return source.url.replace(/&amp;/g, "&");
    }
  }

  // Fall back to post URL
  if (post.url && isLikelyMemeContent(post.url, null, post.post_hint || null)) {
    return post.url;
  }

  return null;
}

function extractThumbnailUrl(post: RedditPost): string | null {
  if (post.preview?.images?.[0]?.resolutions) {
    const resolutions = post.preview.images[0].resolutions;
    // Get medium resolution thumbnail (640px ish)
    const medium =
      resolutions.find((r) => r.width >= 320 && r.width <= 640) ||
      resolutions[resolutions.length - 1];
    if (medium?.url) {
      return medium.url.replace(/&amp;/g, "&");
    }
  }
  return null;
}

interface ProcessedPost {
  source_id: string;
  title: string;
  url: string;
  thumbnail_url: string | null;
  media_type: "image" | "video" | "gif";
  width: number | null;
  height: number | null;
  source: "reddit";
  source_url: string;
  subreddit: string;
  author_name: string;
  category: "global" | "turkish" | "classic";
  language: string;
  tags: string[];
  reddit_score: number;
  is_nsfw: boolean;
  score: number;
}

function processPost(post: RedditPost): ProcessedPost | null {
  // Skip NSFW, no-image posts
  if (!post.id || !post.title) return null;

  const mediaUrl = extractBestImageUrl(post);
  if (!mediaUrl) return null;

  if (!isLikelyMemeContent(mediaUrl, null, post.post_hint || null)) return null;

  const title = normalizeTitle(post.title);
  const language = detectLanguage(title);
  const category = classifyCategory(title, post.subreddit, language);
  const tags = generateTags(title, post.subreddit, language);
  const mediaType = getMediaTypeFromUrl(mediaUrl, post.is_video || false);

  const sourceImage = post.preview?.images?.[0]?.source;
  const initialScore = post.score / Math.pow((Date.now() / 1000 - post.created_utc) / 3600 + 2, 1.5);

  return {
    source_id: `reddit_${post.id}`,
    title,
    url: mediaUrl,
    thumbnail_url: extractThumbnailUrl(post),
    media_type: mediaType,
    width: sourceImage?.width || null,
    height: sourceImage?.height || null,
    source: "reddit",
    source_url: `https://reddit.com${post.permalink}`,
    subreddit: post.subreddit,
    author_name: post.author,
    category,
    language,
    tags,
    reddit_score: post.score,
    is_nsfw: post.is_nsfw,
    score: initialScore,
  };
}

export async function scrapeReddit(): Promise<ScraperResult> {
  const startTime = Date.now();
  let totalFetched = 0;
  let totalInserted = 0;
  let totalSkipped = 0;
  let totalErrors = 0;

  const supabase = await createAdminClient();

  for (const sub of SUBREDDITS) {
    try {
      const posts = await fetchSubredditPosts(sub.name, sub.limit);
      totalFetched += posts.length;

      for (const post of posts) {
        try {
          const processed = processPost(post);
          if (!processed) {
            totalSkipped++;
            continue;
          }

          // Deduplication check
          const { data: existing } = await supabase
            .from("memes")
            .select("id")
            .eq("source_id", processed.source_id)
            .single();

          if (existing) {
            // Update reddit score if already exists
            await supabase
              .from("memes")
              .update({ reddit_score: processed.reddit_score })
              .eq("source_id", processed.source_id);
            totalSkipped++;
            continue;
          }

          // Insert new meme
          const { error } = await supabase.from("memes").insert({
            ...processed,
            views: 0,
            likes: 0,
            shares: 0,
            is_active: true,
            is_featured: false,
          });

          if (error) {
            console.error(`Insert error for ${processed.source_id}:`, error.message);
            totalErrors++;
          } else {
            totalInserted++;
          }
        } catch (err) {
          console.error(`Error processing post:`, err);
          totalErrors++;
        }
      }

      // Rate limiting: wait between subreddits
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (err) {
      console.error(`Error scraping r/${sub.name}:`, err);
      totalErrors++;
    }
  }

  // Recalculate trending scores
  await supabase.rpc("calculate_trending_scores");

  const duration = Date.now() - startTime;

  // Log scrape result
  await supabase.from("scraper_logs").insert({
    source: "reddit",
    status: totalErrors === 0 ? "success" : totalInserted > 0 ? "partial" : "error",
    fetched_count: totalFetched,
    inserted_count: totalInserted,
    skipped_count: totalSkipped,
    error_message: totalErrors > 0 ? `${totalErrors} errors occurred` : null,
    duration_ms: duration,
  });

  return {
    source: "reddit",
    fetched: totalFetched,
    inserted: totalInserted,
    skipped: totalSkipped,
    errors: totalErrors,
    duration_ms: duration,
  };
}
