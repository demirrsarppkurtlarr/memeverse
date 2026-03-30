/**
 * Keyword tagging (mirror scripts/scraper/tagging.js rules).
 */

const RULES: { tag: string; patterns: RegExp[] }[] = [
  { tag: "funny", patterns: [/funny|lol|haha|lmao|comedy|joke|humou?r|meme/i] },
  { tag: "dark", patterns: [/dark|death|morbid|nihil|edgy|void|cursed|hell/i] },
  { tag: "relatable", patterns: [/relatable|mood|same\b|me_irl|me irl|too real|accurate/i] },
  {
    tag: "gaming",
    patterns: [/game|gamer|gaming|minecraft|fortnite|steam|xbox|playstation|npc|gg\b|noob|pro gamer/i],
  },
  { tag: "anime", patterns: [/anime|manga|naruto|goku|waifu|otaku|weeb|jojo|one piece/i] },
];

export const MEME_TAG_LABELS = ["funny", "dark", "relatable", "gaming", "anime"] as const;
export type MemeContentTag = (typeof MEME_TAG_LABELS)[number];

export function tagTitle(title: string): string[] {
  const found = new Set<string>();
  for (const { tag, patterns } of RULES) {
    for (const re of patterns) {
      if (re.test(title || "")) {
        found.add(tag);
        break;
      }
    }
  }
  if (found.size === 0) found.add("funny");
  return Array.from(found);
}
