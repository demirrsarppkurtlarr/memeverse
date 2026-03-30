import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { MemeCategory } from "@/types";

const CATEGORIES: Array<{
  slug: MemeCategory;
  label: string;
  emoji: string;
  description: string;
  gradient: string;
}> = [
  { slug: "global", label: "Global", emoji: "🌐", description: "Best memes from around the world", gradient: "from-blue-600/30 to-cyan-600/20" },
  { slug: "turkish", label: "Turkish", emoji: "🇹🇷", description: "En iyi Türk memleri", gradient: "from-red-700/30 to-red-500/20" },
  { slug: "trending", label: "Trending", emoji: "🔥", description: "What's blowing up right now", gradient: "from-orange-600/30 to-yellow-500/20" },
  { slug: "classic", label: "Classic", emoji: "💾", description: "Timeless internet classics", gradient: "from-purple-600/30 to-indigo-500/20" },
];

export default async function CategoriesPage() {
  const supabase = await createClient();

  // Count memes per category
  const counts = await Promise.all(
    CATEGORIES.map(async (cat) => {
      const { count } = await supabase
        .from("memes")
        .select("id", { count: "exact", head: true })
        .eq("category", cat.slug)
        .eq("is_active", true);
      return { slug: cat.slug, count: count || 0 };
    })
  );

  const countMap = Object.fromEntries(counts.map((c) => [c.slug, c.count]));

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="font-display text-5xl tracking-wider mb-2">
        <span className="gradient-text">CATEGORIES</span>
      </h1>
      <p className="text-white/40 text-sm mb-8">Browse memes by type and region</p>

      <div className="grid sm:grid-cols-2 gap-4">
        {CATEGORIES.map((cat) => (
          <Link key={cat.slug} href={`/categories/${cat.slug}`}
            className={`relative overflow-hidden rounded-2xl border border-white/8 p-6 group
                        transition-all duration-200 hover:border-white/20 hover:scale-[1.01]
                        bg-gradient-to-br ${cat.gradient}`}>
            <div className="absolute inset-0 bg-grid opacity-30" />
            <div className="relative">
              <span className="text-5xl block mb-3">{cat.emoji}</span>
              <h2 className="font-display text-3xl tracking-wider mb-1">{cat.label}</h2>
              <p className="text-white/50 text-sm mb-4">{cat.description}</p>
              <span className="text-xs font-mono text-white/30">
                {countMap[cat.slug]?.toLocaleString() || 0} memes
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
