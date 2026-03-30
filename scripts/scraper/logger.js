/**
 * Lightweight structured logging for the scraper engine.
 */

function ts() {
  return new Date().toISOString();
}

const LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };
const envLevel = (process.env.SCRAPER_LOG_LEVEL || "info").toLowerCase();
const minLevel = LEVELS[envLevel] ?? LEVELS.info;

function log(level, message, meta) {
  if (LEVELS[level] < minLevel) return;
  const line = { time: ts(), level, message, ...meta };
  const text = `${line.time} [${level.toUpperCase()}] ${message}${
    meta && Object.keys(meta).length ? " " + JSON.stringify(meta) : ""
  }`;
  if (level === "error") console.error(text);
  else if (level === "warn") console.warn(text);
  else console.log(text);
}

module.exports = {
  debug: (msg, meta) => log("debug", msg, meta || {}),
  info: (msg, meta) => log("info", msg, meta || {}),
  warn: (msg, meta) => log("warn", msg, meta || {}),
  error: (msg, meta) => log("error", msg, meta || {}),
};
