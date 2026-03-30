import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPlatformMemeById, platformMemeToMeme } from "@/lib/memes/store";

interface Props {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: Props) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: { message: "Missing meme ID" } }, { status: 400 });
  }

  const local = await getPlatformMemeById(id);
  if (local) {
    return NextResponse.json({ data: platformMemeToMeme(local) });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("memes")
    .select("*, uploader:profiles(id, username, avatar_url)")
    .eq("id", id)
    .eq("is_active", true)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: { message: "Meme not found" } }, { status: 404 });
  }

  return NextResponse.json({ data });
}
