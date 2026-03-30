"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, TrendingUp, Music2, Upload, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store";

const NAV_ITEMS = [
  { href: "/", icon: Home, label: "Home", exact: true },
  { href: "/?sort=trending", icon: TrendingUp, label: "Trending", exact: false },
  { href: "/soundboard", icon: Music2, label: "Sounds", exact: false },
  { href: "/upload", icon: Upload, label: "Upload", exact: false },
  { href: "/profile", icon: User, label: "Profile", exact: false },
];

export function MobileNav() {
  const pathname = usePathname();
  const { user } = useAuthStore();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden border-t border-white/5"
      style={{ background: "rgba(8,8,15,0.95)", backdropFilter: "blur(20px)" }}>
      <div className="flex items-center justify-around py-2 px-2">
        {NAV_ITEMS.map(({ href, icon: Icon, label, exact }) => {
          const isActive = exact ? pathname === "/" : pathname.startsWith(href.split("?")[0]) && href !== "/";
          return (
            <Link key={href} href={user || href !== "/profile" ? href : "/login"}
              className={cn(
                "flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all duration-150",
                isActive ? "text-brand-400" : "text-white/35 hover:text-white/70"
              )}>
              <Icon size={20} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
