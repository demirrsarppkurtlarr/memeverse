import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server"; // Kendi projenizdeki path'e göre kontrol edin
import { getClientIp, apiRateLimiter } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET: Supabase'den memeleri çeker ve frontend'in beklediği formatta döner.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  // Sayfalama parametreleri
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get("pageSize") || "24", 10)));
  
  // Filtreleme parametreleri
  const q = searchParams.get("q") || searchParams.get("search") || undefined;
  const tag = searchParams.get("tag") || undefined;

  try {
    const supabase = await createClient();

    // Temel sorgu: Aktif olanları getir
    let query = supabase
      .from("memes")
      .select("*", { count: "exact" })
      .eq("is_active", true);

    // Arama filtresi (Başlıkta ara)
    if (q) {
      query = query.ilike("title", `%${q}%`);
    }

    // Tag filtresi (Tags dizisi içinde ara)
    if (tag) {
      query = query.contains("tags", [tag]);
    }

    // Sayfalama hesaplama
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Sıralama ve Veriyi Getirme
    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) throw error;

    // Frontend (MemeGrid) tam olarak bu "data.items" yapısını bekler
    return NextResponse.json({
      data: {
        items: data || [],
        total: count || 0,
        page,
        pageSize,
        hasMore: (count || 0) > to,
      },
    });
  } catch (e: any) {
    console.error("API Error:", e.message);
    // Hata durumunda boş liste dönerek UI'ın çökmesini engeller
    return NextResponse.json({
      data: {
        items: [],
        total: 0,
        page,
        pageSize,
        hasMore: false,
      },
    });
  }
}

/**
 * POST: Manuel yüklemeler için mevcut yapıyı korur (Opsiyonel)
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: { message: "Unauthorized" } }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { data, error } = await supabase
      .from("memes")
      .insert({ ...body, uploaded_by: user.id })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ data }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: { message: error.message } }, { status: 500 });
  }
}