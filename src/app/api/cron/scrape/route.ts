import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  // Buraya ileride verileri otomatik çekecek kodlarını yazacaksın
  console.log("GitHub Actions tetikledi!"); 
  
  return NextResponse.json({ 
    message: "Cron calisti!",
    timestamp: new Date().toISOString() 
  });
}