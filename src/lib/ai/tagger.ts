// ============================================================
// AI TAGGING SYSTEM
// Provides auto-tagging, language detection, title normalization,
// and Turkish vs Global classification
// ============================================================

const TURKISH_KEYWORDS = [
  "türk", "türkiye", "ankara", "istanbul", "izmir", "bursa", "adana",
  "antalya", "konya", "gaziantep", "şanlıurfa", "kayseri", "mersin",
  "trabzon", "samsun", "malatya", "erzurum", "van", "diyarbakır",
  "recep", "tayyip", "erdoğan", "atatürk", "cumhuriyet", "millet",
  "devlet", "hükümet", "meclis", "tbmm", "anayasa",
  "lan", "mk", "ya", "benim", "senin", "onun", "bizim", "sizin",
  "abi", "kardeş", "kanka", "reis", "hoca", "hocam",
  "türkçe", "osmanlı", "anadolu", "boğaz", "karadeniz", "ege", "akdeniz",
  "lira", "tl", "liram", "dolar", "avro",
  "çay", "kahve", "döner", "kebap", "baklava", "börek", "simit",
  "galatasaray", "fenerbahçe", "beşiktaş", "trabzonspor",
  "trt", "kanal d", "show tv", "star tv", "atv",
];

const TURKISH_CHARS_PATTERN = /[ğüşıöçĞÜŞİÖÇ]/;

// Extended meme tag dictionary
const TAG_PATTERNS: Record<string, RegExp> = {
  // Emotions
  funny: /\b(funny|hilarious|lol|lmao|rofl|haha|😂|🤣|comedy|humor|joke)\b/i,
  sad: /\b(sad|crying|depressed|depression|crying|😢|😭|oof|feelsbadman|pain)\b/i,
  angry: /\b(angry|mad|furious|rage|😡|🤬|pissed|upset)\b/i,
  wholesome: /\b(wholesome|cute|sweet|heartwarming|blessed|aww|adorable|love)\b/i,
  relatable: /\b(relatable|me|mood|same|story|everyday|life|true|facts)\b/i,
  shock: /\b(shocked|surprised|omg|wtf|what|bruh|wait|no way|seriously)\b/i,
  cringe: /\b(cringe|cringeworthy|awkward|yikes|oof|bruh)\b/i,
  dark: /\b(dark|morbid|edgy|blackhumor|black humor|twisted)\b/i,

  // Content types
  gaming: /\b(gaming|gamer|game|games|ps5|xbox|nintendo|steam|minecraft|fortnite|valorant|lol|dota|cod|fps|rpg|mmo)\b/i,
  anime: /\b(anime|manga|otaku|weeb|waifu|senpai|naruto|one piece|dragon ball|attack on titan|aot|jojo|demon slayer|chainsaw man)\b/i,
  movie: /\b(movie|film|cinema|netflix|disney|marvel|dc|star wars|lord of the rings|harry potter|james bond|action|horror|thriller)\b/i,
  politics: /\b(politics|political|government|president|election|vote|democrat|republican|biden|trump|liberal|conservative)\b/i,
  sports: /\b(sports|football|soccer|basketball|nba|nfl|fifa|world cup|champion|champion league|olympics)\b/i,
  tech: /\b(tech|technology|programming|coding|developer|software|hardware|ai|machine learning|crypto|blockchain|nft)\b/i,
  food: /\b(food|cooking|recipe|eat|hungry|pizza|burger|sushi|ramen|pasta|coffee|tea|drink)\b/i,
  animals: /\b(animals|cat|dog|pet|cute|puppy|kitten|bird|fish|wildlife|nature)\b/i,
  relationship: /\b(girlfriend|boyfriend|relationship|love|crush|dating|marriage|wife|husband|single|couple|romance)\b/i,
  school: /\b(school|college|university|student|homework|exam|teacher|study|education|class|grade)\b/i,
  work: /\b(work|job|office|boss|employee|monday|weekend|salary|meeting|deadline|career)\b/i,

  // Internet culture
  dank: /\b(dank|dankmemes|quality|meme quality|cursed|blessed|based)\b/i,
  classic: /\b(classic|og|original|throwback|2012|2013|2014|old school|nostalgia)\b/i,
  viral: /\b(viral|trending|popular|top|best|most|record)\b/i,
  cursed: /\b(cursed|wtf|disturbing|unholy|nightmare|creepy|weird)\b/i,
  chad: /\b(chad|sigma|alpha|based|gigachad|king|goat|legend|icon)\b/i,
  npc: /\b(npc|bot|shill|sheep|zombie|mindless|follower)\b/i,
};

