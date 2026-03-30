import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthUser, UINotification, MemeCategory, SoundCategory } from "@/types";

// ============================================================
// AUTH STORE
// ============================================================
interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  setUser: (user: AuthUser | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
}));

// ============================================================
// NOTIFICATION STORE
// ============================================================
interface NotificationState {
  notifications: UINotification[];
  addNotification: (notification: Omit<UINotification, "id">) => void;
  removeNotification: (id: string) => void;
}

export const useNotificationStore = create<NotificationState>()((set) => ({
  notifications: [],
  addNotification: (notification) => {
    const id = Math.random().toString(36).slice(2);
    set((state) => ({
      notifications: [...state.notifications, { ...notification, id }],
    }));
    setTimeout(() => {
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
      }));
    }, notification.duration || 4000);
  },
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
}));

// ============================================================
// FILTER/PREFERENCES STORE (persisted)
// ============================================================
interface FilterState {
  selectedCategory: MemeCategory | "all";
  selectedMediaType: "image" | "video" | "gif" | "all";
  sortBy: "trending" | "newest" | "top" | "random";
  soundCategory: SoundCategory | "all";
  showNsfw: boolean;
  setSelectedCategory: (cat: MemeCategory | "all") => void;
  setSelectedMediaType: (type: "image" | "video" | "gif" | "all") => void;
  setSortBy: (sort: "trending" | "newest" | "top" | "random") => void;
  setSoundCategory: (cat: SoundCategory | "all") => void;
  setShowNsfw: (show: boolean) => void;
}

export const useFilterStore = create<FilterState>()(
  persist(
    (set) => ({
      selectedCategory: "all",
      selectedMediaType: "all",
      sortBy: "trending",
      soundCategory: "all",
      showNsfw: false,
      setSelectedCategory: (cat) => set({ selectedCategory: cat }),
      setSelectedMediaType: (type) => set({ selectedMediaType: type }),
      setSortBy: (sort) => set({ sortBy: sort }),
      setSoundCategory: (cat) => set({ soundCategory: cat }),
      setShowNsfw: (show) => set({ showNsfw: show }),
    }),
    { name: "memeverse-filters" }
  )
);

// ============================================================
// LIKES / FAVORITES — persisted locally + merged with server
// ============================================================
interface LikeCache {
  likedMemeIds: string[];
  favoritedMemeIds: string[];
  likedSoundIds: string[];
  favoritedSoundIds: string[];
  toggleMemeLike: (id: string) => boolean;
  toggleMemeFavorite: (id: string) => boolean;
  toggleSoundLike: (id: string) => boolean;
  toggleSoundFavorite: (id: string) => boolean;
  initFromData: (data: {
    likedMemes: string[];
    favoritedMemes: string[];
    likedSounds: string[];
    favoritedSounds: string[];
  }) => void;
}

function uniq(ids: string[]) {
  return [...new Set(ids.filter(Boolean))];
}

export const useLikeCacheStore = create<LikeCache>()(
  persist(
    (set, get) => ({
      likedMemeIds: [],
      favoritedMemeIds: [],
      likedSoundIds: [],
      favoritedSoundIds: [],
      toggleMemeLike: (id) => {
        const cur = get().likedMemeIds;
        const was = cur.includes(id);
        set({
          likedMemeIds: was ? cur.filter((x) => x !== id) : [...cur, id],
        });
        return !was;
      },
      toggleMemeFavorite: (id) => {
        const cur = get().favoritedMemeIds;
        const was = cur.includes(id);
        set({
          favoritedMemeIds: was ? cur.filter((x) => x !== id) : [...cur, id],
        });
        return !was;
      },
      toggleSoundLike: (id) => {
        const cur = get().likedSoundIds;
        const was = cur.includes(id);
        set({
          likedSoundIds: was ? cur.filter((x) => x !== id) : [...cur, id],
        });
        return !was;
      },
      toggleSoundFavorite: (id) => {
        const cur = get().favoritedSoundIds;
        const was = cur.includes(id);
        set({
          favoritedSoundIds: was ? cur.filter((x) => x !== id) : [...cur, id],
        });
        return !was;
      },
      initFromData: (data) =>
        set((s) => ({
          likedMemeIds: uniq([...s.likedMemeIds, ...data.likedMemes]),
          favoritedMemeIds: uniq([...s.favoritedMemeIds, ...data.favoritedMemes]),
          likedSoundIds: uniq([...s.likedSoundIds, ...data.likedSounds]),
          favoritedSoundIds: uniq([...s.favoritedSoundIds, ...data.favoritedSounds]),
        })),
    }),
    {
      name: "memeverse-engagement",
      partialize: (s) => ({
        likedMemeIds: s.likedMemeIds,
        favoritedMemeIds: s.favoritedMemeIds,
        likedSoundIds: s.likedSoundIds,
        favoritedSoundIds: s.favoritedSoundIds,
      }),
    }
  )
);
