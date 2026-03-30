"use client";

import { useState, useCallback } from "react";
import { Music2, Search } from "lucide-react";
import { SoundButton } from "@/components/sound/SoundButton";
import { SoundSkeleton } from "@/components/ui/SkeletonCard";
import { useSounds } from "@/hooks/useSounds";
import { useFilterStore } from "@/store";
import { cn } from "@/lib/utils";
import type { SoundCategory } from "@/types";

const SOUND_CATEGORIES: Array<{ value: SoundCategory | "all"; label: string; emoji: string }> = [
  { value: "all", label: "All", emoji: "🎵" },
  { value: "meme", label: "Meme", emoji: "😂" },
  { value: "funny", label: "Funny", emoji: "🤣" },
  { value: "bass", label: "Bass", emoji: "🔊" },
  { value: "anime", label: "Anime", emoji: "🎌" },
  { value: "gaming", label: "Gaming", emoji: "🎮" },
  { value: "movie", label: "Movie", emoji: "🎬" },
  { value: "turkish", label: "Turkish", emoji: "🇹🇷" },
  { value: "classic", label: "Classic", emoji: "💾" },
];

export default function SoundboardPage() {
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const { soundCategory, setSoundCategory } = useFilterStore();

  const { sounds, hasMore, isLoading, loadMore } = useSounds({
    category: soundCategory,
    search: search || undefined,
    sort: "popular",
  });

  const handlePlay = useCallback((id: string | null) => {
    setCurrentlyPlayingId(id);
  }, []);

  return (
    <div>
      {/* Header */}
      <div className="relative px-4 pt-8 pb-6 border-b border-white/5 overflow-hidden bg-grid">
        <div className="absolute -top-10 right-0 w-64 h-64 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-20 w-40 h-40 rounded-full bg-brand-500/8 blur-2xl pointer-events-none" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
              <Music2 size={20} className="text-purple-400" />
            </div>
            <div>
              <h1 className="font-display text-5xl tracking-wider gradient-text">SOUNDBOARD</h1>
              <p className="text-white/40 text-xs">Click any sound to play instantly</p>
            </div>
          </div>

          {currentlyPlayingId && (
            <div className="flex items-center gap-2 mt-3">
              <div className="audio-wave text-brand-400 flex items-end gap-px h-4">
                <span /><span /><span /><span /><span />
              </div>
              <span className="text-xs text-brand-400 font-mono">NOW PLAYING</span>
              <button onClick={() => setCurrentlyPlayingId(null)}
                className="text-xs text-white/30 hover:text-white ml-2 transition-colors">
                Stop all
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="sticky top-16 z-30 border-b border-white/5 px-4 py-3 space-y-3"
        style={{ background: "rgba(8,8,15,0.9)", backdropFilter: "blur(16px)" }}>
        {/* Search */}
        <div className="relative max-w-sm">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search sounds..."
            className="input-field pl-10 py-2 text-sm h-9"
          />
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
          {SOUND_CATEGORIES.map(({ value, label, emoji }) => (
            <button key={value} onClick={() => setSoundCategory(value)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-150 shrink-0 border",
                soundCategory === value
                  ? "bg-purple-500/20 border-purple-500/50 text-purple-300"
                  : "border-white/8 text-white/50 hover:text-white hover:border-white/20 bg-white/3"
              )}>
              {emoji} {label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="p-4">
        {isLoading && sounds.length === 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {Array.from({ length: 12 }).map((_, i) => <SoundSkeleton key={i} />)}
          </div>
        ) : sounds.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-5xl block mb-3">🔇</span>
            <p className="text-white/40 text-sm">No sounds found</p>
          </div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {sounds.map((sound) => (
                <SoundButton
                  key={sound.id}
                  sound={sound}
                  onPlay={handlePlay}
                  currentlyPlayingId={currentlyPlayingId}
                />
              ))}
            </div>
            {hasMore && (
              <div className="text-center mt-8">
                <button onClick={loadMore}
                  className="btn-ghost text-sm px-6">
                  Load more sounds
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
