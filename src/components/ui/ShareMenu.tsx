"use client";

import { useState } from "react";
import { Share2, Twitter, Link, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ShareMenuProps {
  url: string;
  title: string;
}

export function ShareMenu({ url, title }: ShareMenuProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareTwitter = () => {
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
    window.open(tweetUrl, "_blank", "noopener");
    setOpen(false);
  };

  const shareNative = async () => {
    if (navigator.share) {
      await navigator.share({ title, url });
      setOpen(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10
                   glass-hover text-white/60 hover:text-white text-sm font-semibold
                   transition-all duration-150 active:scale-95"
      >
        <Share2 size={16} />
        Share
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-2 w-48 glass rounded-2xl p-2 z-20 animate-scale-in shadow-xl">
            <button
              onClick={copyLink}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 text-sm transition-colors text-left"
            >
              {copied ? <Check size={15} className="text-green-400" /> : <Link size={15} className="text-white/50" />}
              <span>{copied ? "Copied!" : "Copy link"}</span>
            </button>
            <button
              onClick={shareTwitter}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 text-sm transition-colors text-left"
            >
              <Twitter size={15} className="text-sky-400" />
              <span>Share on X</span>
            </button>
            {typeof navigator !== "undefined" && "share" in navigator && (
              <button
                onClick={shareNative}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 text-sm transition-colors text-left"
              >
                <Share2 size={15} className="text-white/50" />
                <span>More options</span>
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
