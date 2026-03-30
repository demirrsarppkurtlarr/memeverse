"use client";

import { useEffect } from "react";
import { ADS_CONFIG } from "@/lib/ads/config";
import { AdScriptLoader } from "./AdScriptLoader";

/**
 * Optional popunder/popup trigger.
 * - Runs only on client
 * - Runs at most once per session
 * - If config is empty, does nothing
 */
export function AdPopupTrigger() {
  const enabled = ADS_CONFIG.rules.enablePopup && Boolean(ADS_CONFIG.popup.scriptSrc || ADS_CONFIG.popup.inlineJs);

  // Delay a bit so it doesn't block initial render.
  useEffect(() => {
    if (!enabled) return;
    // nothing here; script loader handles injection
  }, [enabled]);

  if (!enabled) return null;

  return (
    <AdScriptLoader
      id="popup:once"
      src={ADS_CONFIG.popup.scriptSrc}
      inlineJs={ADS_CONFIG.popup.inlineJs}
      oncePerSession
    />
  );
}

