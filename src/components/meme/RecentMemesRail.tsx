"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { getRecentMemes, type RecentMeme } from "@/hooks/useRecentMemes";

export function RecentMemesRail() {
  const [items, setItems] = useState<RecentMeme[]>([]);

  useEffect(() => {
    setItems(getRecentMemes().slice(0, 12));
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="px-4 pb-2 border-b border-white/5">
      <div className="flex items-center gap-2 mb-2 text-xs font-mono text-white/35 uppercase tracking-wider">
        <Clock size={12} />
        Recently viewed
      </div>
      <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
        {items.map((m) => (
          <Link
            key={m.id}
            href={`/meme/${m.id}`}
            className="shrink-0 w-20 rounded-lg overflow-hidden border border-white/10 hover:border-brand-500/40 transition-colors bg-black/30"
            title={m.title}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={m.url} alt="" className="w-full h-20 object-cover bg-black/40" loading="lazy" />
          </Link>
        ))}
      </div>
    </div>
  );
}
