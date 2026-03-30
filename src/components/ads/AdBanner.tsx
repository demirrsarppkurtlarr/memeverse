"use client";

import { ADS_CONFIG } from "@/lib/ads/config";
import { cn } from "@/lib/utils";
import { AdScriptLoader } from "./AdScriptLoader";

interface AdBannerProps {
  /** Unique slot id (used for container id + script dedupe) */
  slotId?: string;
  className?: string;
  /** If true, show a subtle placeholder box when config is empty (dev-friendly). */
  showPlaceholder?: boolean;
}

export function AdBanner({ slotId = "top-banner", className, showPlaceholder = true }: AdBannerProps) {
  const cfg = ADS_CONFIG.banner;
  const enabled = Boolean(cfg.scriptSrc || cfg.inlineJs);
  const containerId = `${cfg.containerId || "mv-ad-banner"}-${slotId}`;

  if (!enabled && !showPlaceholder) return null;

  return (
    <section
      className={cn(
        "w-full",
        "border-b border-white/5",
        "bg-surface-950/60 backdrop-blur",
        className
      )}
      aria-label="Advertisement"
    >
      <div className="max-w-screen-2xl mx-auto px-4 py-3">
        <div
          id={containerId}
          className={cn(
            "w-full min-h-[72px] rounded-2xl overflow-hidden",
            "border border-white/8 bg-white/3",
            enabled ? "opacity-100" : "opacity-70"
          )}
        >
          {!enabled ? (
            <div className="h-[72px] flex items-center justify-center text-xs text-white/30 font-mono">
              Ad slot ready. Paste your {ADS_CONFIG.provider} banner script in{" "}
              <code className="px-1 text-white/40">src/lib/ads/config.ts</code>
            </div>
          ) : (
            <AdScriptLoader id={`banner:${slotId}`} src={cfg.scriptSrc} inlineJs={cfg.inlineJs} />
          )}
        </div>
      </div>
    </section>
  );
}

