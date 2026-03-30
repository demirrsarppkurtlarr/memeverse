import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get("pageSize") || "24", 10)));
    const q = searchParams.get("q") || searchParams.get("search") || undefined;
    const tag = searchParams.get("tag") || undefined;

    const supabase = await createClient();

    let query = supabase
      .from("memes")
      .select("*", { count: "exact" })
      .eq("is_active", true);

    if (q) query = query.ilike("title", `%${q}%`);
    if (tag) query = query.contains("tags", [tag]);

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) throw error;

    // HATA ÖNLEYİCİ: toString hatasını durdurmak için verileri önceden kontrol et
    const safeItems = (data || []).map((item) => ({
      ...item,
      // ID undefined ise toString() hata verir, bu yüzden fallback ekliyoruz
      id: item.id ? item.id.toString() : `temp-${Math.random()}`,
      title: item.title || "Untitled Meme",
      url: item.url || "",
      tags: Array.isArray(item.tags) ? item.tags : [], // Tags her zaman bir dizi olmalı
      media_type: item.media_type || "image"
    }));

    return NextResponse.json({
      data: {
        items: safeItems,
        total: count || safeItems.length,
        page,
        pageSize,
        hasMore: (count || 0) > to,
      },
    });
  } catch (e: any) {
    console.error("API Hatası:", e.message);
    return NextResponse.json({
      data: { items: [], total: 0, page: 1, pageSize: 24, hasMore: false },
    });
  }
}