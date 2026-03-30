"use client";

import { useState } from "react";
import { Heart, Bookmark, Download, Flag } from "lucide-react";
import { cn, formatNumber } from "@/lib/utils";
import { useAuthStore, useNotificationStore, useLikeCacheStore } from "@/store";
import { ShareMenu } from "@/components/ui/ShareMenu";
import { ReportModal } from "@/components/ui/ReportModal";
import type { Meme } from "@/types";

export function MemeActions({ meme }: { meme: Meme }) {
  const { user } = useAuthStore();
  const { addNotification } = useNotificationStore();
  const { likedMemeIds, favoritedMemeIds, toggleMemeLike, toggleMemeFavorite } = useLikeCacheStore();
  const [localLikes, setLocalLikes] = useState(meme.likes);
  const [reportOpen, setReportOpen] = useState(false);

  const isLiked = likedMemeIds.includes(meme.id);
  const isFavorited = favoritedMemeIds.includes(meme.id);

  const handleLike = async () => {
    const nowLiked = toggleMemeLike(meme.id);
    setLocalLikes((p) => p + (nowLiked ? 1 : -1));
    if (user) {
      try {
        await fetch("/api/likes", {
          method: nowLiked ? "POST" : "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contentType: "meme", contentId: meme.id }),
        });
      } catch {
        /* ignore */
      }
    }
  };

  const handleFavorite = async () => {
    const nowFaved = toggleMemeFavorite(meme.id);
    addNotification({
      type: "success",
      message: nowFaved ? "Saved locally!" : "Removed from favorites",
    });
    if (user) {
      try {
        await fetch("/api/favorites", {
          method: nowFaved ? "POST" : "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contentType: "meme", contentId: meme.id }),
        });
      } catch {
        /* ignore */
      }
    }
  };

  const handleDownload = async () => {
    try {
      const res = await fetch(meme.url);
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `memeverse-${meme.id}.${meme.media_type === "video" ? "mp4" : "jpg"}`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      addNotification({ type: "error", message: "Download failed" });
    }
  };

  const pageUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <>
      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={handleLike}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-150 active:scale-95",
            isLiked
              ? "bg-brand-500/20 border-brand-500/50 text-brand-400"
              : "glass-hover border-white/10 text-white/60 hover:text-brand-400 hover:border-brand-500/30"
          )}>
          <Heart size={16} fill={isLiked ? "currentColor" : "none"} />
          {formatNumber(localLikes)} Likes
        </button>

        <button onClick={handleFavorite}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-150 active:scale-95",
            isFavorited
              ? "bg-yellow-400/15 border-yellow-400/40 text-yellow-400"
              : "glass-hover border-white/10 text-white/60 hover:text-yellow-400 hover:border-yellow-400/30"
          )}>
          <Bookmark size={16} fill={isFavorited ? "currentColor" : "none"} />
          {isFavorited ? "Saved" : "Save"}
        </button>

        <ShareMenu url={pageUrl} title={meme.title} />

        <button onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 glass-hover text-white/60 hover:text-white text-sm font-semibold transition-all duration-150 active:scale-95">
          <Download size={16} />
          Save
        </button>

        <button onClick={() => setReportOpen(true)}
          className="ml-auto flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-white/8 glass-hover text-white/25 hover:text-red-400 hover:border-red-400/30 text-sm transition-all duration-150 active:scale-95">
          <Flag size={14} />
        </button>
      </div>

      <ReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        contentType="meme"
        contentId={meme.id}
      />
    </>
  );
}
