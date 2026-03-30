import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { apiRateLimiter, getClientIp } from "@/lib/utils";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  if (!apiRateLimiter(ip)) {
    return NextResponse.json({ error: { message: "Rate limit exceeded" } }, { status: 429 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: { message: "Unauthorized" } }, { status: 401 });

  let body: { contentType: string; contentId: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: { message: "Invalid JSON" } }, { status: 400 });
  }

  const { contentType, contentId } = body;
  if (!["meme", "sound"].includes(contentType) || !contentId) {
    return NextResponse.json({ error: { message: "Invalid parameters" } }, { status: 400 });
  }

  const adminSupabase = await createAdminClient();
  const { error } = await adminSupabase.from("likes").insert({
    user_id: user.id,
    content_type: contentType,
    content_id: contentId,
  });

  if (error && error.code !== "23505") {
    return NextResponse.json({ error: { message: error.message } }, { status: 500 });
  }

  // Update sound likes count directly (memes handled by trigger)
  if (contentType === "sound") {
    await adminSupabase
      .from("sounds")
      .update({ likes: adminSupabase.rpc("increment" as never) })
      .eq("id", contentId);
  }

  return NextResponse.json({ data: { liked: true } });
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: { message: "Unauthorized" } }, { status: 401 });

  let body: { contentType: string; contentId: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: { message: "Invalid JSON" } }, { status: 400 });
  }

  const { contentType, contentId } = body;
  if (!["meme", "sound"].includes(contentType) || !contentId) {
    return NextResponse.json({ error: { message: "Invalid parameters" } }, { status: 400 });
  }

  const adminSupabase = await createAdminClient();
  const { error } = await adminSupabase
    .from("likes")
    .delete()
    .eq("user_id", user.id)
    .eq("content_type", contentType)
    .eq("content_id", contentId);

  if (error) {
    return NextResponse.json({ error: { message: error.message } }, { status: 500 });
  }

  // Decrement sound likes
  if (contentType === "sound") {
    const { data: sound } = await adminSupabase
      .from("sounds")
      .select("likes")
      .eq("id", contentId)
      .single();
    if (sound) {
      await adminSupabase
        .from("sounds")
        .update({ likes: Math.max(0, sound.likes - 1) })
        .eq("id", contentId);
    }
  }

  return NextResponse.json({ data: { liked: false } });
}
