/**
 * Normalize Reddit listing JSON into raw post objects.
 */

/**
 * @param {unknown} json
 * @param {string} subreddit
 * @returns {Array<{
 *   id: string,
 *   title: string,
 *   url: string | null,
 *   previewUrl: string | null,
 *   redditVideoUrl: string | null,
 *   permalink: string,
 *   over18: boolean,
 *   ups: number,
 *   num_comments: number,
 *   created_utc: number,
 *   subreddit: string
 * }>}
 */
function parseListing(json, subreddit) {
  const children = json?.data?.children;
  if (!Array.isArray(children)) return [];

  const out = [];
  for (const wrap of children) {
    const p = wrap?.data;
    if (!p || typeof p !== "object") continue;

    const previewUrl = p.preview?.images?.[0]?.source?.url
      ? String(p.preview.images[0].source.url).replace(/&amp;/g, "&")
      : null;

    const url = p.url ? String(p.url).replace(/&amp;/g, "&") : null;
    const redditVideoUrl =
      p.is_video && p.media && p.media.reddit_video && p.media.reddit_video.fallback_url
        ? String(p.media.reddit_video.fallback_url).replace(/&amp;/g, "&")
        : null;
    const permalink = p.permalink ? String(p.permalink) : "";

    out.push({
      id: String(p.id || ""),
      title: typeof p.title === "string" ? p.title : "",
      url,
      previewUrl,
      redditVideoUrl,
      permalink: permalink.startsWith("http") ? permalink : `https://www.reddit.com${permalink}`,
      over18: Boolean(p.over_18),
      ups: typeof p.score === "number" ? p.score : parseInt(p.score, 10) || 0,
      num_comments: typeof p.num_comments === "number" ? p.num_comments : 0,
      created_utc: typeof p.created_utc === "number" ? p.created_utc : 0,
      subreddit: subreddit || String(p.subreddit || ""),
    });
  }
  return out;
}

module.exports = { parseListing };
