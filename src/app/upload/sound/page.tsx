"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Music2, Upload, X, Tag } from "lucide-react";
import { useAuthStore, useNotificationStore } from "@/store";
import { cn, formatDuration } from "@/lib/utils";
import Link from "next/link";
import type { SoundCategory } from "@/types";

const CATEGORIES: Array<{ value: SoundCategory; label: string; emoji: string }> = [
  { value: "meme", label: "Meme", emoji: "😂" },
  { value: "funny", label: "Funny", emoji: "🤣" },
  { value: "bass", label: "Bass", emoji: "🔊" },
  { value: "anime", label: "Anime", emoji: "🎌" },
  { value: "gaming", label: "Gaming", emoji: "🎮" },
  { value: "movie", label: "Movie", emoji: "🎬" },
  { value: "turkish", label: "Turkish", emoji: "🇹🇷" },
  { value: "classic", label: "Classic", emoji: "💾" },
];

const ACCEPTED_AUDIO = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg", "audio/webm"];

export default function UploadSoundPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { addNotification } = useNotificationStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<SoundCategory>("meme");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);

  const handleFile = useCallback((f: File) => {
    if (!ACCEPTED_AUDIO.includes(f.type)) {
      addNotification({ type: "error", message: "Unsupported audio type. Use MP3, WAV, OGG." });
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      addNotification({ type: "error", message: "File too large. Max 10MB for audio." });
      return;
    }
    setFile(f);
    const url = URL.createObjectURL(f);
    setPreviewUrl(url);
    if (!title) setTitle(f.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "));

    // Get duration
    const audio = new Audio(url);
    audio.onloadedmetadata = () => setDuration(Math.round(audio.duration * 1000));
  }, [addNotification, title]);

  const togglePreview = () => {
    if (!audioRef.current) return;
    if (playing) { audioRef.current.pause(); setPlaying(false); }
    else { audioRef.current.play(); setPlaying(true); }
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
    if (tag && !tags.includes(tag) && tags.length < 8) {
      setTags([...tags, tag]);
      setTagInput("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title.trim()) return;
    setUploading(true);
    setProgress(10);

    try {
      const presignRes = await fetch("/api/upload/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mimeType: file.type, size: file.size, contentType: "sound" }),
      });
      if (!presignRes.ok) throw new Error("Failed to get upload URL");
      const { uploadUrl, publicUrl } = await presignRes.json();

      setProgress(30);

      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });
      if (!uploadRes.ok) throw new Error("Upload failed");
      setProgress(70);

      const saveRes = await fetch("/api/sounds/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          url: publicUrl,
          durationMs: duration,
          category,
          tags,
        }),
      });
      if (!saveRes.ok) throw new Error("Failed to save sound");

      setProgress(100);
      addNotification({ type: "success", message: "Sound uploaded! 🔊" });
      router.push("/soundboard");
    } catch (err) {
      addNotification({ type: "error", message: err instanceof Error ? err.message : "Upload failed" });
      setUploading(false);
      setProgress(0);
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
        <span className="text-6xl mb-4">🔒</span>
        <h2 className="font-display text-3xl tracking-wider mb-2">SIGN IN REQUIRED</h2>
        <Link href="/login" className="btn-brand mt-4">Sign In</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-display text-5xl tracking-wider mb-1">
          <span className="gradient-text">UPLOAD</span>{" "}
          <span className="text-white/60">SOUND</span>
        </h1>
        <p className="text-white/40 text-sm">Add a sound to the soundboard</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Drop zone */}
        {!file ? (
          <div
            onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200",
              dragging ? "border-purple-500 bg-purple-500/10" : "border-white/10 hover:border-white/25 hover:bg-white/3"
            )}
          >
            <input ref={fileInputRef} type="file" accept={ACCEPTED_AUDIO.join(",")}
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} className="hidden" />
            <Music2 size={36} className="mx-auto mb-4 text-white/20" />
            <p className="text-white/60 font-medium mb-1">
              Drop audio here or <span className="text-purple-400">click to browse</span>
            </p>
            <p className="text-white/25 text-sm font-mono">MP3 · WAV · OGG · Max 10MB</p>
          </div>
        ) : (
          <div className="glass rounded-2xl p-5 flex items-center gap-4">
            <button type="button" onClick={togglePreview}
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                playing ? "bg-purple-500 text-white" : "bg-white/10 text-white/70 hover:bg-purple-500/20 hover:text-purple-400"
              )}>
              {playing ? (
                <div className="audio-wave text-white flex items-end gap-px h-4">
                  <span /><span /><span /><span /><span />
                </div>
              ) : (
                <Music2 size={20} />
              )}
            </button>
            {previewUrl && (
              <audio ref={audioRef} src={previewUrl} onEnded={() => setPlaying(false)} />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{file.name}</p>
              <p className="text-xs text-white/40 font-mono mt-0.5">
                {(file.size / 1024).toFixed(0)} KB
                {duration && ` · ${formatDuration(duration)}`}
              </p>
            </div>
            <button type="button" onClick={() => { setFile(null); setPreviewUrl(null); setDuration(null); }}
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:bg-red-500/20 hover:text-red-400 transition-colors shrink-0">
              <X size={14} />
            </button>
          </div>
        )}

        {/* Title */}
        <div>
          <label className="text-xs font-mono text-white/40 uppercase tracking-wider block mb-2">Title *</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
            placeholder="Sound name..." required maxLength={100} className="input-field" />
        </div>

        {/* Description */}
        <div>
          <label className="text-xs font-mono text-white/40 uppercase tracking-wider block mb-2">
            Description <span className="text-white/20">(optional)</span>
          </label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)}
            placeholder="What is this sound from?" rows={2} maxLength={300} className="input-field resize-none" />
        </div>

        {/* Category */}
        <div>
          <label className="text-xs font-mono text-white/40 uppercase tracking-wider block mb-2">Category</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(({ value, label, emoji }) => (
              <button key={value} type="button" onClick={() => setCategory(value)}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2 rounded-xl border text-sm font-medium transition-all duration-150",
                  category === value
                    ? "bg-purple-500/20 border-purple-500/50 text-purple-300"
                    : "border-white/10 text-white/50 hover:text-white hover:border-white/25"
                )}>
                {emoji} {label}
              </button>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="text-xs font-mono text-white/40 uppercase tracking-wider block mb-2">
            Tags <span className="text-white/20">({tags.length}/8)</span>
          </label>
          <div className="flex gap-2 mb-3 flex-wrap">
            {tags.map((tag) => (
              <span key={tag} className="flex items-center gap-1 tag-pill active">
                #{tag}
                <button type="button" onClick={() => setTags(tags.filter((t) => t !== tag))}><X size={10} /></button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input type="text" value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(); } }}
              placeholder="Add a tag..." maxLength={20} className="input-field flex-1 py-2 text-sm" />
            <button type="button" onClick={addTag} className="btn-ghost py-2 px-4 text-sm"><Tag size={14} /></button>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-2">
          {uploading && (
            <div className="mb-4">
              <div className="flex justify-between text-xs text-white/40 font-mono mb-1.5">
                <span>Uploading...</span><span>{progress}%</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}
          <button type="submit" disabled={!file || !title.trim() || uploading}
            className="w-full py-3 text-sm rounded-xl font-semibold text-white transition-all duration-200 active:scale-95 disabled:opacity-50
                       bg-purple-600 hover:bg-purple-500 flex items-center justify-center gap-2">
            {uploading ? (
              <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Uploading...</>
            ) : (
              <><Upload size={16} /> Upload Sound</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
