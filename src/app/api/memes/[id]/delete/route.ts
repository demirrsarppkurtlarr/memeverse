import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

interface Props {
  params: Promise<{ id: string }>;
}

export async function DELETE(_request: NextRequest, { params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: { message: "Unauthorized" } }, { status: 401 });

  // Verify ownership
  const { data: meme } = await supabase
    .from("memes")
    .select("id, uploaded_by")
    .eq("id", id)
    .single();

  if (!meme) return NextResponse.json({ error: { message: "Not found" } }, { status: 404 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isOwner = meme.uploaded_by === user.id;
  const isMod = profile?.role === "moderator" || profile?.role === "admin";

  if (!isOwner && !isMod) {
    return NextResponse.json({ error: { message: "Forbidden" } }, { status: 403 });
  }

  const adminSupabase = await createAdminClient();
  await adminSupabase.from("memes").update({ is_active: false }).eq("id", id);

  return NextResponse.json({ data: { deleted: true } });
}
