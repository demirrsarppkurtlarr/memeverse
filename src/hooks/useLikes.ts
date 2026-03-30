"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useLikeCacheStore, useAuthStore } from "@/store";

/**
 * Fetches the authenticated user's likes and favorites
 * and seeds the local cache store for optimistic UI updates.
 */
export function useLikes() {
  const { user } = useAuthStore();
  const { initFromData } = useLikeCacheStore();

  useEffect(() => {
    if (!user) return;

    type ContentRef = { content_type: string; content_id: string };

    const load = async () => {
      const supabase = createClient();

      const [likesRes, favsRes] = await Promise.all([
        supabase
          .from("likes")
          .select("content_type, content_id")
          .eq("user_id", user.id),
        supabase
          .from("favorites")
          .select("content_type, content_id")
          .eq("user_id", user.id),
      ]);

      const likedMemes = ((likesRes.data || []) as ContentRef[])
        .filter((l: ContentRef) => l.content_type === "meme")
        .map((l: ContentRef) => l.content_id);
      const likedSounds = ((likesRes.data || []) as ContentRef[])
        .filter((l: ContentRef) => l.content_type === "sound")
        .map((l: ContentRef) => l.content_id);
      const favoritedMemes = ((favsRes.data || []) as ContentRef[])
        .filter((f: ContentRef) => f.content_type === "meme")
        .map((f: ContentRef) => f.content_id);
      const favoritedSounds = ((favsRes.data || []) as ContentRef[])
        .filter((f: ContentRef) => f.content_type === "sound")
        .map((f: ContentRef) => f.content_id);

      initFromData({ likedMemes, likedSounds, favoritedMemes, favoritedSounds });
    };

    load();
  }, [user?.id]);
}
