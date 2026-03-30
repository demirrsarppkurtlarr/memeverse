"use client";

import { useCallback, useRef, useState } from "react";
import { Volume2, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Preset = { id: string; name: string; frequency: number; duration: number; type: "sine" | "square" | "triangle" };

const PRESETS: Preset[] = [
  { id: "blip", name: "Blip", frequency: 880, duration: 0.07, type: "sine" },
  { id: "bonk", name: "Bonk", frequency: 220, duration: 0.12, type: "square" },
  { id: "rising", name: "Rise", frequency: 440, duration: 0.18, type: "triangle" },
  { id: "ding", name: "Ding", frequency: 1200, duration: 0.2, type: "sine" },
  { id: "bass", name: "Bass", frequency: 110, duration: 0.25, type: "triangle" },
  { id: "retro", name: "8-bit", frequency: 523, duration: 0.08, type: "square" },
];

function playTone(ctx: AudioContext, preset: Preset) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = preset.type;
  osc.frequency.setValueAtTime(preset.frequency, ctx.currentTime);
  gain.gain.setValueAtTime(0.0001, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + preset.duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + preset.duration + 0.05);
}

export function SfxPanel() {
  const [open, setOpen] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);

  const play = useCallback((preset: Preset) => {
    try {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return;
      if (!ctxRef.current || ctxRef.current.state === "closed") {
        ctxRef.current = new Ctx();
      }
      const ctx = ctxRef.current;
      if (ctx.state === "suspended") void ctx.resume();
      playTone(ctx, preset);
    } catch {
      /* no audio */
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
          <p className="text-[11px] text-white/35 mb-3 leading-snug">
            Built-in tones (Web Audio). Tap to play — works offline.
          </p>
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
        </div>
      )}
    </>
  );
}
