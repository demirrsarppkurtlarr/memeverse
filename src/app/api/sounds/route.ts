import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { apiRateLimiter, getClientIp } from "@/lib/utils";

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

  const from = (page - 1) * pageSize;
  query = query.range(from, from + pageSize - 1);

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: { message: error.message } }, { status: 500 });
  }

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
