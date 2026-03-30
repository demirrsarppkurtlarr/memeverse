/**
 * Merge with existing file, cap 50, atomic write.
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const logger = require("./logger");

const { tagTitle } = require("./tagging");
const { rankScore } = require("./scoring");

const ROOT = path.join(__dirname, "..", "..");
const DATA_DIR = path.join(ROOT, "data");
const DATA_FILE = path.join(DATA_DIR, "memes.json");
const TMP_FILE = path.join(DATA_DIR, ".memes.json.tmp");

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function stableLmId(dedupeKey) {
  return `lm_${dedupeKey}`;
}

/**
 * @param {Array<{
 *   title: string,
 *   mediaUrl: string,
 *   type: "image" | "gif" | "video",
 *   permalink: string,
 *   subreddit: string,
 *   dedupeKey: string,
 *   ups: number,
 *   num_comments: number,
 *   created_utc: number
 * }>} scoredPosts already sorted by score desc, with numeric score field
 */
function buildRecords(scoredPosts) {
  return scoredPosts.map((p) => {
    const id = stableLmId(p.dedupeKey);
    const createdAt = new Date((p.created_utc || 0) * 1000).toISOString();
    return {
      id,
      title: p.title,
      url: p.mediaUrl,
      type: p.type || "image",
      source: p.subreddit || "reddit",
      score: p.score,
      tags: tagTitle(p.title),
      createdAt,
      postUrl: p.permalink,
      upvotes: p.ups,
      comments: p.num_comments,
    };
  });
}

function readExisting() {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    const data = JSON.parse(raw);
    return {
      version: data.version ?? 1,
      updatedAt: data.updatedAt ?? null,
      memes: Array.isArray(data.memes) ? data.memes : [],
    };
  } catch (e) {
    return { version: 2, updatedAt: null, memes: [] };
  }
}

function migrateLegacy(meme) {
  if (meme && meme.imageUrl && !meme.id) {
    const dk = crypto
      .createHash("sha256")
      .update(`${String(meme.imageUrl).split("?")[0]}||${String(meme.title || "").toLowerCase()}`)
      .digest("hex")
      .slice(0, 20);
    return {
      id: stableLmId(dk),
      title: meme.title,
      url: meme.imageUrl,
      source: "memes",
      score: 0,
      tags: tagTitle(meme.title),
      createdAt: new Date().toISOString(),
      postUrl: meme.postLink || "",
      upvotes: 0,
      comments: 0,
    };
  }
  return meme;
}

/**
 * @param {Array<any>} incoming ranked posts (with score, all fields)
 */
async function saveMemes(incomingRanked) {
  ensureDir();
  const existing = readExisting();
  const byId = new Map();

  for (const m of existing.memes) {
    const mm = m.url ? m : migrateLegacy(m);
    if (mm && mm.id) byId.set(mm.id, mm);
  }

  const fresh = buildRecords(incomingRanked);
  for (const rec of fresh) {
    byId.set(rec.id, rec);
  }

  let merged = Array.from(byId.values());
  merged.sort((a, b) => (b.score || 0) - (a.score || 0));
  merged = merged.slice(0, 50);

  const payload = {
    version: 2,
    updatedAt: new Date().toISOString(),
    memes: merged,
  };

  fs.writeFileSync(TMP_FILE, JSON.stringify(payload, null, 2), "utf8");
  fs.renameSync(TMP_FILE, DATA_FILE);
  logger.info(`Saved ${merged.length} meme(s) to ${path.relative(ROOT, DATA_FILE)}`);
}

module.exports = { saveMemes, buildRecords, DATA_FILE };
