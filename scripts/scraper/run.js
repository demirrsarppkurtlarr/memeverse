/**
 * Orchestrates fetch → parse → filter → score → tag → save.
 */

const { fetchWithRetry } = require("./fetcher");
const { parseListing } = require("./parser");
const { filterPosts } = require("./filter");
const { rankScore } = require("./scoring");
const { saveMemes } = require("./saver");
const logger = require("./logger");

const SUBREDDITS = ["memes", "dankmemes", "funny", "wholesomememes", "me_irl"];

async function scrapeOnce() {
  logger.info("Fetching memes...");
  const requests = SUBREDDITS.map(async (sub) => {
    const url = `https://www.reddit.com/r/${sub}/hot.json?limit=50&raw_json=1`;
    const json = await fetchWithRetry(url);
    const posts = parseListing(json, sub);
    return { sub, posts };
  });

  const settled = await Promise.allSettled(requests);
  const all = [];
  for (const res of settled) {
    if (res.status === "fulfilled") {
      all.push(...res.value.posts);
      logger.info(`r/${res.value.sub}: ${res.value.posts.length} raw posts`);
    } else {
      logger.error("subreddit fetch failed", {
        error: res.reason instanceof Error ? res.reason.message : String(res.reason),
      });
    }
  }

  const filtered = filterPosts(all);
  logger.info(`After filter/dedupe: ${filtered.length} posts`);

  const scored = filtered.map((p) => ({
    ...p,
    score: rankScore({
      ups: p.ups,
      num_comments: p.num_comments,
    }),
  }));

  scored.sort((a, b) => b.score - a.score);
  const top = scored.slice(0, 50);

  await saveMemes(top);
}

module.exports = { scrapeOnce, SUBREDDITS };
