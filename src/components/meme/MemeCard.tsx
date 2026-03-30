"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useCallback } from "react";
import { Heart, Bookmark, Share2, Eye, Play } from "lucide-react";
import { cn, formatNumber, timeAgo, truncate } from "@/lib/utils";
import { useAuthStore, useNotificationStore, useLikeCacheStore } from "@/store";
import { pushRecentMeme } from "@/hooks/useRecentMemes";
import type { Meme } from "@/types";

interface MemeCardProps {
  meme: Meme;
  priority?: boolean;
}

export function MemeCard({ meme, priority = false }: MemeCardProps) {
  const { user } = useAuthStore();
  const { addNotification } = useNotificationStore();
  const { likedMemeIds, favoritedMemeIds, toggleMemeLike, toggleMemeFavorite } = useLikeCacheStore();
  const [localLikes, setLocalLikes] = useState(meme.likes);
  const [isSharing, setIsSharing] = useState(false);

  const isLiked = likedMemeIds.includes(meme.id);
  const isFavorited = favoritedMemeIds.includes(meme.id);

  const handleLike = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const nowLiked = toggleMemeLike(meme.id);
      setLocalLikes((prev) => prev + (nowLiked ? 1 : -1));
      if (user) {
        try {
          await fetch(`/api/likes`, {
            method: nowLiked ? "POST" : "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contentType: "meme", contentId: meme.id }),
          });
        } catch {
          /* offline — local state already updated */
        }
      }
    },
    [user, meme.id, toggleMemeLike]
  );

  const handleFavorite = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const nowFaved = toggleMemeFavorite(meme.id);
      addNotification({
        type: "success",
        message: nowFaved ? "Saved locally!" : "Removed from favorites",
      });
      if (user) {
        try {
          await fetch(`/api/favorites`, {
            method: nowFaved ? "POST" : "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contentType: "meme", contentId: meme.id }),
          });
        } catch {
          /* offline */
        }
      }
    },
    [user, meme.id, toggleMemeFavorite, addNotification]
  );

  const handleShare = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSharing(true);
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${origin}/meme/${meme.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: meme.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        addNotification({ type: "success", message: "Link copied to clipboard!" });
      }
    } catch {}
    setIsSharing(false);
  }, [meme.id, meme.title, addNotification]);

  const isVideo = meme.media_type === "video";
  const isGif = meme.media_type === "gif";

  return (
    <Link
      href={`/meme/${meme.id}`}
      className="meme-card group block"
      onClick={() =>
        pushRecentMeme({
          id: meme.id,
          title: meme.title,
          url: meme.thumbnail_url || meme.url,
        })
      }
    >
      {/* Media */}
      <div className="relative overflow-hidden bg-surface-900">
        {isVideo ? (
          <div className="relative aspect-video bg-black">
            <video
              src={meme.url}
              className="w-full h-full object-cover"
              muted
              playsInline
              loop
              preload="none"
              onMouseEnter={(e) => (e.currentTarget as HTMLVideoElement).play()}
              onMouseLeave={(e) => {
                const v = e.currentTarget as HTMLVideoElement;
                v.pause();
                v.currentTime = 0;
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-0 pointer-events-none">
              <div className="w-12 h-12 rounded-full bg-black/60 flex items-center justify-center">
                <Play size={20} fill="white" className="text-white ml-1" />
              </div>
            </div>
          </div>
        ) : (
          <div className="relative">
            <Image
              src={meme.thumbnail_url || meme.url}
              alt={meme.title}
              width={meme.width || 400}
              height={meme.height || 300}
              className="w-full h-auto object-cover"
              priority={priority}
              unoptimized={meme.url.includes("redd.it") || meme.url.includes("imgur")}
            />
          </div>
        )}

        {/* Media type badge */}
        {(isVideo || isGif) && (
          <span className={cn(
            "media-badge",
            isVideo ? "bg-red-500/80 text-white" : "bg-blue-500/80 text-white"
          )}>
            {isVideo ? "▶ VID" : "GIF"}
          </span>
        )}

        {/* Category badge */}
        {meme.category === "turkish" && (
          <span className="media-badge left-2 right-auto bg-red-700/80 text-white">🇹🇷</span>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent
                        opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={handleLike}
                className={cn(
                  "flex items-center gap-1.5 text-xs font-semibold transition-all duration-150",
                  isLiked ? "text-brand-400" : "text-white hover:text-brand-400"
                )}>
                <Heart size={15} fill={isLiked ? "currentColor" : "none"} />
                {formatNumber(localLikes)}
              </button>
              <span className="flex items-center gap-1 text-xs text-white/60">
                <Eye size={13} />
                {formatNumber(meme.views)}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button onClick={handleFavorite}
                className={cn(
                  "p-1.5 rounded-lg transition-colors",
                  isFavorited
                    ? "text-yellow-400 bg-yellow-400/10"
                    : "text-white/60 hover:text-yellow-400 hover:bg-white/10"
                )}>
                <Bookmark size={14} fill={isFavorited ? "currentColor" : "none"} />
              </button>
              <button onClick={handleShare}
                className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors">
                <Share2 size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-sm font-medium text-white/90 line-clamp-2 mb-2 leading-snug">
          {truncate(meme.title, 120)}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1">
            {meme.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="tag-pill text-[10px] py-0.5">#{tag}</span>
            ))}
          </div>
          <span className="text-[11px] text-white/30 font-mono shrink-0">
            {timeAgo(meme.created_at)}
          </span>
        </div>
      </div>
    </Link>
  );
}
