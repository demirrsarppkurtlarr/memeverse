import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Meme, MediaType, MemeCategory, ContentSource } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ADVANCED_TAG_RULES: Array<{ tag: string; patterns: RegExp[] }> = [
  { tag: "funny", patterns: [/lol|haha|lmao|funny|joke|humou?r|meme/gi] },
  { tag: "gaming", patterns: [/game|gamer|steam|xbox|playstation|minecraft|fortnite|valorant|cs2/gi] },
  { tag: "anime", patterns: [/anime|manga|waifu|otaku|naruto|one piece|jojo|goku/gi] },
  { tag: "relatable", patterns: [/relatable|mood|same|me irl|me_irl|too real|accurate/gi] },
  { tag: "dark", patterns: [/dark|cursed|edgy|doom|nihil|void|hell|pain/gi] },
];

function deriveAdvancedTags(title: string, currentTags: string[]): string[] {
  const found = new Set<string>((currentTags || []).map((t) => t.toLowerCase()));
  const source = `${title || ""} ${(currentTags || []).join(" ")}`;
  for (const { tag, patterns } of ADVANCED_TAG_RULES) {
    if (patterns.some((re) => re.test(source))) found.add(tag);
  }
  if (found.size === 0) found.add("funny");
  return Array.from(found);
}

function deriveCategory(title: string, tags: string[], current: string): MemeCategory {
  const c = (current || "").toLowerCase();
  if (["global", "turkish", "trending", "classic", "nsfw"].includes(c)) return c as MemeCategory;
  const t = new Set(tags);
  if (/türk|turkiye|türkiye|türkçe/i.test(title)) return "turkish";
  if (t.has("dark")) return "classic";
  return "global";
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "24", 10)));
    const q = searchParams.get("q") || searchParams.get("search") || undefined;
    const tag = searchParams.get("tag") || undefined;
    const category = searchParams.get("category") || undefined;
    const mediaType = searchParams.get("mediaType");
    const sort = (searchParams.get("sort") || "newest").toLowerCase();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        data: { items: [], total: 0, page, pageSize, hasMore: false },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    });

    let query = supabase
      .from("memes")
      .select("*", { count: "exact" })
      .eq("is_active", true);

    if (q) query = query.ilike("title", `%${q}%`);
    if (tag) query = query.contains("tags", [tag]);
    if (category && category !== "all") {
      const normalized = category.toLowerCase();
      // Advanced category filter: map category selection to tag clusters.
      if (normalized === "global") {
        // no additional filter
      } else if (["funny", "gaming", "anime", "relatable", "dark"].includes(normalized)) {
        query = query.contains("tags", [normalized]);
      } else if (normalized === "trending") {
        query = query.gte("score", 1);
      } else if (normalized === "classic") {
        query = query.gte("likes", 1000);
      } else if (normalized === "turkish") {
        query = query.ilike("title", "%türk%");
      }
    }
    if (mediaType && mediaType !== "all") query = query.eq("media_type", mediaType);

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    if (sort === "trending" || sort === "top") {
      query = query.order("score", { ascending: false });
    } else if (sort === "random") {
      query = query.order("id", { ascending: false });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    const { data, error, count } = await query.range(from, to);

    if (error) throw error;

    const safeItems: Meme[] = (data || []).map((item, index) => {
      const media = (item?.media_type || "image").toString().toLowerCase();
      const mediaTypeSafe: MediaType =
        media === "video" || media === "gif" || media === "image" ? media : "image";

      const titleSafe = item?.title?.toString?.() || "";
      const rawTags = Array.isArray(item?.tags) ? item.tags.filter((t: unknown) => typeof t === "string") : [];
      const tagsSafe = deriveAdvancedTags(titleSafe, rawTags);
      const categorySafe = deriveCategory(titleSafe, tagsSafe, (item?.category || "").toString());

      const sourceRaw = (item?.source || "reddit").toString().toLowerCase();
      const sourceSafe: ContentSource =
        sourceRaw === "reddit" ||
        sourceRaw === "upload" ||
        sourceRaw === "twitter" ||
        sourceRaw === "tiktok"
          ? sourceRaw
          : "reddit";

      return {
        id: item?.id?.toString?.() || `meme-${from + index}`,
        title: titleSafe,
        description: item?.description?.toString?.() || null,
        url: item?.url?.toString?.() || "",
        thumbnail_url: item?.thumbnail_url?.toString?.() || null,
        media_type: mediaTypeSafe,
        width: typeof item?.width === "number" ? item.width : null,
        height: typeof item?.height === "number" ? item.height : null,
        file_size: typeof item?.file_size === "number" ? item.file_size : null,
        source: sourceSafe,
        source_id: item?.source_id?.toString?.() || null,
        source_url: item?.source_url?.toString?.() || null,
        subreddit: item?.subreddit?.toString?.() || null,
        author_name: item?.author_name?.toString?.() || null,
        category: categorySafe,
        language: item?.language?.toString?.() || "en",
        tags: tagsSafe,
        views: typeof item?.views === "number" ? item.views : 0,
        likes: typeof item?.likes === "number" ? item.likes : 0,
        shares: typeof item?.shares === "number" ? item.shares : 0,
        score: typeof item?.score === "number" ? item.score : 0,
        reddit_score: typeof item?.reddit_score === "number" ? item.reddit_score : 0,
        is_active: Boolean(item?.is_active ?? true),
        is_nsfw: Boolean(item?.is_nsfw ?? false),
        is_featured: Boolean(item?.is_featured ?? false),
        uploaded_by: item?.uploaded_by?.toString?.() || null,
        created_at: item?.created_at?.toString?.() || new Date().toISOString(),
        updated_at: item?.updated_at?.toString?.() || new Date().toISOString(),
      };
    });

    return NextResponse.json({
      data: {
        items: safeItems,
        total: count || 0,
        page,
        pageSize,
        hasMore: from + safeItems.length < (count || 0),
      },
    });
  } catch {
    return NextResponse.json({
      data: { items: [], total: 0, page: 1, pageSize: 24, hasMore: false },
    });
  }
}