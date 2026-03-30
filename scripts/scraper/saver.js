const path = require("path");
const ROOT = path.join(__dirname, "..", ".."); 
const dotEnvPath = path.join(ROOT, ".env");
require('dotenv').config({ path: dotEnvPath });

const fs = require("fs");
const { createClient } = require('@supabase/supabase-js');
const logger = require("./logger");
const { tagTitle } = require("./tagging");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const DATA_FILE = path.join(ROOT, "data", "memes.json");

/**
 * Güvenli ID oluşturucu: Boş gelme ihtimaline karşı fallback eklendi.
 */
function stableLmId(dedupeKey) {
  const safeKey = dedupeKey ? dedupeKey.toString() : Math.random().toString(36).substring(2);
  return `lm_${safeKey}`;
}

async function saveMemes(incomingRanked) {
  if (!Array.isArray(incomingRanked)) {
    console.error("Hata: Gelen veriler bir dizi (array) değil.");
    return;
  }

  // 1. Verileri Supabase Formatına Hazırla (Null-Safe Check)
  const records = incomingRanked.map((p) => {
    // Verilerin varlığını kontrol et, yoksa varsayılan değer ata
    const title = p.title || "Untitled Meme";
    const mediaUrl = p.mediaUrl || "";
    const timestamp = p.created_utc ? p.created_utc * 1000 : Date.now();

    return {
      id: stableLmId(p.dedupeKey),
      title: title,
      url: mediaUrl,
      media_type: p.type || "image",
      source: p.subreddit || "reddit",
      score: Number(p.score) || 0,
      tags: Array.isArray(tagTitle(title)) ? tagTitle(title) : [],
      created_at: new Date(timestamp).toISOString(),
      reddit_url: p.permalink || "",
      upvotes: Number(p.ups) || 0,
      comments: Number(p.num_comments) || 0,
      is_active: true
    };
  });

  try {
    if (records.length === 0) return;

    console.log(`Supabase'e ${records.length} meme gönderiliyor...`);

    const { error } = await supabase
      .from('memes') 
      .upsert(records, { onConflict: 'id' });

    if (error) throw error;

    logger.info(`Supabase Senkronizasyonu Başarılı: ${records.length} kayıt işlendi.`);

    // Yerel Dosyayı Güncelle
    if (!fs.existsSync(path.join(ROOT, "data"))) {
        fs.mkdirSync(path.join(ROOT, "data"), { recursive: true });
    }

    fs.writeFileSync(DATA_FILE, JSON.stringify({ 
        version: 2, 
        updatedAt: new Date().toISOString(), 
        memes: records.slice(0, 50) 
    }, null, 2));

  } catch (error) {
    console.error("Kaydetme sırasında bir hata oluştu:", error.message);
  }
}

module.exports = { saveMemes };