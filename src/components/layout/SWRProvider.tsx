"use client";

import { SWRConfig } from "swr";

export function SWRProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher: (url: string) => fetch(url).then((r) => r.json()),
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
        errorRetryCount: 3,
        dedupingInterval: 10000,
      }}
    >
      {children}
    </SWRConfig>
  );
}
