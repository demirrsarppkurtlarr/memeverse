"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, X, Music2, Image as ImageIcon } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";

interface SearchResult {
  memes: Array<{ id: string; title: string; thumbnail_url: string | null; url: string; category: string }>;
  sounds: Array<{ id: string; title: string; category: string; plays: number }>;
}

export function SearchCombobox({ className }: { className?: string }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (debouncedQuery.length < 2) { setResults(null); return; }
    const ctrl = new AbortController();
    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}&type=all`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((d) => { setResults(d.data); setLoading(false); })
      .catch(() => setLoading(false));
    return () => ctrl.abort();
  }, [debouncedQuery]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const hasResults = results && (results.memes.length > 0 || results.sounds.length > 0);
  const showDropdown = open && query.length >= 2;

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Search memes..."
          className="input-field pl-10 pr-8 py-2 text-sm h-10"
        />
        {query && (
          <button onClick={() => { setQuery(""); setResults(null); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors">
            <X size={14} />
          </button>
        )}
      </div>

      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 glass rounded-2xl shadow-2xl overflow-hidden z-50 max-h-96 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-6">
              <div className="w-5 h-5 border-2 border-brand-500/40 border-t-brand-500 rounded-full animate-spin" />
            </div>
          )}

          {!loading && !hasResults && query.length >= 2 && (
            <div className="text-center py-8 text-white/30 text-sm">
              No results for &ldquo;{query}&rdquo;
            </div>
          )}

          {!loading && hasResults && (
            <>
              {results!.memes.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 px-4 py-2 border-b border-white/5">
                    <ImageIcon size={12} className="text-white/30" />
                    <span className="text-[10px] font-mono text-white/30 uppercase tracking-wider">Memes</span>
                  </div>
                  {results!.memes.slice(0, 5).map((meme) => (
                    <Link key={meme.id} href={`/meme/${meme.id}`}
                      onClick={() => { setOpen(false); setQuery(""); }}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors">
                      <div className="w-8 h-8 rounded-lg overflow-hidden bg-surface-900 shrink-0">
                        <Image
                          src={meme.thumbnail_url || meme.url}
                          alt={meme.title}
                          width={32} height={32}
                          className="w-full h-full object-cover"
                          unoptimized
                        />
                      </div>
                      <span className="text-sm text-white/80 truncate">{meme.title}</span>
                    </Link>
                  ))}
                </div>
              )}

              {results!.sounds.length > 0 && (
                <div className="border-t border-white/5">
                  <div className="flex items-center gap-2 px-4 py-2 border-b border-white/5">
                    <Music2 size={12} className="text-white/30" />
                    <span className="text-[10px] font-mono text-white/30 uppercase tracking-wider">Sounds</span>
                  </div>
                  {results!.sounds.slice(0, 4).map((sound) => (
                    <Link key={sound.id} href="/soundboard"
                      onClick={() => { setOpen(false); setQuery(""); }}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center shrink-0">
                        <Music2 size={14} className="text-purple-400" />
                      </div>
                      <span className="text-sm text-white/80 truncate">{sound.title}</span>
                      <span className="text-[10px] text-white/30 ml-auto shrink-0 capitalize">{sound.category}</span>
                    </Link>
                  ))}
                </div>
              )}

              <div className="border-t border-white/5 p-2">
                <Link href={`/search?q=${encodeURIComponent(query)}`}
                  onClick={() => { setOpen(false); setQuery(""); }}
                  className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl hover:bg-white/5
                             text-xs text-white/40 hover:text-white transition-colors">
                  <Search size={12} />
                  See all results for &ldquo;{query}&rdquo;
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
