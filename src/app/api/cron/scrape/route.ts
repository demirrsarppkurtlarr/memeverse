import { NextRequest, NextResponse } from "next/server";
import { scrapeReddit } from "@/lib/reddit/scraper";
import { createAdminClient } from "@/lib/supabase/server";

// Called by Vercel Cron or external scheduler every 10 minutes
// Vercel cron config in vercel.json will hit GET /api/cron/scrape
export async function GET(request: NextRequest) {
  // Validate cron secret to prevent unauthorized access
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startTime = Date.now();

  try {
    const redditResult = await scrapeReddit();

    // Recalculate trending scores for all active memes
    const supabase = await createAdminClient();
    await supabase.rpc("calculate_trending_scores");

    // Clean up very old low-score content (keep DB lean)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    await supabase
      .from("memes")
      .update({ is_active: false })
      .lt("created_at", thirtyDaysAgo)
      .lt("score", 0.001)
      .eq("source", "reddit")
      .eq("is_active", true);

    const duration = Date.now() - startTime;

    return NextResponse.json({
      ok: true,
      duration_ms: duration,
      results: { reddit: redditResult },
    });
  } catch (err) {
    console.error("Cron scrape error:", err);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// Also support POST for manual triggers
export const POST = GET;
