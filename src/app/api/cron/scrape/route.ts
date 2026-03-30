import { NextResponse } from "next/server";
// @ işareti src klasörünü temsil eder. 
// scripts klasörü src'nin dışındaysa ../../../../ ile çıkmamız gerekir.
import { scrapeOnce } from "../../../../../scripts/scraper/run";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    console.log("Scraper başlatılıyor...");
    
    // Fonksiyonu doğrudan çağırıyoruz
    await scrapeOnce();

    return NextResponse.json({ 
      success: true, 
      message: "İşlem tamamlandı." 
    });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}