"use client";

import { MemeGrid } from "@/components/meme/MemeGrid";
import { TrendingUp, Flame, Zap } from "lucide-react";

export default function TrendingPage() {
  return (
    <div>
      <div className="relative px-4 pt-8 pb-6 border-b border-white/5 overflow-hidden bg-grid">
        <div className="absolute -top-10 right-10 w-72 h-72 rounded-full bg-orange-500/8 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-brand-500/5 blur-2xl pointer-events-none" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse-soft" />
            <span className="text-xs font-mono text-orange-400/70 tracking-wider uppercase">Trending Now</span>
          </div>
          <h1 className="font-display text-5xl tracking-wider mb-2">
            <span className="text-orange-400">🔥</span>{" "}
            <span className="gradient-text">TRENDING</span>
          </h1>
          <p className="text-white/40 text-sm">
            The highest-scored content globally, updated continuously
          </p>
          <div className="flex items-center gap-3 mt-3">
            <div className="flex items-center gap-1.5 glass px-3 py-1.5 rounded-full text-xs text-white/50">
              <TrendingUp size={12} className="text-orange-400" />
              Score-based ranking
            </div>
            <div className="flex items-center gap-1.5 glass px-3 py-1.5 rounded-full text-xs text-white/50">
              <Zap size={12} className="text-yellow-400" />
              Time-decay algorithm
            </div>
          </div>
        </div>
      </div>

      <div className="p-4">
        <MemeGrid params={{ sort: "trending", category: "all" }} />
      </div>
    </div>
  );
}
