import { createHash } from "crypto";
import { existsSync } from "fs";
import fs from "fs/promises";
import path from "path";
import type { Meme } from "@/types";
import type { MemesDataFile, PlatformMeme } from "./schema";
import { tagTitle } from "./tagging";

let memoryCache: { mtimeMs: number; file: MemesDataFile } | null = null;

export function resolveMemesJsonPath(): string {
  const candidates = [
    path.join(process.cwd(), "data", "memes.json"),
    path.join(process.cwd(), "memeverse", "data", "memes.json"),
    path.join(process.cwd(), "..", "data", "memes.json"),
  ];
  for (const p of candidates) {
    if (existsSync(p)) return p;
  }
  return candidates[0];
}

function migrateLegacyRow(row: unknown): PlatformMeme | null {
  if (!row || typeof row !== "object") return null;
  const r = row as Record<string, unknown>;
  if (typeof r.url === "string" && typeof r.id === "string" && typeof r.title === "string") {
    return r as unknown as PlatformMeme;
  }
  if (typeof r.imageUrl === "string" && typeof r.title === "string") {
    const imageUrl = r.imageUrl;
    const dk = createHash("sha256")
      .update(`${String(imageUrl).split("?")[0]}||${String(r.title).toLowerCase()}`)
      .digest("hex")
      .slice(0, 20);
    return {
      id: `lm_${dk}`,
      title: String(r.title),
      url: imageUrl,
      source: "memes",
      score: typeof r.score === "number" ? r.score : 0,
      tags: tagTitle(String(r.title)),
      createdAt: typeof r.createdAt === "string" ? r.createdAt : new Date().toISOString(),
      postUrl: typeof r.postLink === "string" ? r.postLink : "",
      upvotes: 0,
      comments: 0,
    };
  }
  return null;
}

function normalizeFile(raw: MemesDataFile): MemesDataFile {
  const memes: PlatformMeme[] = [];
  for (const row of raw.memes || []) {
    const m = migrateLegacyRow(row);
    if (m) memes.push(m);
  }
  return {
    version: raw.version ?? 2,
    updatedAt: raw.updatedAt,
    memes,
  };
}

export async function loadMemesDataFile(): Promise<MemesDataFile> {
  const filePath = resolveMemesJsonPath();
  try {
    const stat = await fs.stat(filePath);
    if (memoryCache && memoryCache.mtimeMs === stat.mtimeMs) {
      return memoryCache.file;
    }
    const raw = await fs.readFile(filePath, "utf-8");
    const parsed = JSON.parse(raw) as MemesDataFile;
    const normalized = normalizeFile(parsed);
    memoryCache = { mtimeMs: stat.mtimeMs, file: normalized };
    return normalized;
  } catch {
    const empty: MemesDataFile = { version: 2, updatedAt: null, memes: [] };
    memoryCache = { mtimeMs: 0, file: empty };
    return empty;
  }
}

/** Call after external scraper writes file */
export function invalidateMemesCache() {
  memoryCache = null;
}

function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function seededMulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleWithSeed<T>(items: T[], seedStr: string): T[] {
  const rnd = seededMulberry32(hashSeed(seedStr));
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function platformMemeToMeme(p: PlatformMeme): Meme {
  const ts = p.createdAt || new Date().toISOString();
  return {
    id: p.id,
    title: p.title,
    description: null,
    url: p.url,
    thumbnail_url: p.url,
    media_type: "image",
    width: null,
    height: null,
    file_size: null,
    source: "reddit",
    source_id: p.id,
    source_url: p.postUrl || null,
    subreddit: p.source,
    author_name: null,
    category: "global",
    language: "en",
    tags: p.tags,
    views: 0,
    likes: p.upvotes ?? 0,
    shares: 0,
    score: p.score,
    reddit_score: p.upvotes ?? 0,
    is_active: true,
    is_nsfw: false,
    is_featured: false,
    uploaded_by: null,
    created_at: ts,
    updated_at: ts,
  };
}

export type MemeSortMode = "trending" | "newest" | "random";

export interface MemeQueryOptions {
  page: number;
  pageSize: number;
  q?: string;
  tag?: string;
  sort: MemeSortMode;
  randomSeed?: string;
}

export async function queryMemes(options: MemeQueryOptions): Promise<{
  items: Meme[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}> {
  const file = await loadMemesDataFile();
  let rows = file.memes.filter((m) => m.url && m.title);

  const q = options.q?.trim().toLowerCase();
  if (q) {
    rows = rows.filter((m) => m.title.toLowerCase().includes(q));
  }

  const tag = options.tag?.trim().toLowerCase();
  if (tag) {
    rows = rows.filter((m) => m.tags.some((t) => t.toLowerCase() === tag));
  }

  const sort = options.sort;
  if (sort === "newest") {
    rows = [...rows].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  } else if (sort === "trending") {
    rows = [...rows].sort((a, b) => b.score - a.score);
  } else if (sort === "random") {
    const seed = options.randomSeed || new Date().toISOString().slice(0, 10);
    rows = shuffleWithSeed(rows, seed);
  }

  const total = rows.length;
  const from = (options.page - 1) * options.pageSize;
  const slice = rows.slice(from, from + options.pageSize);
  const items = slice.map(platformMemeToMeme);

  return {
    items,
    total,
    page: options.page,
    pageSize: options.pageSize,
    hasMore: from + options.pageSize < total,
  };
}

export async function getPlatformMemeById(id: string): Promise<PlatformMeme | null> {
  const file = await loadMemesDataFile();
  return file.memes.find((m) => m.id === id) ?? null;
}
