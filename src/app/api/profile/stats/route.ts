import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: { message: "Unauthorized" } }, { status: 401 });

  const [likesCount, favsCount, uploadsCount] = await Promise.all([
    supabase
      .from("likes")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
    supabase
      .from("favorites")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
    supabase
      .from("memes")
      .select("id", { count: "exact", head: true })
      .eq("uploaded_by", user.id)
      .eq("is_active", true),
  ]);

  return NextResponse.json({
    data: {
      likes: likesCount.count ?? 0,
      favorites: favsCount.count ?? 0,
      uploads: uploadsCount.count ?? 0,
    },
  });
}
