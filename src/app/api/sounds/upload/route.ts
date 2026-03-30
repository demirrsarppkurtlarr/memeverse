import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { detectLanguage, generateTags } from "@/lib/ai/tagger";
import { uploadRateLimiter, getClientIp } from "@/lib/utils";
import type { SoundCategory } from "@/types";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  if (!uploadRateLimiter(ip)) {
    return NextResponse.json({ error: { message: "Rate limit exceeded" } }, { status: 429 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: { message: "Unauthorized" } }, { status: 401 });
  }

  let body: {
    title: string;
    description?: string;
    url: string;
    durationMs?: number;
    category: SoundCategory;
    tags: string[];
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: { message: "Invalid JSON" } }, { status: 400 });
  }

  const { title, description, url, durationMs, category, tags } = body;

  if (!title?.trim() || !url) {
    return NextResponse.json({ error: { message: "Missing required fields" } }, { status: 400 });
  }

  const language = detectLanguage(title);
  const autoTags = generateTags(title, null, language);
  const allTags = Array.from(new Set([...tags, ...autoTags])).slice(0, 8);

  const adminSupabase = await createAdminClient();
  const { data, error } = await adminSupabase
    .from("sounds")
    .insert({
      title: title.trim(),
      description: description?.trim() || null,
      url,
      duration_ms: durationMs || null,
      category,
      tags: allTags,
      language,
      uploaded_by: user.id,
      is_active: true,
      plays: 0,
      likes: 0,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: { message: error.message } }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}
