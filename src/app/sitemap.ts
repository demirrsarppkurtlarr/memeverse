import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://memeverse.app";
  return [
    { url: base, changeFrequency: "hourly", priority: 1 },
    { url: `${base}/soundboard`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/categories`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/categories/global`, changeFrequency: "hourly", priority: 0.8 },
    { url: `${base}/categories/turkish`, changeFrequency: "hourly", priority: 0.8 },
    { url: `${base}/categories/trending`, changeFrequency: "hourly", priority: 0.8 },
    { url: `${base}/categories/classic`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/login`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/register`, changeFrequency: "yearly", priority: 0.3 },
  ];
}
