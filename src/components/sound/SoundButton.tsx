"use client";

import { useState, useRef, useCallback } from "react";
import { Play, Pause, Heart, Bookmark, Volume2 } from "lucide-react";
import { cn, formatNumber, formatDuration } from "@/lib/utils";
import { useAuthStore, useNotificationStore, useLikeCacheStore } from "@/store";
import type { Sound } from "@/types";

const CATEGORY_COLORS: Record<string, string> = {
  funny: "text-yellow-400",
  bass: "text-purple-400",
  anime: "text-pink-400",
  gaming: "text-green-400",
  movie: "text-blue-400",
  turkish: "text-red-400",
  meme: "text-brand-400",
  classic: "text-orange-400",
};

interface SoundButtonProps {
  sound: Sound;
  onPlay?: (id: string) => void;
  currentlyPlayingId?: string | null;
}

export function SoundButton({ sound, onPlay, currentlyPlayingId }: SoundButtonProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [localLikes, setLocalLikes] = useState(sound.likes);

  const { user } = useAuthStore();
  const { addNotification } = useNotificationStore();
  const { likedSoundIds, favoritedSoundIds, toggleSoundLike, toggleSoundFavorite } = useLikeCacheStore();

  const isPlaying = currentlyPlayingId === sound.id;
  const isLiked = likedSoundIds.includes(sound.id);
  const isFavorited = favoritedSoundIds.includes(sound.id);
  const categoryColor = CATEGORY_COLORS[sound.category] || "text-white/60";

  const handlePlay = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isPlaying) {
      audioRef.current?.pause();
      onPlay?.(null!);
      return;
    }

    onPlay?.(sound.id);
    setIsLoading(true);

    if (!audioRef.current) {
      audioRef.current = new Audio(sound.url);
      audioRef.current.addEventListener("timeupdate", () => {
        if (audioRef.current) {
          setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
        }
      });
      audioRef.current.addEventListener("ended", () => {
        setProgress(0);
        onPlay?.(null!);
      });
    }

    try {
      await audioRef.current.play();
      // Track play
      fetch(`/api/sounds/${sound.id}/play`, { method: "POST" }).catch(() => {});
    } catch {}
    setIsLoading(false);
  }, [isPlaying, sound.id, sound.url, onPlay]);

  // Stop when another sound starts
  if (!isPlaying && audioRef.current && !audioRef.current.paused) {
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setProgress(0);
  }

  const handleLike = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      const nowLiked = toggleSoundLike(sound.id);
      setLocalLikes((p) => p + (nowLiked ? 1 : -1));
      if (user) {
        try {
          await fetch(`/api/likes`, {
            method: nowLiked ? "POST" : "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contentType: "sound", contentId: sound.id }),
          });
        } catch {
          /* ignore */
        }
      }
    },
    [user, sound.id, toggleSoundLike]
  );

  const handleFavorite = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      const nowFaved = toggleSoundFavorite(sound.id);
      addNotification({
        type: "success",
        message: nowFaved ? "Saved locally!" : "Removed from favorites",
      });
      if (user) {
        try {
          await fetch(`/api/favorites`, {
            method: nowFaved ? "POST" : "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contentType: "sound", contentId: sound.id }),
          });
        } catch {
          /* ignore */
        }
      }
    },
    [user, sound.id, toggleSoundFavorite, addNotification]
  );

  return (
    <div className={cn("sound-btn group", isPlaying && "playing")} onClick={handlePlay}>
      {/* Progress bar */}
      {isPlaying && (
        <div className="absolute bottom-0 left-0 h-0.5 bg-brand-500 transition-all duration-100 rounded-b-2xl"
          style={{ width: `${progress}%` }} />
      )}

      {/* Play button + wave */}
      <div className="flex items-center gap-3">
        <button
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200",
            isPlaying
              ? "bg-brand-500 shadow-lg shadow-brand-500/30"
              : "bg-white/8 group-hover:bg-brand-500/20"
          )}
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
          ) : isPlaying ? (
            <div className="audio-wave text-white flex items-end gap-px h-4">
              <span /><span /><span /><span /><span />
            </div>
          ) : (
            <Play size={16} fill="currentColor" className="text-white/70 group-hover:text-brand-400 ml-0.5 transition-colors" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{sound.title}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={cn("text-[11px] font-medium capitalize", categoryColor)}>
              {sound.category}
            </span>
            {sound.duration_ms && (
              <>
                <span className="text-white/20 text-[11px]">·</span>
                <span className="text-[11px] text-white/30 font-mono">
                  {formatDuration(sound.duration_ms)}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between mt-1">
        <div className="flex items-center gap-1 text-[11px] text-white/30 font-mono">
          <Volume2 size={11} />
          <span>{formatNumber(sound.plays)}</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={handleLike}
            className={cn(
              "flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg transition-colors",
              isLiked ? "text-brand-400" : "text-white/30 hover:text-brand-400"
            )}>
            <Heart size={12} fill={isLiked ? "currentColor" : "none"} />
            <span>{formatNumber(localLikes)}</span>
          </button>
          <button onClick={handleFavorite}
            className={cn(
              "p-1 rounded-lg transition-colors",
              isFavorited ? "text-yellow-400" : "text-white/30 hover:text-yellow-400"
            )}>
            <Bookmark size={12} fill={isFavorited ? "currentColor" : "none"} />
          </button>
        </div>
      </div>

      {/* Tags */}
      {sound.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {sound.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-[9px] text-white/25 font-mono">#{tag}</span>
          ))}
        </div>
      )}
    </div>
  );
}
