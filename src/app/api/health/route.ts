import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createAdminClient();

    const [memesResult, soundsResult, logResult] = await Promise.all([
      supabase.from("memes").select("id", { count: "exact", head: true }).eq("is_active", true),
      supabase.from("sounds").select("id", { count: "exact", head: true }).eq("is_active", true),
      supabase
        .from("scraper_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    return NextResponse.json({
      ok: true,
      stats: {
        totalMemes: memesResult.count || 0,
        totalSounds: soundsResult.count || 0,
      },
      recentScrapes: logResult.data || [],
    });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
