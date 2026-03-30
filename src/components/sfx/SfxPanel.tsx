"use client";

import { useCallback, useRef, useState } from "react";
import { Volume2, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Preset = { id: string; name: string; url: string };

const PRESETS: Preset[] = [
  { id: "vine-boom", name: "Vine Boom", url: "https://assets.mixkit.co/active_storage/sfx/212/212-preview.mp3" },
  { id: "bruh", name: "Bruh", url: "https://assets.mixkit.co/active_storage/sfx/215/215-preview.mp3" },
  { id: "error", name: "Windows Error", url: "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3" },
  { id: "anime-wow", name: "Anime Wow", url: "https://assets.mixkit.co/active_storage/sfx/2217/2217-preview.mp3" },
];

export function SfxPanel() {
  const [open, setOpen] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const play = useCallback((preset: Preset) => {
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      const audio = new Audio(preset.url);
      audio.volume = volume;
      audioRef.current = audio;
      void audio.play();
    } catch {
      /* no audio */
    }
  }, [volume]);

  const stopAll = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "fixed bottom-20 right-4 z-40 lg:bottom-6 flex items-center gap-2 px-4 py-3 rounded-2xl shadow-xl border transition-all",
          "bg-surface-900/95 border-white/10 text-white hover:border-brand-500/40 hover:bg-brand-500/10",
          open && "ring-2 ring-brand-500/40"
        )}
        aria-expanded={open}
        aria-label="Soundboard"
      >
        <Volume2 size={20} className="text-brand-400" />
        <span className="text-sm font-medium hidden sm:inline">SFX</span>
      </button>

      {open && (
        <div
          className="fixed bottom-32 right-4 z-40 w-[min(100vw-2rem,280px)] rounded-2xl border border-white/10 bg-surface-950/98 backdrop-blur-xl shadow-2xl p-4 animate-fade-in"
          role="dialog"
          aria-label="Sound effects"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-white">Quick SFX</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/5"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
          <p className="text-[11px] text-white/35 mb-3 leading-snug">Meme reaction sounds. Tap to play instantly.</p>
          <div className="mb-3">
            <div className="flex items-center justify-between text-[11px] text-white/45 mb-1">
              <span>Volume</span>
              <span>{Math.round(volume * 100)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-full accent-brand-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => play(p)}
                className="py-3 px-2 rounded-xl text-xs font-medium bg-white/5 border border-white/8 hover:bg-brand-500/15 hover:border-brand-500/30 transition-all active:scale-[0.98]"
              >
                {p.name}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={stopAll}
            className="w-full mt-3 py-2 px-2 rounded-xl text-xs font-medium bg-white/5 border border-white/8 hover:bg-white/10 transition-all"
          >
            Stop
          </button>
        </div>
      )}
    </>
  );
}
