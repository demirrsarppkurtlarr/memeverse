"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, TrendingUp, Globe, Flag, Star, Music2, Upload, Bookmark, User, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store";

const mainNav = [
  { href: "/", label: "Home", icon: Home },
  { href: "/?sort=trending", label: "Trending", icon: TrendingUp },
  { href: "/?sort=newest", label: "New", icon: Clock },
];

const categoryNav = [
  { href: "/categories/global", label: "Global", icon: Globe },
  { href: "/categories/turkish", label: "Turkish 🇹🇷", icon: Flag },
  { href: "/categories/trending", label: "Trending 🔥", icon: TrendingUp },
  { href: "/categories/classic", label: "Classic 💾", icon: Star },
];

const contentNav = [
  { href: "/soundboard", label: "Soundboard 🎵", icon: Music2 },
];

const tags = ["funny", "gaming", "anime", "relatable", "dark", "wholesome", "viral", "cringe"];

interface NavItemProps {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  exact?: boolean;
}

function NavItem({ href, label, icon: Icon, exact }: NavItemProps) {
  const pathname = usePathname();
  const isActive = exact
    ? pathname === href
    : pathname.startsWith(href) && href !== "/";

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
        isActive
          ? "bg-brand-500/15 text-brand-400 border border-brand-500/20"
          : "text-white/50 hover:text-white hover:bg-white/5"
      )}
    >
      <Icon size={17} className={isActive ? "text-brand-400" : ""} />
      <span>{label}</span>
    </Link>
  );
}

export function Sidebar() {
  const { user } = useAuthStore();
  const pathname = usePathname();
  const activeTagFromUrl =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("tag")
      : null;

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-60 hidden lg:flex flex-col
                      border-r border-white/5 overflow-y-auto scrollbar-none py-4">
      <div className="px-3 space-y-0.5">
        {mainNav.map((item) => (
          <NavItem key={item.href} {...item} exact={item.href === "/"} />
        ))}
      </div>

      <div className="px-3 mt-6">
        <p className="text-[10px] font-mono font-semibold tracking-widest text-white/20 uppercase px-3 mb-2">
          Categories
        </p>
        <div className="space-y-0.5">
          {categoryNav.map((item) => (
            <NavItem key={item.href} {...item} />
          ))}
        </div>
      </div>

      <div className="px-3 mt-6">
        <p className="text-[10px] font-mono font-semibold tracking-widest text-white/20 uppercase px-3 mb-2">
          Content
        </p>
        <div className="space-y-0.5">
          {contentNav.map((item) => (
            <NavItem key={item.href} {...item} />
          ))}
        </div>
      </div>

      {user && (
        <div className="px-3 mt-6">
          <p className="text-[10px] font-mono font-semibold tracking-widest text-white/20 uppercase px-3 mb-2">
            You
          </p>
          <div className="space-y-0.5">
            <NavItem href="/profile" label="Profile" icon={User} />
            <NavItem href="/profile?tab=favorites" label="Favorites" icon={Bookmark} />
            <NavItem href="/upload" label="Upload" icon={Upload} />
          </div>
        </div>
      )}

      <div className="px-3 mt-6">
        <p className="text-[10px] font-mono font-semibold tracking-widest text-white/20 uppercase px-3 mb-2">
          Tags
        </p>
        <div className="flex flex-wrap gap-1.5 px-1">
          {tags.map((tag) => (
            <Link key={tag} href={`/?tag=${tag}`}
              className={cn(
                "tag-pill",
                pathname === "/" && activeTagFromUrl === tag && "active"
              )}>
              #{tag}
            </Link>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto px-6 py-4">
        <p className="text-[10px] text-white/20 font-mono">Fresh picks for you</p>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse-soft" />
          <span className="text-[10px] text-green-400/70 font-mono">ONLINE</span>
        </div>
      </div>
    </aside>
  );
}
