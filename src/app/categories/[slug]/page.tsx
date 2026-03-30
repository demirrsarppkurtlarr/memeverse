"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { MemeGrid } from "@/components/meme/MemeGrid";
import type { MemeCategory } from "@/types";

const CATEGORY_META: Record<MemeCategory, { label: string; emoji: string; description: string }> = {
  global: { label: "Global", emoji: "🌐", description: "The best memes from around the world" },
  turkish: { label: "Turkish 🇹🇷", emoji: "🇹🇷", description: "En iyi Türk memleri — auto-detected" },
  trending: { label: "Trending", emoji: "🔥", description: "Highest-scored content right now" },
  classic: { label: "Classic", emoji: "💾", description: "Timeless internet culture" },
  nsfw: { label: "NSFW", emoji: "🔞", description: "Mature content (18+)" },
};

const VALID_CATEGORIES = Object.keys(CATEGORY_META) as MemeCategory[];

interface Props {
  params: Promise<{ slug: string }>;
}

export default function CategoryPage({ params }: Props) {
  const { slug } = use(params);

  if (!VALID_CATEGORIES.includes(slug as MemeCategory)) notFound();

  const category = slug as MemeCategory;
  const meta = CATEGORY_META[category];

  return (
    <div>
      {/* Header */}
      <div className="relative px-4 pt-8 pb-4 border-b border-white/5 bg-grid overflow-hidden">
        <div className="absolute -top-20 -right-10 w-60 h-60 rounded-full bg-brand-500/8 blur-3xl pointer-events-none" />
        <div className="relative">
          <span className="text-4xl block mb-2">{meta.emoji}</span>
          <h1 className="font-display text-5xl tracking-wider gradient-text">{meta.label.toUpperCase()}</h1>
          <p className="text-white/40 text-sm mt-1">{meta.description}</p>
        </div>
      </div>

      <div className="p-4">
        <MemeGrid params={{ category, sort: "trending" }} />
      </div>
    </div>
  );
}
