/**
 * HTTP fetch with retries and backoff.
 */

const logger = require("./logger");

const DEFAULT_HEADERS = {
  "User-Agent": "MemeVerseLocal/2.0 (educational; localhost)",
  Accept: "application/json",
};

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * @param {string} url
 * @param {{ retries?: number, timeoutMs?: number, headers?: Record<string,string> }} opts
 */
async function fetchWithRetry(url, opts = {}) {
  const retries = opts.retries ?? 4;
  const timeoutMs = opts.timeoutMs ?? 20000;
  const headers = { ...DEFAULT_HEADERS, ...opts.headers };

  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { headers, signal: controller.signal });
      clearTimeout(timer);
      if (res.status === 429 || res.status >= 500) {
        const wait = Math.min(8000, 500 * Math.pow(2, attempt));
        logger.warn(`HTTP ${res.status} for ${url}, retry in ${wait}ms`, { attempt });
        await sleep(wait);
        continue;
      }
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        const snippet = text ? text.slice(0, 200).replace(/\s+/g, " ") : "";
        throw new Error(`HTTP ${res.status} ${res.statusText}${snippet ? ` — ${snippet}` : ""}`);
      }
      const contentType = (res.headers.get("content-type") || "").toLowerCase();
      const text = await res.text();
      const trimmed = text.trimStart();
      // Reddit sometimes returns an HTML bot-check page with HTTP 200.
      if (contentType.includes("text/html") || trimmed.startsWith("<!doctype") || trimmed.startsWith("<html")) {
        const snippet = trimmed.slice(0, 180).replace(/\s+/g, " ");
        const wait = Math.min(8000, 600 * Math.pow(2, attempt));
        logger.warn(`Received HTML instead of JSON, retry in ${wait}ms`, { url, attempt, snippet });
        await sleep(wait);
        continue;
      }
      try {
        return JSON.parse(text);
      } catch {
        const snippet = trimmed.slice(0, 180).replace(/\s+/g, " ");
        throw new Error(`Parse error: invalid JSON response — ${snippet}`);
      }
    } catch (e) {
      clearTimeout(timer);
      lastErr = e;
      const wait = Math.min(8000, 400 * Math.pow(2, attempt));
      logger.warn(`fetch failed (attempt ${attempt + 1})`, {
        url,
        error: e instanceof Error ? e.message : String(e),
      });
      if (attempt < retries) await sleep(wait);
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error(String(lastErr));
}

module.exports = { fetchWithRetry };
