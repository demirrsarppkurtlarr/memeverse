"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useNotificationStore } from "@/store";
import { Flame, Mail, Lock, User, Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { addNotification } = useNotificationStore();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !username) return;
    if (password.length < 8) {
      addNotification({ type: "error", message: "Password must be at least 8 characters" });
      return;
    }
    if (!/^[a-z0-9_]{3,20}$/.test(username)) {
      addNotification({ type: "error", message: "Username: 3-20 chars, lowercase letters, numbers, underscores only" });
      return;
    }

    setLoading(true);
    const supabase = createClient();

    // Check username availability
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username)
      .single();

    if (existing) {
      addNotification({ type: "error", message: "Username is already taken" });
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username, display_name: username },
      },
    });

    if (error) {
      addNotification({ type: "error", message: error.message });
      setLoading(false);
      return;
    }

    addNotification({ type: "success", message: "Account created! Welcome to MemeVerse 🔥" });
    router.push("/");
    router.refresh();
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-brand-500 flex items-center justify-center mx-auto mb-4 glow-pink">
            <Flame size={28} className="text-white" />
          </div>
          <h1 className="font-display text-4xl tracking-wider">
            JOIN <span className="gradient-text">MEMEVERSE</span>
          </h1>
          <p className="text-white/40 text-sm mt-2">Create your account and start meming</p>
        </div>

        <div className="glass rounded-2xl p-6">
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="text-xs font-mono text-white/40 uppercase tracking-wider block mb-1.5">
                Username
              </label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                  placeholder="coolmemer42"
                  required
                  maxLength={20}
                  className="input-field pl-10"
                />
              </div>
              <p className="text-[11px] text-white/25 mt-1 font-mono">
                3–20 chars · lowercase · letters, numbers, underscores
              </p>
            </div>

            <div>
              <label className="text-xs font-mono text-white/40 uppercase tracking-wider block mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-mono text-white/40 uppercase tracking-wider block mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={8}
                  className="input-field pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <p className="text-[11px] text-white/25 mt-1 font-mono">Minimum 8 characters</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-brand w-full py-3 text-sm"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : "Create Account 🔥"}
            </button>
          </form>

          <div className="mt-5 text-center">
            <p className="text-sm text-white/40">
              Already have an account?{" "}
              <Link href="/login" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
