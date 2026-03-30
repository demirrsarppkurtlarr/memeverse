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

function stableLmId(dedupeKey) {
  return `lm_${dedupeKey || Math.random().toString(36).slice(2, 11)}`;
}

async function saveMemes(incomingRanked) {
  // Hata önleyici: incomingRanked dizi değilse durdur
  if (!Array.isArray(incomingRanked)) {
    console.error("Hata: Gelen veriler dizi formatında değil.");
    return;
  }

  const records = incomingRanked.map((p) => {
    // Tarih objesini güvenli oluştur
    const timestamp = p.created_utc ? p.created_utc * 1000 : Date.now();
    const safeDate = new Date(timestamp).toISOString();

    return {
      id: stableLmId(p.dedupeKey),
      title: p.title || "Untitled Meme",
      url: p.mediaUrl || "",
      media_type: p.type || "image",
      source: p.subreddit || "reddit",
      score: Number(p.score) || 1,
      tags: Array.isArray(tagTitle(p.title)) ? tagTitle(p.title) : [],
      created_at: safeDate,
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

    logger.info(`Başarılı: ${records.length} kayıt işlendi.`);

    // Yerel dosya yazma işlemini de sağlama alalım
    if (!fs.existsSync(path.join(ROOT, "data"))) {
        fs.mkdirSync(path.join(ROOT, "data"), { recursive: true });
    }

    fs.writeFileSync(DATA_FILE, JSON.stringify({ 
        version: 2, 
        updatedAt: new Date().toISOString(), 
        memes: records.slice(0, 50) 
    }, null, 2));

  } catch (error) {
    console.error("Detaylı Hata:", error.message);
  }
}

module.exports = { saveMemes };