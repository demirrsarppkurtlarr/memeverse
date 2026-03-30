"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { FilterBar } from "@/components/meme/FilterBar";
import { MemeGrid } from "@/components/meme/MemeGrid";
import { RecentMemesRail } from "@/components/meme/RecentMemesRail";
import { useFilterStore } from "@/store";
import { TrendingUp, Zap, Globe } from "lucide-react";

function HeroBanner() {
  return (
    <div className="relative overflow-hidden px-4 pt-8 pb-6 bg-grid">
      {/* Glow orbs */}
      <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-brand-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -top-10 right-20 w-60 h-60 rounded-full bg-purple-500/8 blur-3xl pointer-events-none" />

      <div className="relative max-w-2xl">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse-soft" />
          <span className="text-xs font-mono text-green-400/70 tracking-wider">LIVE FEED</span>
          <span className="text-xs text-white/20">· Updated every 10 min</span>
        </div>
        <h1 className="font-display text-5xl sm:text-6xl tracking-wider mb-2">
          <span className="gradient-text">FRESH</span>{" "}
          <span className="text-white">MEMES</span>
        </h1>
        <p className="text-white/40 text-sm max-w-md">
          Local platform: four subreddits, smart tags, ranked feed — runs fully on your machine. Run{" "}
          <code className="text-brand-400/80 text-xs">npm run scraper</code> alongside{" "}
          <code className="text-brand-400/80 text-xs">npm run dev</code>.
        </p>

        {/* Stats pills */}
        <div className="flex flex-wrap items-center gap-2 mt-4">
          <div className="flex items-center gap-1.5 glass px-3 py-1.5 rounded-full text-xs text-white/60">
            <TrendingUp size={12} className="text-brand-400" />
            Trending now
          </div>
          <div className="flex items-center gap-1.5 glass px-3 py-1.5 rounded-full text-xs text-white/60">
            <Globe size={12} className="text-blue-400" />
            r/memes · r/dankmemes · r/funny · r/wholesomememes
          </div>
          <div className="flex items-center gap-1.5 glass px-3 py-1.5 rounded-full text-xs text-white/60">
            <Zap size={12} className="text-yellow-400" />
            AI-tagged
          </div>
        </div>
      </div>
    </div>
  );
}

function HomeContent() {
  const searchParams = useSearchParams();
  const { selectedCategory, selectedMediaType, sortBy } = useFilterStore();

  const search = searchParams.get("search") || undefined;
  const tag = searchParams.get("tag") || undefined;
  const sortParam = searchParams.get("sort") as "trending" | "newest" | "top" | "random" | null;

  return (
    <>
      <HeroBanner />
      <RecentMemesRail />
      <FilterBar />
      <div className="p-4">
        <MemeGrid
          params={{
            category: selectedCategory,
            mediaType: selectedMediaType,
            sort: sortParam || sortBy,
            search,
            tag,
          }}
        />
      </div>
    </>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="p-4">
        <div className="h-48 skeleton rounded-2xl mb-4" />
        <div className="masonry">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="masonry-item skeleton rounded-2xl h-48" />
          ))}
        </div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
