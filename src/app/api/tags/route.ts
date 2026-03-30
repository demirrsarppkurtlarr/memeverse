import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("memes")
    .select("tags")
    .eq("is_active", true)
    .order("score", { ascending: false })
    .limit(500);

  if (error) return NextResponse.json({ error: { message: error.message } }, { status: 500 });

  const counts: Record<string, number> = {};
  (data || []).forEach((row) => {
    (row.tags as string[]).forEach((tag) => {
      counts[tag] = (counts[tag] || 0) + 1;
    });
  });

  const tags = Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 50)
    .map(([tag, count]) => ({ tag, count }));

  return NextResponse.json({ data: tags });
}
