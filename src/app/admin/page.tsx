"use client";

import { useState, useEffect } from "react";
import { RefreshCw, Activity, Database, Music, Image } from "lucide-react";
import { formatNumber } from "@/lib/utils";

interface Stats {
  totalMemes: number;
  totalSounds: number;
}

interface ScraperLog {
  id: string;
  source: string;
  status: "success" | "error" | "partial";
  fetched_count: number;
  inserted_count: number;
  skipped_count: number;
  duration_ms: number;
  created_at: string;
}

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [logs, setLogs] = useState<ScraperLog[]>([]);
  const [scraping, setScraping] = useState(false);
  const [secret, setSecret] = useState("");

  const loadStats = async () => {
    const res = await fetch("/api/health");
    if (res.ok) {
      const data = await res.json();
      setStats(data.stats);
      setLogs(data.recentScrapes || []);
    }
  };

  useEffect(() => { loadStats(); }, []);

  const triggerScrape = async () => {
    setScraping(true);
    try {
      const res = await fetch("/api/cron/scrape", {
        method: "POST",
        headers: { Authorization: `Bearer ${secret}` },
      });
      const data = await res.json();
      if (data.ok) {
        await loadStats();
        alert(`Done! Reddit: +${data.results?.reddit?.inserted || 0} new memes`);
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (e) {
      alert("Request failed");
    }
    setScraping(false);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-display text-5xl tracking-wider gradient-text mb-1">ADMIN</h1>
        <p className="text-white/40 text-sm">Platform management & scraper control</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="glass rounded-2xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center">
            <Image size={18} className="text-brand-400" />
          </div>
          <div>
            <p className="font-display text-3xl">{stats ? formatNumber(stats.totalMemes) : "—"}</p>
            <p className="text-white/40 text-xs">Active Memes</p>
          </div>
        </div>
        <div className="glass rounded-2xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
            <Music size={18} className="text-purple-400" />
          </div>
          <div>
            <p className="font-display text-3xl">{stats ? formatNumber(stats.totalSounds) : "—"}</p>
            <p className="text-white/40 text-xs">Sounds</p>
          </div>
        </div>
      </div>

      {/* Manual Scrape */}
      <div className="glass rounded-2xl p-6 mb-6">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <Activity size={16} className="text-brand-400" />
          Manual Scrape
        </h2>
        <div className="flex gap-3">
          <input
            type="password"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            placeholder="CRON_SECRET"
            className="input-field flex-1 text-sm py-2"
          />
          <button
            onClick={triggerScrape}
            disabled={scraping || !secret}
            className="btn-brand flex items-center gap-2 text-sm whitespace-nowrap"
          >
            <RefreshCw size={14} className={scraping ? "animate-spin" : ""} />
            {scraping ? "Scraping..." : "Run Now"}
          </button>
        </div>
        <p className="text-white/25 text-xs font-mono mt-2">
          Auto-runs every 10 minutes via Vercel Cron
        </p>
      </div>

      {/* Recent Scrape Logs */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold flex items-center gap-2">
            <Database size={16} className="text-brand-400" />
            Recent Scrape Logs
          </h2>
          <button onClick={loadStats} className="btn-ghost text-xs py-1.5 px-3">
            Refresh
          </button>
        </div>
        {logs.length === 0 ? (
          <p className="text-white/30 text-sm text-center py-4">No logs yet</p>
        ) : (
          <div className="space-y-2">
            {logs.map((log) => (
              <div key={log.id} className="flex items-center justify-between glass rounded-xl px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full ${
                    log.status === "success" ? "bg-green-400" :
                    log.status === "partial" ? "bg-yellow-400" : "bg-red-400"
                  }`} />
                  <span className="text-sm font-medium capitalize">{log.source}</span>
                  <span className="text-xs text-white/30 font-mono">{log.status}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-white/40 font-mono">
                  <span>+{log.inserted_count} new</span>
                  <span>{log.skipped_count} skipped</span>
                  <span>{log.duration_ms}ms</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
