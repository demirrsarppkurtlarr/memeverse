"use client";

import Link from "next/link";
import { ImageIcon, Music2, ArrowRight } from "lucide-react";
import { useAuthStore } from "@/store";

export default function UploadIndexPage() {
  const { user } = useAuthStore();

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
        <span className="text-6xl mb-4">🔒</span>
        <h2 className="font-display text-3xl tracking-wider mb-2">SIGN IN REQUIRED</h2>
        <p className="text-white/40 text-sm mb-6">Create an account to upload content</p>
        <Link href="/login" className="btn-brand">Sign In</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="font-display text-5xl tracking-wider mb-2">
        <span className="gradient-text">UPLOAD</span>
      </h1>
      <p className="text-white/40 text-sm mb-10">What do you want to share with the world?</p>

      <div className="grid sm:grid-cols-2 gap-4">
        <Link
          href="/upload/meme"
          className="group glass-hover rounded-2xl p-8 flex flex-col items-center gap-4 text-center
                     transition-all duration-200 hover:scale-[1.02] border border-white/5 hover:border-brand-500/30"
        >
          <div className="w-16 h-16 rounded-2xl bg-brand-500/15 border border-brand-500/25
                          flex items-center justify-center group-hover:bg-brand-500/25 transition-colors">
            <ImageIcon size={28} className="text-brand-400" />
          </div>
          <div>
            <h2 className="font-display text-2xl tracking-wider mb-1">MEME</h2>
            <p className="text-white/40 text-sm">Images, GIFs, or short videos</p>
          </div>
          <div className="flex items-center gap-1 text-brand-400 text-sm font-medium">
            Upload meme
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          href="/upload/sound"
          className="group glass-hover rounded-2xl p-8 flex flex-col items-center gap-4 text-center
                     transition-all duration-200 hover:scale-[1.02] border border-white/5 hover:border-purple-500/30"
        >
          <div className="w-16 h-16 rounded-2xl bg-purple-500/15 border border-purple-500/25
                          flex items-center justify-center group-hover:bg-purple-500/25 transition-colors">
            <Music2 size={28} className="text-purple-400" />
          </div>
          <div>
            <h2 className="font-display text-2xl tracking-wider mb-1">SOUND</h2>
            <p className="text-white/40 text-sm">SFX, meme sounds, audio clips</p>
          </div>
          <div className="flex items-center gap-1 text-purple-400 text-sm font-medium">
            Upload sound
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>
    </div>
  );
}
