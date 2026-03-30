"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/store";
import { Avatar } from "@/components/ui/Avatar";
import { MemeCard } from "@/components/meme/MemeCard";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { createClient } from "@/lib/supabase/client";
import { formatNumber, timeAgo } from "@/lib/utils";
import { Grid3X3, Bookmark, Heart, Upload, LogIn } from "lucide-react";
import Link from "next/link";
import type { Meme } from "@/types";
import { cn } from "@/lib/utils";

type Tab = "uploads" | "favorites" | "liked";

export default function ProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>(
    (searchParams.get("tab") as Tab) || "uploads"
  );
  const [memes, setMemes] = useState<Meme[]>([]);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setFetching(true);
      const supabase = createClient();
      let query;

      if (activeTab === "uploads") {
        const { data } = await supabase
          .from("memes")
          .select("*")
          .eq("uploaded_by", user.id)
          .eq("is_active", true)
          .order("created_at", { ascending: false })
          .limit(40);
        setMemes((data as Meme[]) || []);
      } else if (activeTab === "favorites") {
        const { data: favs } = await supabase
          .from("favorites")
          .select("content_id")
          .eq("user_id", user.id)
          .eq("content_type", "meme")
          .order("created_at", { ascending: false })
          .limit(40);
        if (favs && favs.length > 0) {
          const ids = favs.map((f: { content_id: string }) => f.content_id);
          const { data } = await supabase
            .from("memes")
            .select("*")
            .in("id", ids)
            .eq("is_active", true);
          setMemes((data as Meme[]) || []);
        } else {
          setMemes([]);
        }
      } else if (activeTab === "liked") {
        const { data: likes } = await supabase
          .from("likes")
          .select("content_id")
          .eq("user_id", user.id)
          .eq("content_type", "meme")
          .order("created_at", { ascending: false })
          .limit(40);
        if (likes && likes.length > 0) {
          const ids = likes.map((l: { content_id: string }) => l.content_id);
          const { data } = await supabase
            .from("memes")
            .select("*")
            .in("id", ids)
            .eq("is_active", true);
          setMemes((data as Meme[]) || []);
        } else {
          setMemes([]);
        }
      }
      setFetching(false);
    };
    load();
  }, [user, activeTab]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="skeleton w-20 h-20 rounded-full" />
          <div className="space-y-2">
            <div className="skeleton h-6 w-40 rounded-lg" />
            <div className="skeleton h-4 w-24 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mb-4">
          <LogIn size={28} className="text-brand-400" />
        </div>
        <h2 className="font-display text-3xl tracking-wider mb-2">SIGN IN REQUIRED</h2>
        <p className="text-white/40 text-sm mb-6">Create an account to view your profile</p>
        <Link href="/login" className="btn-brand">Sign In</Link>
      </div>
    );
  }

  const TABS: Array<{ id: Tab; label: string; icon: React.ComponentType<{size?: number}> }> = [
    { id: "uploads", label: "Uploads", icon: Grid3X3 },
    { id: "favorites", label: "Favorites", icon: Bookmark },
    { id: "liked", label: "Liked", icon: Heart },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Profile header */}
      <div className="glass rounded-2xl p-6 mb-8">
        <div className="flex items-start gap-5">
          <Avatar
            src={user.profile.avatar_url}
            alt={user.profile.display_name || user.profile.username}
            size={72}
          />
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-3xl tracking-wider">
              {user.profile.display_name || user.profile.username}
            </h1>
            <p className="text-white/40 text-sm">@{user.profile.username}</p>
            {user.profile.bio && (
              <p className="text-white/60 text-sm mt-2">{user.profile.bio}</p>
            )}
            <div className="flex items-center gap-4 mt-3">
              <div className="text-center">
                <p className="font-semibold text-sm">{formatNumber(user.profile.upload_count)}</p>
                <p className="text-white/30 text-xs">Uploads</p>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="text-center">
                <p className="font-semibold text-sm">{formatNumber(user.profile.like_count)}</p>
                <p className="text-white/30 text-xs">Likes received</p>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="text-center">
                <p className="text-white/30 text-xs">Member since</p>
                <p className="font-semibold text-xs mt-0.5">{timeAgo(user.profile.created_at)}</p>
              </div>
            </div>
          </div>
          <Link href="/upload" className="btn-brand flex items-center gap-2 text-sm shrink-0">
            <Upload size={14} /> Upload
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 glass rounded-xl p-1 mb-6 w-fit">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150",
              activeTab === id
                ? "bg-brand-500 text-white"
                : "text-white/50 hover:text-white hover:bg-white/5"
            )}>
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      {fetching ? (
        <div className="masonry">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="masonry-item"><SkeletonCard /></div>
          ))}
        </div>
      ) : memes.length === 0 ? (
        <div className="text-center py-16">
          <span className="text-5xl block mb-3">
            {activeTab === "uploads" ? "📤" : activeTab === "favorites" ? "🔖" : "💔"}
          </span>
          <p className="text-white/40 text-sm">
            {activeTab === "uploads"
              ? "You haven't uploaded any memes yet"
              : activeTab === "favorites"
              ? "No saved memes yet"
              : "No liked memes yet"}
          </p>
        </div>
      ) : (
        <div className="masonry">
          {memes.map((meme) => (
            <div key={meme.id} className="masonry-item">
              <MemeCard meme={meme} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
