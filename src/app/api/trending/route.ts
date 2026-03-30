import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  const [topMemes, topTags, recentActivity] = await Promise.all([
    // Top 5 trending memes
    supabase
      .from("memes")
      .select("id, title, thumbnail_url, url, likes, views, score, category")
      .eq("is_active", true)
      .order("score", { ascending: false })
      .limit(5),

    // Most used tags (approximate via aggregation)
    supabase
      .from("memes")
      .select("tags")
      .eq("is_active", true)
      .order("score", { ascending: false })
      .limit(200),

    // Last 24h meme count
    supabase
      .from("memes")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true)
      .gte("created_at", new Date(Date.now() - 86400000).toISOString()),
  ]);

  // Compute tag frequencies
  const tagCounts: Record<string, number> = {};
  (topTags.data || []).forEach((meme) => {
    (meme.tags as string[]).forEach((tag) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });
  const trendingTags = Object.entries(tagCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([tag, count]) => ({ tag, count }));

  return NextResponse.json({
    data: {
      topMemes: topMemes.data || [],
      trendingTags,
      last24hCount: recentActivity.count || 0,
    },
  });
}
