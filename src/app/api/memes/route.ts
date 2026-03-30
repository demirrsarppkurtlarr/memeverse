import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get("pageSize") || "24", 10)));
  const q = searchParams.get("q") || searchParams.get("search") || undefined;
  const tag = searchParams.get("tag") || undefined;

  try {
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

    // HATA ÖNLEYİCİ KATMAN:
    // Gelen veride null olabilecek her şeyi burada toString() hatası vermeyecek hale getiriyoruz.
    const safeItems = (data || []).map((item) => ({
      ...item,
      id: item.id ? item.id.toString() : Math.random().toString(36).substring(7),
      title: item.title || "Untitled Meme",
      url: item.url || "",
      tags: Array.isArray(item.tags) ? item.tags : [],
      created_at: item.created_at || new Date().toISOString()
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
    console.error("API Error:", e.message);
    return NextResponse.json({
      data: { items: [], total: 0, page, pageSize, hasMore: false },
    });
  }
}

// POST fonksiyonun (Eğer varsa olduğu gibi kalabilir veya aşağıdakini kullanabilirsin)
export async function POST(request: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    try {
        const body = await request.json();
        const { data, error } = await supabase.from("memes").insert({ ...body, uploaded_by: user.id }).select().single();
        if (error) throw error;
        return NextResponse.json({ data }, { status: 201 });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}