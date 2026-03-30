"use client";

const KEY = "memeverse-recent-memes";
const MAX = 50;

export interface RecentMeme {
  id: string;
  title: string;
  url: string;
  at: number;
}

function readAll(): RecentMeme[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as RecentMeme[]) : [];
  } catch {
    return [];
  }
}

function writeAll(items: RecentMeme[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items.slice(0, MAX)));
  } catch {
    /* quota */
  }
}

export function pushRecentMeme(item: { id: string; title: string; url: string }) {
  if (typeof window === "undefined") return;
  const next = readAll().filter((x) => x.id !== item.id);
  next.unshift({
    id: item.id,
    title: item.title,
    url: item.url,
    at: Date.now(),
  });
  writeAll(next);
}

export function getRecentMemes(): RecentMeme[] {
  return readAll();
}
