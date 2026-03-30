const path = require("path");
// Projenin ana dizinine çıkıp .env dosyasını hedef alıyoruz
const ROOT = path.join(__dirname, "..", ".."); 
const dotEnvPath = path.join(ROOT, ".env");
require('dotenv').config({ path: dotEnvPath });

const fs = require("fs");
const { createClient } = require('@supabase/supabase-js');
const logger = require("./logger");
const { tagTitle } = require("./tagging");

// .env dosyanızdaki tam isimleri kullanıyoruz 
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const DATA_FILE = path.join(ROOT, "data", "memes.json");

function stableLmId(dedupeKey) {
  return `lm_${dedupeKey}`;
}

/**
 * Memeleri hem Supabase'e hem de yerel JSON'a kaydeder.
 */
async function saveMemes(incomingRanked) {
  // 1. Verileri Supabase Formatına Hazırla
  const records = incomingRanked.map((p) => ({
    id: stableLmId(p.dedupeKey),
    title: p.title,
    url: p.mediaUrl,
    media_type: p.type || "image",
    source: p.subreddit || "reddit",
    score: p.score || 1,
    tags: tagTitle(p.title),
    created_at: new Date((p.created_utc || Date.now()/1000) * 1000).toISOString(),
    reddit_url: p.permalink,
    upvotes: p.ups || 0,
    comments: p.num_comments || 0,
    is_active: true
  }));

  try {
    if (records.length === 0) {
      console.log("Kaydedilecek yeni meme bulunamadı.");
      return;
    }

    console.log(`Supabase'e ${records.length} meme gönderiliyor...`);

    // 2. Supabase'e Yaz (UPSERT: Eğer ID varsa güncelle, yoksa yeni ekle)
    const { error } = await supabase
      .from('memes') 
      .upsert(records, { onConflict: 'id' });

    if (error) throw error;

    logger.info(`Supabase Senkronizasyonu Başarılı: ${records.length} kayıt işlendi.`);

    // 3. Yerel Dosyayı da Güncelle (Yedek/Lokal görüntüleme amaçlı)
    if (!fs.existsSync(path.join(ROOT, "data"))) {
        fs.mkdirSync(path.join(ROOT, "data"), { recursive: true });
    }

    fs.writeFileSync(DATA_FILE, JSON.stringify({ 
        version: 2, 
        updatedAt: new Date().toISOString(), 
        memes: records.slice(0, 50) 
    }, null, 2));

    console.log(`Yerel dosya güncellendi: ${DATA_FILE}`);

  } catch (error) {
    logger.error("Kaydetme Hatası:", error.message);
    console.error("Detaylı Hata:", error);
  }
}

module.exports = { saveMemes };