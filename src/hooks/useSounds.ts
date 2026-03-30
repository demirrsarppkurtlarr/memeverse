import useSWR from "swr";
import useSWRInfinite from "swr/infinite";
import type { Sound, SoundsQueryParams, PaginatedResponse } from "@/types";

async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch");
  const json = await res.json();
  return json.data;
}

export function useSounds(params: SoundsQueryParams) {
  const getKey = (pageIndex: number, previousPageData: PaginatedResponse<Sound> | null) => {
    if (previousPageData && !previousPageData.hasMore) return null;

    const searchParams = new URLSearchParams();
    searchParams.set("page", String(pageIndex + 1));
    searchParams.set("pageSize", "30");
    if (params.category && params.category !== "all") searchParams.set("category", params.category);
    if (params.sort) searchParams.set("sort", params.sort);
    if (params.search) searchParams.set("search", params.search);

    return `/api/sounds?${searchParams.toString()}`;
  };

  const { data, error, isLoading, isValidating, size, setSize, mutate } =
    useSWRInfinite<PaginatedResponse<Sound>>(getKey, fetcher, {
      revalidateFirstPage: false,
      revalidateOnFocus: false,
    });

  const sounds = data ? data.flatMap((page) => page.items) : [];
  const hasMore = data ? data[data.length - 1]?.hasMore ?? false : false;

  return {
    sounds,
    hasMore,
    isLoading,
    isValidating,
    error,
    loadMore: () => setSize(size + 1),
    mutate,
  };
}

export function useFeaturedSounds() {
  return useSWR<Sound[]>("/api/sounds?featured=true&pageSize=8", fetcher, {
    revalidateOnFocus: false,
  });
}
