import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { createClient } from "@/lib/supabase/server";
import { apiRateLimiter, getClientIp } from "@/lib/utils";
import type { Sound } from "@/types";

interface LocalSoundsFile {
  items?: Sound[];
}

async function loadLocalSounds(): Promise<Sound[]> {
  try {
    const filePath = path.join(process.cwd(), "data", "sounds.json");
    const raw = await fs.readFile(filePath, "utf-8");
    const parsed = JSON.parse(raw) as LocalSoundsFile;
    return Array.isArray(parsed.items) ? parsed.items : [];
  } catch {
    return [];
  }
}

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  if (!apiRateLimiter(ip)) {
    return NextResponse.json({ error: { message: "Rate limit exceeded" } }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "30")));
  const category = searchParams.get("category");
  const sort = searchParams.get("sort") || "popular";
  const search = searchParams.get("search");
  const featured = searchParams.get("featured") === "true";

  const from = (page - 1) * pageSize;
  try {
    const supabase = await createClient();
    let query = supabase
      .from("sounds")
      .select("*", { count: "exact" })
      .eq("is_active", true);

    if (category && category !== "all") query = query.eq("category", category);
    if (featured) query = query.eq("is_featured", true);
    if (search) query = query.ilike("title", `%${search}%`);

    if (sort === "popular") query = query.order("plays", { ascending: false });
    else if (sort === "newest") query = query.order("created_at", { ascending: false });
    else if (sort === "liked") query = query.order("likes", { ascending: false });

    query = query.range(from, from + pageSize - 1);
    const { data, error, count } = await query;

    if (!error && (data?.length || 0) > 0) {
      return NextResponse.json({
        data: {
          items: data || [],
          total: count || 0,
          page,
          pageSize,
          hasMore: count ? from + pageSize < count : false,
        },
      });
    }
  } catch {
    // fallback below
  }

  let local = await loadLocalSounds();
  if (category && category !== "all") local = local.filter((s) => s.category === category);
  if (featured) local = local.filter((s) => s.is_featured);
  if (search) {
    const q = search.toLowerCase();
    local = local.filter((s) => s.title.toLowerCase().includes(q) || (s.tags || []).some((t) => t.toLowerCase().includes(q)));
  }
  if (sort === "newest") local = [...local].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
  else if (sort === "liked") local = [...local].sort((a, b) => (b.likes || 0) - (a.likes || 0));
  else local = [...local].sort((a, b) => (b.plays || 0) - (a.plays || 0));

  const items = local.slice(from, from + pageSize);
  return NextResponse.json({
    data: {
      items,
      total: local.length,
      page,
      pageSize,
      hasMore: from + pageSize < local.length,
    },
  });
}
