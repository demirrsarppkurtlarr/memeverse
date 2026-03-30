"use client";

import { useState, useCallback } from "react";
import { SoundButton } from "./SoundButton";
import { SoundSkeleton } from "@/components/ui/SkeletonCard";
import type { Sound } from "@/types";

interface SoundGridProps {
  sounds: Sound[];
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
}

export function SoundGrid({ sounds, isLoading, hasMore, onLoadMore }: SoundGridProps) {
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<string | null>(null);

  const handlePlay = useCallback((id: string | null) => {
    setCurrentlyPlayingId(id);
  }, []);

  if (isLoading && sounds.length === 0) {
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {Array.from({ length: 12 }).map((_, i) => <SoundSkeleton key={i} />)}
      </div>
    );
  }

  if (!isLoading && sounds.length === 0) {
    return (
      <div className="text-center py-16">
        <span className="text-5xl block mb-3">🔇</span>
        <p className="text-white/40 text-sm">No sounds found</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {sounds.map((sound, i) => (
          <div key={sound.id} className="animate-fade-in"
            style={{ animationDelay: `${(i % 8) * 30}ms` }}>
            <SoundButton
              sound={sound}
              onPlay={handlePlay}
              currentlyPlayingId={currentlyPlayingId}
            />
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="text-center mt-8">
          <button onClick={onLoadMore} className="btn-ghost text-sm px-8">
            Load more sounds
          </button>
        </div>
      )}

      {!hasMore && sounds.length > 0 && (
        <div className="text-center py-10">
          <p className="text-white/20 text-xs font-mono">— end of soundboard —</p>
        </div>
      )}
    </div>
  );
}
