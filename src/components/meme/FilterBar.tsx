"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useFilterStore } from "@/store";
import { cn } from "@/lib/utils";
import { TrendingUp, Clock, Star, Shuffle, Tag } from "lucide-react";
import type { MemeCategory } from "@/types";
import { MEME_TAG_LABELS } from "@/lib/memes/tagging";

const SORTS = [
  { value: "trending" as const, label: "Trending", icon: TrendingUp },
  { value: "newest" as const, label: "New", icon: Clock },
  { value: "top" as const, label: "Top", icon: Star },
  { value: "random" as const, label: "Random", icon: Shuffle },
];

const CATEGORIES: Array<{ value: MemeCategory | "all"; label: string; emoji: string }> = [
  { value: "all", label: "All", emoji: "🌍" },
  { value: "global", label: "Global", emoji: "🌐" },
  { value: "turkish", label: "Turkish", emoji: "🇹🇷" },
  { value: "trending", label: "Trending", emoji: "🔥" },
  { value: "classic", label: "Classic", emoji: "💾" },
];

const MEDIA_TYPES: Array<{ value: "all" | "image" | "video" | "gif"; label: string }> = [
  { value: "all", label: "All" },
  { value: "image", label: "Images" },
  { value: "video", label: "Videos" },
  { value: "gif", label: "GIFs" },
];

export function FilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { selectedCategory, selectedMediaType, sortBy, setSelectedCategory, setSelectedMediaType, setSortBy } =
    useFilterStore();

  const activeTag = searchParams.get("tag") || "";
  const urlSort = searchParams.get("sort");
  const activeSort = useMemo((): "trending" | "newest" | "top" | "random" => {
    if (urlSort === "newest" || urlSort === "random" || urlSort === "top" || urlSort === "trending") {
      return urlSort;
    }
    return sortBy;
  }, [urlSort, sortBy]);

  const pushQuery = useCallback(
    (mutate: (p: URLSearchParams) => void) => {
      const p = new URLSearchParams(searchParams.toString());
      mutate(p);
      const qs = p.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname || "/");
    },
    [pathname, router, searchParams]
  );

  const setTagFilter = (tag: string) => {
    pushQuery((p) => {
      if (!tag || activeTag === tag) p.delete("tag");
      else p.set("tag", tag);
    });
  };

  const setSort = (value: (typeof SORTS)[number]["value"]) => {
    setSortBy(value === "top" ? "top" : value);
    pushQuery((p) => {
      if (value === "trending") p.delete("sort");
      else p.set("sort", value);
    });
  };

  return (
    <div
      className="sticky top-16 z-30 border-b border-white/5 py-3 px-4 space-y-3"
      style={{ background: "rgba(8,8,15,0.9)", backdropFilter: "blur(16px)" }}
    >
      <div className="flex items-center gap-3 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1 shrink-0 glass rounded-xl p-1">
          {SORTS.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setSort(value)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150",
                activeSort === value
                  ? "bg-brand-500 text-white shadow-sm"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              )}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>

        <div className="w-px h-6 bg-white/10 shrink-0" />

        <div className="flex items-center gap-1 shrink-0">
          {MEDIA_TYPES.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setSelectedMediaType(value)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150",
                selectedMediaType === value
                  ? "bg-white/10 text-white border border-white/20"
                  : "text-white/40 hover:text-white hover:bg-white/5"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
        {CATEGORIES.map(({ value, label, emoji }) => (
          <button
            key={value}
            type="button"
            onClick={() => setSelectedCategory(value)}
            className={cn(
              "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-150 shrink-0 border",
              selectedCategory === value
                ? "bg-brand-500/20 border-brand-500/50 text-brand-300"
                : "border-white/8 text-white/50 hover:text-white hover:border-white/20 bg-white/3"
            )}
          >
            <span>{emoji}</span>
            {label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pt-1">
        <span className="flex items-center gap-1 text-[11px] font-mono text-white/35 uppercase tracking-wider shrink-0">
          <Tag size={12} />
          Tags
        </span>
        <button
          type="button"
          onClick={() => setTagFilter("")}
          className={cn(
            "px-3 py-1 rounded-full text-xs font-medium border transition-all shrink-0",
            !activeTag ? "bg-white/15 border-white/25 text-white" : "border-white/10 text-white/45 hover:text-white"
          )}
        >
          All tags
        </button>
        {MEME_TAG_LABELS.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => setTagFilter(tag)}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-medium border transition-all shrink-0 capitalize",
              activeTag === tag
                ? "bg-emerald-500/25 border-emerald-400/50 text-emerald-200"
                : "border-white/10 text-white/45 hover:text-white hover:border-white/25"
            )}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}
