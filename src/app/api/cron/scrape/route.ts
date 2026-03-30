import { NextResponse } from "next/server";
import path from "path";

// Vercel ayarları (Serverless için)
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Klasör yapına göre run.js'in tam yerini buluyoruz
    // src/app/api/cron/scrape -> .. / .. / .. / .. / scripts / scraper / run
    const scraperPath = path.join(process.cwd(), "scripts", "scraper", "run.js");
    
    // run.js içindeki scrapeOnce fonksiyonunu yüklüyoruz
    const { scrapeOnce } = require(scraperPath);

    console.log("Scraper tetiklendi, işlem başlıyor...");

    // Senin asıl fonksiyonun
    await scrapeOnce();

    return NextResponse.json({ 
      success: true, 
      message: "Meme yenileme işlemi başarıyla tamamlandı!" 
    });
  } catch (error: any) {
    console.error("Scraper Hatası:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}