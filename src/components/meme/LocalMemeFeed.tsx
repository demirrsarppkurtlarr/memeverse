"use client";

import { useEffect, useState } from "react";
import { Frown, RefreshCw } from "lucide-react";
import type { Meme } from "@/types";

export function LocalMemeFeed() {
  const [items, setItems] = useState<Meme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/memes?page=1&pageSize=50", {
          cache: "no-store",
        });
        const json = await res.json().catch(() => null);
        if (!res.ok) {
          const msg =
            json?.error?.message || `Request failed (${res.status})`;
          throw new Error(msg);
        }
        const list = json?.data?.items;
        if (!Array.isArray(list)) {
          throw new Error("Invalid response from /api/memes");
        }
        if (!cancelled) setItems(list);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load memes");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="p-4">
        <div className="masonry">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="masonry-item">
              <div className="skeleton rounded-2xl h-56 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 px-4 text-center">
        <Frown size={48} className="text-white/20" />
        <p className="text-white/50 text-sm max-w-md">{error}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="btn-ghost flex items-center gap-2 text-sm"
        >
          <RefreshCw size={14} /> Retry
        </button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 px-4 text-center">
        <span className="text-5xl">📭</span>
        <p className="text-white/50 text-sm max-w-md">
          No memes yet. Run{" "}
          <code className="text-brand-400/90 text-xs">npm run scraper</code> in
          a terminal, then refresh this page.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="masonry">
        {items.map((meme, i) => (
          <article
            key={meme.id}
            className="masonry-item glass rounded-2xl overflow-hidden border border-white/5 animate-fade-in"
            style={{ animationDelay: `${(i % 8) * 40}ms` }}
          >
            <a
              href={meme.source_url || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={meme.url}
                alt={meme.title}
                className="w-full h-auto object-cover bg-black/20"
                loading="lazy"
              />
            </a>
            <div className="p-3 border-t border-white/5">
              <p className="text-sm text-white/80 leading-snug line-clamp-3">
                {meme.title}
              </p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
