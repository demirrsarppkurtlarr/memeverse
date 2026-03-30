"use client";

import { ADS_CONFIG } from "@/lib/ads/config";
import { cn } from "@/lib/utils";
import { AdScriptLoader } from "./AdScriptLoader";

interface AdInFeedProps {
  index: number;
  className?: string;
  showPlaceholder?: boolean;
}

export function AdInFeed({ index, className, showPlaceholder = true }: AdInFeedProps) {
  const cfg = ADS_CONFIG.banner;
  const enabled = Boolean(cfg.scriptSrc || cfg.inlineJs);
  const slotId = `feed-${index}`;
  const containerId = `${cfg.containerId || "mv-ad-banner"}-${slotId}`;

  if (!enabled && !showPlaceholder) return null;

  return (
    <div className={cn("masonry-item", className)}>
      <div
        id={containerId}
        className={cn(
          "glass rounded-2xl overflow-hidden border border-white/8",
          "min-h-[140px] flex items-center justify-center",
          enabled ? "opacity-100" : "opacity-70"
        )}
        aria-label="Sponsored"
      >
        {!enabled ? (
          <div className="px-4 py-6 text-center">
            <p className="text-[11px] font-medium text-white/40 uppercase tracking-wider">
              Sponsored
            </p>
          </div>
        ) : (
          <AdScriptLoader id={`banner:${slotId}`} src={cfg.scriptSrc} inlineJs={cfg.inlineJs} />
        )}
      </div>
    </div>
  );
}

