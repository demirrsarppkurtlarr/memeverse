import Image from "next/image";
import Link from "next/link";
import { MemeActions } from "@/components/meme/MemeActions";
import { timeAgo, formatNumber } from "@/lib/utils";
import { ArrowLeft, Eye, Calendar, ExternalLink, Sparkles } from "lucide-react";
import type { Meme } from "@/types";

interface MemePageBodyProps {
  typedMeme: Meme;
  related: Meme[];
  /** When true, show local ranking score in sidebar */
  localRanked?: boolean;
}

export function MemePageBody({ typedMeme, related, localRanked }: MemePageBodyProps) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link href="/" className="flex items-center gap-2 text-white/40 hover:text-white text-sm mb-6 transition-colors group">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Back to feed
      </Link>

      <div className="grid lg:grid-cols-[1fr_320px] gap-8">
        <div>
          <div className="rounded-2xl overflow-hidden bg-black border border-white/5 mb-6">
            {typedMeme.media_type === "video" ? (
              <video
                src={typedMeme.url}
                controls
                autoPlay
                loop
                className="w-full max-h-[70vh] object-contain"
              />
            ) : (
              <Image
                src={typedMeme.url}
                alt={typedMeme.title}
                width={typedMeme.width || 800}
                height={typedMeme.height || 600}
                className="w-full h-auto object-contain max-h-[70vh]"
                priority
                unoptimized={typedMeme.url.includes("redd.it") || typedMeme.url.includes("imgur")}
              />
            )}
          </div>

          <h1 className="text-xl font-semibold text-white mb-4 leading-snug">{typedMeme.title}</h1>

          <MemeActions meme={typedMeme} />

          <div className="flex flex-wrap items-center gap-4 mt-6 text-sm text-white/40">
            <span className="flex items-center gap-1.5">
              <Eye size={14} />
              {formatNumber(typedMeme.views)} views
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar size={14} />
              {timeAgo(typedMeme.created_at)}
            </span>
            {typedMeme.source_url && (
              <a
                href={typedMeme.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-white transition-colors"
              >
                <ExternalLink size={14} />
                View original
              </a>
            )}
          </div>

          {typedMeme.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {typedMeme.tags.map((tag) => (
                <Link key={tag} href={`/?tag=${encodeURIComponent(tag)}`} className="tag-pill">
                  #{tag}
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="glass rounded-2xl p-4">
            <p className="text-xs font-mono text-white/30 uppercase tracking-wider mb-3">Source</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-white/40">Platform</span>
                <span className="text-white/70 capitalize">{typedMeme.source}</span>
              </div>
              {typedMeme.subreddit && (
                <div className="flex justify-between">
                  <span className="text-white/40">Subreddit</span>
                  <a
                    href={`https://reddit.com/r/${typedMeme.subreddit}`}
                    target="_blank"
                    className="text-brand-400 hover:underline"
                  >
                    r/{typedMeme.subreddit}
                  </a>
                </div>
              )}
              {typedMeme.author_name && (
                <div className="flex justify-between">
                  <span className="text-white/40">Author</span>
                  <span className="text-white/70">u/{typedMeme.author_name}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-white/40">Category</span>
                <span className="text-white/70 capitalize">{typedMeme.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Language</span>
                <span className="text-white/70 uppercase">{typedMeme.language}</span>
              </div>
              {localRanked && (
                <div className="flex justify-between items-center">
                  <span className="text-white/40 flex items-center gap-1">
                    <Sparkles size={12} /> Rank score
                  </span>
                  <span className="text-white/70 font-mono">{typedMeme.score.toFixed(1)}</span>
                </div>
              )}
              {typedMeme.reddit_score > 0 && (
                <div className="flex justify-between">
                  <span className="text-white/40">Reddit score</span>
                  <span className="text-white/70">{formatNumber(typedMeme.reddit_score)}</span>
                </div>
              )}
            </div>
          </div>

          {related.length > 0 && (
            <div>
              <p className="text-xs font-mono text-white/30 uppercase tracking-wider mb-3">Related</p>
              <div className="space-y-3">
                {related.map((r) => (
                  <Link key={r.id} href={`/meme/${r.id}`} className="flex items-center gap-3 glass-hover rounded-xl p-2 group">
                    <div className="w-16 h-12 rounded-lg overflow-hidden bg-black shrink-0">
                      <Image
                        src={r.thumbnail_url || r.url}
                        alt={r.title}
                        width={64}
                        height={48}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white/80 line-clamp-2 group-hover:text-white transition-colors">
                        {r.title}
                      </p>
                      <p className="text-[10px] text-white/30 mt-1 font-mono">♥ {formatNumber(r.likes)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
