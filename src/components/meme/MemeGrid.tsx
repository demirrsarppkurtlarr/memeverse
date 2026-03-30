"use client";

import { useEffect, useRef, useCallback } from "react";
import { MemeCard } from "./MemeCard";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { useMemes } from "@/hooks/useMemes";
import type { MemesQueryParams } from "@/types";
import { Frown, RefreshCw } from "lucide-react";
import { AdInFeed } from "@/components/ads/AdInFeed";
import { ADS_CONFIG } from "@/lib/ads/config";

interface MemeGridProps {
  params: MemesQueryParams;
}

function formatFetchError(err: unknown): string {
  if (err instanceof Error) return err.message || "Couldn't load memes right now.";
  if (typeof err === "string") return err;
  return "Couldn't load memes right now.";
}

export function MemeGrid({ params }: MemeGridProps) {
  const { memes, hasMore, isLoading, error, loadMore } = useMemes(params);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const every = Math.max(0, ADS_CONFIG.rules.inFeedEvery || 0);

  const handleIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const entry = entries[0];
      if (entry.isIntersecting && hasMore && !isLoading) {
        loadMore();
      }
    },
    [hasMore, isLoading, loadMore]
  );

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(handleIntersect, {
      rootMargin: "800px",
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [handleIntersect]);

  if (isLoading && memes.length === 0) {
    return (
      <div className="p-4">
        <div className="masonry">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={`skeleton-${i}`} className="masonry-item">
              <SkeletonCard />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <Frown size={48} className="text-white/20" />
        <p className="text-white/50 text-sm max-w-md">{formatFetchError(error)}</p>
        <button onClick={() => window.location.reload()}
          className="btn-ghost flex items-center gap-2 text-sm">
          <RefreshCw size={14} /> Try again
        </button>
      </div>
    );
  }

  if (!isLoading && memes.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <span className="text-6xl">🤷</span>
        <p className="text-white/50 text-sm">No memes found. Try refreshing or check back later.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="masonry">
        {memes.flatMap((meme, i) => {
          const safeKey = meme?.id?.toString?.() || i.toString();

          // Null-safe shaping before passing into card renderer.
          const safeMeme = {
            ...meme,
            id: meme?.id?.toString?.() || i.toString(),
            title: meme?.title ?? "",
            url: meme?.url ?? "",
            thumbnail_url: meme?.thumbnail_url ?? meme?.url ?? "",
            media_type: meme?.media_type ?? "image",
            tags: Array.isArray(meme?.tags) ? meme.tags : [],
            likes: typeof meme?.likes === "number" ? meme.likes : 0,
            views: typeof meme?.views === "number" ? meme.views : 0,
            created_at: meme?.created_at ?? new Date().toISOString(),
          };

          const blocks: React.ReactNode[] = [
            <div
              key={safeKey}
              className="masonry-item animate-fade-in"
              style={{ animationDelay: `${(i % 8) * 40}ms` }}
            >
              <MemeCard meme={safeMeme} priority={i < 4} />
            </div>,
          ];

          if (every > 0 && (i + 1) % every === 0) {
            blocks.push(<AdInFeed key={`ad-${safeKey}-${i}`} index={i} />);
          }
          return blocks;
        })}
      </div>

      {isLoading && memes.length > 0 && (
        <div className="masonry mt-0">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={`load-more-skeleton-${i}`} className="masonry-item">
              <SkeletonCard />
            </div>
          ))}
        </div>
      )}

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} className="scroll-sentinel" />

      {/* End of content */}
      {!hasMore && memes.length > 0 && (
        <div className="text-center py-12">
          <p className="text-white/25 text-sm font-mono">— end of feed —</p>
        </div>
      )}
    </div>
  );
}