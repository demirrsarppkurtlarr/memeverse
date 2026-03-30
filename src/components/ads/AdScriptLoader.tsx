"use client";

import { useEffect } from "react";

function onceKey(key: string) {
  return `mv_ad_once_${key}`;
}

function hasRunOnce(key: string) {
  try {
    return sessionStorage.getItem(onceKey(key)) === "1";
  } catch {
    return false;
  }
}

function markRunOnce(key: string) {
  try {
    sessionStorage.setItem(onceKey(key), "1");
  } catch {
    // ignore
  }
}

export interface AdScriptLoaderProps {
  /** Unique id to prevent duplicate injections */
  id: string;
  /** Script URL (preferred). If empty, loader no-ops. */
  src?: string;
  /** Inline JS body (no <script> tags). If empty, no-ops. */
  inlineJs?: string;
  /** If true, ensures it runs only once per session */
  oncePerSession?: boolean;
  /** Optional callback for debug/telemetry */
  onError?: (err: unknown) => void;
}

export function AdScriptLoader({
  id,
  src,
  inlineJs,
  oncePerSession = false,
  onError,
}: AdScriptLoaderProps) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (oncePerSession && hasRunOnce(id)) return;
    if (!src && !inlineJs) return;

    try {
      // Avoid double-injection across route changes
      const existing = document.querySelector<HTMLScriptElement>(`script[data-mv-ad="${id}"]`);
      if (existing) {
        if (oncePerSession) markRunOnce(id);
        return;
      }

      const injectInline = () => {
        if (!inlineJs) return;
        const s = document.createElement("script");
        s.async = true;
        s.dataset.mvAd = id;
        s.text = inlineJs;
        document.body.appendChild(s);
      };

      if (src) {
        const s = document.createElement("script");
        s.async = true;
        s.defer = true;
        s.src = src;
        s.dataset.mvAd = id;
        s.crossOrigin = "anonymous";
        s.onload = () => {
          try {
            injectInline();
          } catch (e) {
            onError?.(e);
          }
        };
        s.onerror = (e) => onError?.(e);
        document.body.appendChild(s);
      } else {
        injectInline();
      }

      if (oncePerSession) markRunOnce(id);
    } catch (e) {
      onError?.(e);
      // Safety: never break UI
    }
  }, [id, src, inlineJs, oncePerSession, onError]);

  return null;
}

