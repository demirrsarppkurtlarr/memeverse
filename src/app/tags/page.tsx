"use client";

import { useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { Hash, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((r) => r.json()).then((d) => d.data);

export default function TagsPage() {
  const [search, setSearch] = useState("");
  const { data: tags, isLoading } = useSWR<Array<{ tag: string; count: number }>>("/api/tags", fetcher);

  const filtered = (tags || []).filter((t) =>
    t.tag.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Hash size={20} className="text-brand-400" />
          <h1 className="font-display text-5xl tracking-wider gradient-text">TAGS</h1>
        </div>
        <p className="text-white/40 text-sm">Browse memes by tag</p>
      </div>

      <div className="relative mb-6 max-w-sm">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter tags..."
          className="input-field pl-10 py-2 text-sm"
        />
      </div>

      {isLoading ? (
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 30 }).map((_, i) => (
            <div key={i} className="skeleton h-8 rounded-full" style={{ width: `${60 + Math.random() * 60}px` }} />
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {filtered.map(({ tag, count }) => (
            <Link
              key={tag}
              href={`/tag/${encodeURIComponent(tag)}`}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all duration-150",
                "border-white/10 text-white/60 bg-white/3 hover:border-brand-500/50 hover:text-brand-400 hover:bg-brand-500/8"
              )}
            >
              <span>#{tag}</span>
              <span className="text-xs text-white/25 font-mono">{count}</span>
            </Link>
          ))}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <p className="text-white/30 text-sm text-center py-12">No tags found for &ldquo;{search}&rdquo;</p>
      )}
    </div>
  );
}
