#!/usr/bin/env node
/**
 * Local scraper entrypoint.
 * - Runs immediately
 * - Then runs every 10 minutes (cron schedule)
 *
 * Writes `data/memes.json` (v2 schema).
 */

const cron = require("node-cron");
const { scrapeOnce } = require("./scraper/run");
const logger = require("./scraper/logger");

async function main() {
  try {
    await scrapeOnce();
  } catch (e) {
    logger.error("Scrape failed", { error: e instanceof Error ? e.message : String(e) });
  }
}

main();
cron.schedule("*/10 * * * *", main);

console.log("Scraper running: immediate + every 10 minutes (*/10 * * * *). Press Ctrl+C to stop.");
