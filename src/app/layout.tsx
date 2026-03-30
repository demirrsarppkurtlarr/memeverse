import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { NotificationStack } from "@/components/ui/NotificationStack";
import { SfxPanel } from "@/components/sfx/SfxPanel";
import { AdBanner } from "@/components/ads/AdBanner";
import { AdPopupTrigger } from "@/components/ads/AdPopupTrigger";
import { AuthProvider } from "@/components/layout/AuthProvider";
import { SWRProvider } from "@/components/layout/SWRProvider";

const display = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const body = Outfit({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "MemeVerse — Global Meme Hub", template: "%s | MemeVerse" },
  description: "The world's freshest memes, viral sounds, and short clips. Updated every 10 minutes from Reddit, Twitter, and TikTok.",
  keywords: ["memes", "funny", "viral", "soundboard", "sfx", "turkish memes", "trending"],
  authors: [{ name: "MemeVerse" }],
  openGraph: {
    title: "MemeVerse — Global Meme Hub",
    description: "Fresh memes, sounds, and viral content updated every 10 minutes.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#ff2aa3",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${display.variable} ${body.variable} ${mono.variable} font-body bg-surface-950 text-white antialiased`}>
        <SWRProvider>
          <AuthProvider>
            <div className="flex min-h-screen flex-col">
              <Navbar />
              <AdBanner />
              <div className="flex flex-1 pt-16 pb-16 lg:pb-0">
                <Sidebar />
                <main className="flex-1 lg:ml-60 min-h-[calc(100vh-4rem)]">
                  {children}
                </main>
              </div>
              <MobileNav />
            </div>
            <NotificationStack />
            <SfxPanel />
            <AdPopupTrigger />
          </AuthProvider>
        </SWRProvider>
      </body>
    </html>
  );
}
