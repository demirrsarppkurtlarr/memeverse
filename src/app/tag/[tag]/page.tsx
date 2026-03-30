"use client";

import { use } from "react";
import { MemeGrid } from "@/components/meme/MemeGrid";
import { Hash } from "lucide-react";

interface Props {
  params: Promise<{ tag: string }>;
}

export default function TagPage({ params }: Props) {
  const { tag } = use(params);
  const decoded = decodeURIComponent(tag);

  return (
    <div>
      <div className="relative px-4 pt-8 pb-6 border-b border-white/5 overflow-hidden bg-grid">
        <div className="absolute -top-10 right-10 w-60 h-60 rounded-full bg-brand-500/8 blur-3xl pointer-events-none" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <Hash size={18} className="text-brand-400" />
            <span className="text-xs font-mono text-white/40 uppercase tracking-wider">Tag</span>
          </div>
          <h1 className="font-display text-5xl tracking-wider gradient-text">
            #{decoded.toUpperCase()}
          </h1>
          <p className="text-white/40 text-sm mt-1">All memes tagged with #{decoded}</p>
        </div>
      </div>
      <div className="p-4">
        <MemeGrid params={{ tag: decoded, sort: "trending" }} />
      </div>
    </div>
  );
}
