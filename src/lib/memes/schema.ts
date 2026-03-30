/**
 * Persistent local meme document (data/memes.json v2).
 */
export interface PlatformMeme {
  id: string;
  title: string;
  url: string;
  source: string;
  score: number;
  tags: string[];
  createdAt: string;
  postUrl?: string;
  upvotes?: number;
  comments?: number;
}

export interface MemesDataFile {
  version: number;
  updatedAt: string | null;
  memes: PlatformMeme[];
}
