import useSWR from "swr";
import useSWRInfinite from "swr/infinite";
import type { Meme, MemesQueryParams, PaginatedResponse } from "@/types";

const PAGE_SIZE = 24;

async function fetchMemes(url: string): Promise<PaginatedResponse<Meme>> {
  const res = await fetch(url, { cache: "no-store" });
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const msg =
      json?.error?.message ||
      (res.status === 429 ? "Too many requests — try again in a minute." : null) ||
      "Failed to fetch memes";
    throw new Error(msg);
  }
  if (!json?.data?.items || !Array.isArray(json.data.items)) {
    throw new Error("Invalid response from /api/memes");
  }
  return json.data;
}

function apiSort(mode: MemesQueryParams["sort"]): string {
  if (mode === "random") return "random";
  if (mode === "newest") return "newest";
  if (mode === "top") return "trending";
  return "trending";
}

function buildPageUrl(pageIndex: number, params: MemesQueryParams, seed: string) {
  const searchParams = new URLSearchParams();
  searchParams.set("page", String(pageIndex + 1));
  searchParams.set("pageSize", String(PAGE_SIZE));
  searchParams.set("sort", apiSort(params.sort));
  if (params.sort === "random") searchParams.set("seed", seed);
  if (params.category && params.category !== "all") searchParams.set("category", params.category);
  if (params.mediaType && params.mediaType !== "all") searchParams.set("mediaType", params.mediaType);
  if (params.search) searchParams.set("q", params.search);
  if (params.tag) searchParams.set("tag", params.tag);

  return `/api/memes?${searchParams.toString()}`;
}

export function useMemes(params: MemesQueryParams) {
  const randomSeed =
    typeof window !== "undefined"
      ? `day-${new Date().toISOString().slice(0, 10)}`
      : "ssr";

  const getKey = (pageIndex: number, previousPageData: PaginatedResponse<Meme> | null) => {
    if (previousPageData && !previousPageData.hasMore) return null;
    return buildPageUrl(pageIndex, params, randomSeed);
  };

  const { data, error, isLoading, isValidating, size, setSize, mutate } =
    useSWRInfinite<PaginatedResponse<Meme>>(getKey, fetchMemes, {
      revalidateFirstPage: false,
      revalidateOnFocus: false,
    });

  const memes = data ? data.flatMap((page) => page?.items ?? []) : [];
  const hasMore = data ? data[data.length - 1]?.hasMore ?? false : false;
  const total = data?.[0]?.total ?? 0;

  return {
    memes,
    total,
    hasMore,
    isLoading,
    isValidating,
    error,
    loadMore: () => setSize(size + 1),
    mutate,
  };
}

export function useMeme(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR<{ data: Meme }>(
    id ? `/api/memes/${id}` : null,
    async (url: string) => {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch meme");
      return res.json();
    }
  );

  return {
    meme: data?.data ?? null,
    isLoading,
    error,
    mutate,
  };
}