const SUBREDDIT_TAGS: Record<string, string[]> = {
  memes: ["meme", "funny", "relatable"],
  dankmemes: ["dank", "meme", "internet"],
  funny: ["funny", "humor", "comedy"],
  me_irl: ["relatable", "life", "mood"],
  AdviceAnimals: ["classic", "advice", "animal"],
  "PrequelMemes": ["star wars", "movie", "classic"],
  gaming: ["gaming"],
  anime_irl: ["anime", "relatable"],
  wholesomememes: ["wholesome", "positive"],
  Animemes: ["anime", "meme"],
};

export function detectLanguage(text: string): string {
  if (!text) return "en";

  // Check for Turkish characters
  if (TURKISH_CHARS_PATTERN.test(text)) return "tr";

  // Check for Turkish keywords
  const lowerText = text.toLowerCase();
  const turkishKeywordCount = TURKISH_KEYWORDS.filter((kw) =>
    lowerText.includes(kw)
  ).length;

  if (turkishKeywordCount >= 2) return "tr";
  if (turkishKeywordCount === 1 && text.length < 100) return "tr";

  return "en";
}

export function classifyCategory(
  title: string,
  subreddit: string | null,
  language: string
): "global" | "turkish" | "classic" {
  if (language === "tr") return "turkish";

  if (subreddit) {
    const lowerSub = subreddit.toLowerCase();
    if (lowerSub.includes("turkey") || lowerSub.includes("türk")) return "turkish";
    const classicSubs = ["adviceanimals", "AdviceAnimals", "fffffffuuuuuuuuuuuu"];
    if (classicSubs.includes(subreddit)) return "classic";
  }

  return "global";
}

export function generateTags(
  title: string,
  subreddit: string | null,
  language: string
): string[] {
  const tags = new Set<string>();

  // Language tag
  if (language === "tr") tags.add("turkish");

  // Subreddit-based tags
  if (subreddit && SUBREDDIT_TAGS[subreddit]) {
    SUBREDDIT_TAGS[subreddit].forEach((t) => tags.add(t));
  }

  // Pattern-based tags from title
  const fullText = `${title} ${subreddit || ""}`;
  for (const [tag, pattern] of Object.entries(TAG_PATTERNS)) {
    if (pattern.test(fullText)) {
      tags.add(tag);
    }
  }

  // Always add meme
  tags.add("meme");

  return Array.from(tags).slice(0, 10); // max 10 tags
}

export function normalizeTitle(rawTitle: string): string {
  return rawTitle
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[*_~`]+/g, "")
    .replace(/^\[.*?\]\s*/g, "") // Remove [OC], [Meta], etc.
    .replace(/\u200B/g, "") // Remove zero-width spaces
    .substring(0, 200);
}

export function isLikelyMemeContent(
  url: string,
  mediaType: string | null,
  postHint: string | null
): boolean {
  if (!url) return false;

  // Direct image/video links
  const imageExtensions = /\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i;
  const videoExtensions = /\.(mp4|webm|mov)(\?.*)?$/i;

  if (imageExtensions.test(url) || videoExtensions.test(url)) return true;
  if (url.includes("i.redd.it") || url.includes("preview.redd.it")) return true;
  if (url.includes("i.imgur.com") || url.includes("imgur.com/")) return true;

  if (postHint === "image" || postHint === "hosted:video" || postHint === "rich:video") {
    return true;
  }

  return false;
}

export function getMediaTypeFromUrl(url: string, isVideo: boolean): "image" | "video" | "gif" {
  if (isVideo) return "video";
  if (/\.gif(\?.*)?$/i.test(url)) return "gif";
  if (/\.(mp4|webm|mov)(\?.*)?$/i.test(url)) return "video";
  return "image";
}

export function calculateTrendingScore(
  likes: number,
  views: number,
  redditScore: number,
  createdAt: Date
): number {
  const hoursElapsed = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);
  const raw = likes * 3 + views * 0.5 + redditScore * 0.1;
  return raw / Math.pow(hoursElapsed + 2, 1.5);
}
