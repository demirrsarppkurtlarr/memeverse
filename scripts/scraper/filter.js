/**
 * Media validation, NSFW skip, intelligent dedupe.
 */

const crypto = require("crypto");

function normalizeMediaUrl(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    u.hash = "";
    return u.toString().split("?")[0].toLowerCase();
  } catch {
    return url.split("?")[0].toLowerCase();
  }
}

function pickMedia(post) {
  // Prefer reddit-hosted video when available.
  if (post.redditVideoUrl) {
    return { url: String(post.redditVideoUrl), type: "video" };
  }

  const candidates = [post.url, post.previewUrl].filter(Boolean);
  for (const raw of candidates) {
    const u = String(raw).toLowerCase();
    const pathPart = u.split("?")[0];

    if (/\.(mp4)(\?|$)/i.test(pathPart)) return { url: String(raw), type: "video" };
    if (/\.(gif)(\?|$)/i.test(pathPart)) return { url: String(raw), type: "gif" };

    const isRaster =
      /\.(jpe?g|png|webp)(\?|$)/i.test(pathPart) ||
      u.includes("i.redd.it") ||
      u.includes("preview.redd.it");
    if (isRaster) return { url: String(raw).replace(/&amp;/g, "&"), type: "image" };
  }
  return null;
}

function dedupeKey(title, mediaUrl) {
  const base = `${normalizeMediaUrl(mediaUrl) || ""}||${(title || "").trim().toLowerCase()}`;
  return crypto.createHash("sha256").update(base).digest("hex").slice(0, 20);
}

/**
 * @param {Array<any>} posts
 */
function filterPosts(posts) {
  const seen = new Map();
  const out = [];

  for (const post of posts) {
    if (post.over18) continue;
    // Quality filter
    if ((post.ups || 0) <= 500) continue;

    const media = pickMedia(post);
    if (!media?.url) continue;

    const key = dedupeKey(post.title, media.url);
    if (seen.has(key)) continue;
    seen.set(key, true);
    out.push({
      ...post,
      mediaUrl: media.url,
      type: media.type,
      dedupeKey: key,
    });
  }
  return out;
}

module.exports = { filterPosts, pickMedia, dedupeKey };
