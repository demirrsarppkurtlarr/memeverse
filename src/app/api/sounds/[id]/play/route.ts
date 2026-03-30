import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

interface Props {
  params: Promise<{ id: string }>;
}

export async function POST(_request: NextRequest, { params }: Props) {
  const { id } = await params;
  if (!id) return NextResponse.json({ ok: false }, { status: 400 });

  const supabase = await createAdminClient();
  await supabase.rpc("increment_sound_plays", { sound_id: id });

  return NextResponse.json({ ok: true });
}
