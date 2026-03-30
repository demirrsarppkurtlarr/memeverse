import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: { message: "Unauthorized" } }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return NextResponse.json({ data: profile });
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: { message: "Unauthorized" } }, { status: 401 });

  let body: { display_name?: string; bio?: string; username?: string };
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: { message: "Invalid JSON" } }, { status: 400 });
  }

  const updates: Record<string, string> = {};
  if (body.display_name !== undefined) updates.display_name = body.display_name.trim().slice(0, 50);
  if (body.bio !== undefined) updates.bio = body.bio.trim().slice(0, 200);

  if (body.username) {
    const username = body.username.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 20);
    if (username.length < 3) {
      return NextResponse.json({ error: { message: "Username too short" } }, { status: 400 });
    }
    const { data: existing } = await supabase
      .from("profiles").select("id").eq("username", username).neq("id", user.id).single();
    if (existing) {
      return NextResponse.json({ error: { message: "Username taken" } }, { status: 409 });
    }
    updates.username = username;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: { message: "No valid fields to update" } }, { status: 400 });
  }

  const adminSupabase = await createAdminClient();
  const { data, error } = await adminSupabase
    .from("profiles").update(updates).eq("id", user.id).select().single();

  if (error) return NextResponse.json({ error: { message: error.message } }, { status: 500 });
  return NextResponse.json({ data });
}
