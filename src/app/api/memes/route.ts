import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { apiRateLimiter, getClientIp } from "@/lib/utils";
import { detectLanguage, classifyCategory, generateTags, getMediaTypeFromUrl } from "@/lib/ai/tagger";
import { queryMemes, type MemeSortMode } from "@/lib/memes/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function parseSort(raw: string | null): MemeSortMode {
  const s = (raw || "trending").toLowerCase();
  if (s === "newest") return "newest";
  if (s === "random") return "random";
  if (s === "top" || s === "trending") return "trending";
  return "trending";
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const pageSize = Math.min(30, Math.max(1, parseInt(searchParams.get("pageSize") || "24", 10)));
  const q = searchParams.get("q") || searchParams.get("search") || undefined;
  const tag = searchParams.get("tag") || undefined;
  const sort = parseSort(searchParams.get("sort"));
  const randomSeed = searchParams.get("seed") || undefined;

  try {
    const data = await queryMemes({
      page,
      pageSize,
      q,
      tag,
      sort,
      randomSeed,
    });
    return NextResponse.json({ data: { ...data, items: (data.items || []).slice(0, 30) } });
  } catch (e) {
    // Never crash the UI: return a safe empty dataset.
    return NextResponse.json({
      data: {
        items: [],
        total: 0,
        page,
        pageSize,
        hasMore: false,
      },
    });
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: { message: "Unauthorized" } }, { status: 401 });
  }

  const ip = getClientIp(request);
  if (!apiRateLimiter(ip)) {
    return NextResponse.json({ error: { message: "Rate limit exceeded" } }, { status: 429 });
  }

  let body: {
    title: string;
    description?: string;
    url: string;
    storageKey: string;
    mimeType: string;
    category: string;
    tags: string[];
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: { message: "Invalid JSON" } }, { status: 400 });
  }

  const { title, description, url, mimeType, category, tags } = body;

  if (!title?.trim() || !url || !mimeType) {
    return NextResponse.json({ error: { message: "Missing required fields" } }, { status: 400 });
  }

  const language = detectLanguage(title);
  const autoCategory = classifyCategory(title, null, language);
  const autoTags = generateTags(title, null, language);
  const mediaType = getMediaTypeFromUrl(url, mimeType.startsWith("video/"));

  const allTags = Array.from(new Set([...tags, ...autoTags])).slice(0, 10);
  const finalCategory = category || autoCategory;

  const adminSupabase = await createAdminClient();
  const { data, error } = await adminSupabase
    .from("memes")
    .insert({
      title: title.trim(),
      description: description?.trim() || null,
      url,
      media_type: mediaType,
      source: "upload",
      category: finalCategory,
      language,
      tags: allTags,
      uploaded_by: user.id,
      is_active: true,
      is_nsfw: false,
      views: 0,
      likes: 0,
      shares: 0,
      score: 1,
      reddit_score: 0,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: { message: error.message } }, { status: 500 });
  }

  await adminSupabase
    .from("profiles")
    .update({ upload_count: adminSupabase.rpc("upload_count" as never) })
    .eq("id", user.id);

  return NextResponse.json({ data }, { status: 201 });
}
