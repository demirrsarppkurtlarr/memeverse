import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getClientIp } from "@/lib/utils";
import crypto from "crypto";

interface Props {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: Props) {
  const { id } = await params;
  if (!id) return NextResponse.json({ ok: false }, { status: 400 });

  const ip = getClientIp(request);
  const ipHash = crypto.createHash("sha256").update(ip + id).digest("hex").slice(0, 16);

  const supabase = await createAdminClient();

  // Check if already viewed in last hour (prevent abuse)
  const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
  const { data: existing } = await supabase
    .from("views")
    .select("id")
    .eq("meme_id", id)
    .eq("ip_hash", ipHash)
    .gte("created_at", oneHourAgo)
    .single();

  if (!existing) {
    await supabase.from("views").insert({ meme_id: id, ip_hash: ipHash });
    await supabase.rpc("increment_meme_views", { meme_id: id });
  }

  return NextResponse.json({ ok: true });
}
