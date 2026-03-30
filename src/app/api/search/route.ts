import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { apiRateLimiter, getClientIp } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  if (!apiRateLimiter(ip)) {
    return NextResponse.json({ error: { message: "Rate limit exceeded" } }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  const type = searchParams.get("type") || "memes"; // memes | sounds | all

  if (!q || q.length < 2) {
    return NextResponse.json({ data: { memes: [], sounds: [] } });
  }

  const supabase = await createClient();
  const results: { memes: unknown[]; sounds: unknown[] } = { memes: [], sounds: [] };

  if (type === "memes" || type === "all") {
    const { data } = await supabase
      .from("memes")
      .select("id, title, thumbnail_url, url, media_type, likes, views, category, tags, created_at")
      .eq("is_active", true)
      .or(`title.ilike.%${q}%,tags.cs.{${q}}`)
      .order("score", { ascending: false })
      .limit(20);
    results.memes = data || [];
  }

  if (type === "sounds" || type === "all") {
    const { data } = await supabase
      .from("sounds")
      .select("id, title, category, plays, likes, tags")
      .eq("is_active", true)
      .ilike("title", `%${q}%`)
      .order("plays", { ascending: false })
      .limit(10);
    results.sounds = data || [];
  }

  return NextResponse.json({ data: results });
}
