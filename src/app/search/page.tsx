"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Search } from "lucide-react";
import { MemeGrid } from "@/components/meme/MemeGrid";

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  return (
    <div>
      <div className="px-4 pt-8 pb-4 border-b border-white/5">
        <div className="flex items-center gap-3 mb-2">
          <Search size={20} className="text-brand-400" />
          <h1 className="font-display text-4xl tracking-wider">
            SEARCH <span className="gradient-text">RESULTS</span>
          </h1>
        </div>
        {query && (
          <p className="text-white/40 text-sm">
            Showing results for: <span className="text-white/70 font-medium">"{query}"</span>
          </p>
        )}
      </div>
      <div className="p-4">
        {query ? (
          <MemeGrid params={{ search: query, sort: "trending" }} />
        ) : (
          <div className="text-center py-20">
            <Search size={48} className="mx-auto text-white/10 mb-4" />
            <p className="text-white/30 text-sm">Type something to search</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchContent />
    </Suspense>
  );
}
