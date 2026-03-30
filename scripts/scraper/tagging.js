/**
 * Keyword-based meme tags (aligned with src/lib/memes/tagging.ts).
 */

const RULES = [
  { tag: "funny", patterns: [/funny|lol|haha|lmao|comedy|joke|humou?r|meme/i] },
  { tag: "dark", patterns: [/dark|death|morbid|nihil|edgy|void|cursed|hell/i] },
  { tag: "relatable", patterns: [/relatable|mood|same\b|me_irl|me irl|too real|accurate/i] },
  { tag: "gaming", patterns: [/game|gamer|gaming|minecraft|fortnite|steam|xbox|playstation|npc|gg\b|noob|pro gamer/i] },
  { tag: "anime", patterns: [/anime|manga|naruto|goku|waifu|otaku|weeb|jojo|one piece/i] },
];

/**
 * @param {string} title
 * @returns {string[]}
 */
function tagTitle(title) {
  const found = new Set();
  for (const { tag, patterns } of RULES) {
    for (const re of patterns) {
      re.lastIndex = 0;
      if (re.test(title || "")) {
        found.add(tag);
        break;
      }
    }
  }
  if (found.size === 0) found.add("funny");
  return Array.from(found);
}

module.exports = { tagTitle, RULES };
