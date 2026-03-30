"use client";

import useSWR from "swr";
import Link from "next/link";
import Image from "next/image";
import { TrendingUp, Zap } from "lucide-react";
import { formatNumber } from "@/lib/utils";

interface TrendingData {
  topMemes: Array<{
    id: string;
    title: string;
    thumbnail_url: string | null;
    url: string;
    likes: number;
    views: number;
    score: number;
    category: string;
  }>;
  trendingTags: Array<{ tag: string; count: number }>;
  last24hCount: number;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json()).then((d) => d.data);

export function TrendingWidget() {
  const { data, isLoading } = useSWR<TrendingData>("/api/trending", fetcher, {
    revalidateOnFocus: false,
    refreshInterval: 5 * 60 * 1000, // refresh every 5 min
  });

  if (isLoading || !data) return null;

  return (
    <div className="space-y-6">
      {/* 24h counter */}
      <div className="glass rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-1">
          <Zap size={14} className="text-yellow-400" />
          <p className="text-xs font-mono text-white/40 uppercase tracking-wider">Last 24h</p>
        </div>
        <p className="font-display text-3xl tracking-wider gradient-text">
          +{formatNumber(data.last24hCount)}
        </p>
        <p className="text-white/30 text-xs">new memes added</p>
      </div>

      {/* Top trending memes */}
      <div className="glass rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={14} className="text-brand-400" />
          <p className="text-xs font-mono text-white/40 uppercase tracking-wider">Hot Right Now</p>
        </div>
        <div className="space-y-2">
          {data.topMemes.map((meme, i) => (
            <Link key={meme.id} href={`/meme/${meme.id}`}
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors group">
              <span className="text-xs font-mono text-white/20 w-4 shrink-0">
                {i + 1}
              </span>
              <div className="w-10 h-10 rounded-lg overflow-hidden bg-surface-900 shrink-0">
                <Image
                  src={meme.thumbnail_url || meme.url}
                  alt={meme.title}
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white/70 group-hover:text-white transition-colors line-clamp-2 leading-snug">
                  {meme.title}
                </p>
                <p className="text-[10px] text-white/25 font-mono mt-0.5">
                  ♥ {formatNumber(meme.likes)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Trending tags */}
      <div className="glass rounded-2xl p-4">
        <p className="text-xs font-mono text-white/40 uppercase tracking-wider mb-3">Trending Tags</p>
        <div className="flex flex-wrap gap-1.5">
          {data.trendingTags.map(({ tag, count }) => (
            <Link key={tag} href={`/?tag=${tag}`}
              className="tag-pill text-[11px] flex items-center gap-1">
              #{tag}
              <span className="text-white/20">{count}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
