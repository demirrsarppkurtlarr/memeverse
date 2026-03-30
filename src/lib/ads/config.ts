export type AdsProvider = "adsterra" | "propeller" | "none";

/**
 * Monetization config (client-only injection).
 *
 * IMPORTANT:
 * - Do NOT paste full <script> tags here.
 * - Paste only the script URL (src) or inline JS body provided by the network.
 * - Leave empty to disable (components will no-op).
 */
export const ADS_CONFIG: {
  provider: AdsProvider;
  /** Top banner / in-feed banner */
  banner: {
    /** Script URL to load (preferred) */
    scriptSrc: string;
    /** Inline JS to execute after script load (optional) */
    inlineJs: string;
    /** Optional DOM container id required by some networks */
    containerId?: string;
  };
  /** Optional popunder / popup script (ONCE PER SESSION) */
  popup: {
    scriptSrc: string;
    inlineJs: string;
  };
  /** Smart display rules */
  rules: {
    inFeedEvery: number; // e.g. 5 = after every 5 memes
    enablePopup: boolean;
  };
} = {
  provider: "adsterra",
  banner: {
    // Paste your banner script URL here (example: https://...../invoke.js)
    scriptSrc: "",
    // Paste optional inline JS snippet here (if the provider requires it)
    inlineJs: "",
    // Example container id used by some providers
    containerId: "mv-ad-banner",
  },
  popup: {
    // Paste your popunder/popup script URL here (optional)
    scriptSrc: "",
    inlineJs: "",
  },
  rules: {
    inFeedEvery: 5,
    enablePopup: true,
  },
};

