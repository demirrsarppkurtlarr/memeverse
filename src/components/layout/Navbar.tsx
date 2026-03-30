"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Search, Upload, LogIn, Menu, X, Bell, Flame } from "lucide-react";
import { useAuthStore } from "@/store";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { SearchCombobox } from "@/components/ui/SearchCombobox";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuthStore();
  const { signOut } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    setSearchQuery("");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-white/5"
      style={{ background: "rgba(8,8,15,0.85)", backdropFilter: "blur(20px)" }}>
      <div className="flex items-center gap-3 h-full px-4 max-w-screen-2xl mx-auto">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0 group">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center glow-pink">
            <Flame size={18} className="text-white" />
          </div>
          <span className="font-display text-2xl tracking-wider hidden sm:block">
            <span className="gradient-text">MEME</span>
            <span className="text-white/80">VERSE</span>
          </span>
        </Link>

        {/* Search */}
        <div className="flex-1 max-w-xl mx-auto hidden sm:block">
          <SearchCombobox />
        </div>

        {/* Nav Actions */}
        <div className="flex items-center gap-2 ml-auto">
          {user ? (
            <>
              <Link href="/upload"
                className="btn-brand hidden sm:flex items-center gap-2 text-sm py-2 px-4">
                <Upload size={15} />
                <span>Upload</span>
              </Link>

              <button className="relative p-2 rounded-xl glass-hover text-white/60 hover:text-white">
                <Bell size={18} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full" />
              </button>

              <div className="relative">
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center gap-2 p-1 rounded-xl hover:bg-white/5 transition-colors"
                >
                  <Avatar
                    src={user.profile.avatar_url}
                    alt={user.profile.display_name || user.profile.username}
                    size={32}
                  />
                </button>

                {profileMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setProfileMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-52 glass rounded-2xl p-2 z-20 animate-scale-in shadow-xl">
                      <div className="px-3 py-2 mb-1">
                        <p className="font-semibold text-sm">{user.profile.display_name || user.profile.username}</p>
                        <p className="text-xs text-white/40 truncate">{user.email}</p>
                      </div>
                      <div className="border-t border-white/5 my-1" />
                      <Link href="/profile" onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/5 text-sm transition-colors">
                        Profile
                      </Link>
                      <Link href="/profile?tab=favorites" onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/5 text-sm transition-colors">
                        Favorites
                      </Link>
                      <div className="border-t border-white/5 my-1" />
                      <button onClick={() => { signOut(); setProfileMenuOpen(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-red-500/10 text-red-400 text-sm transition-colors">
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <Link href="/login" className="btn-ghost flex items-center gap-2 text-sm">
              <LogIn size={15} />
              <span>Sign In</span>
            </Link>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl glass-hover lg:hidden"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile search + menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-white/5 px-4 py-3 space-y-3"
          style={{ background: "rgba(8,8,15,0.95)" }}>
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="input-field pl-10 py-2 text-sm"
              />
            </div>
          </form>
          {user && (
            <Link href="/upload" onClick={() => setMobileMenuOpen(false)}
              className="btn-brand flex items-center justify-center gap-2 text-sm w-full">
              <Upload size={15} /> Upload Meme
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
