"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Upload, X, ImageIcon, Film, Tag, Globe, Flag } from "lucide-react";
import { useAuthStore, useNotificationStore } from "@/store";
import { cn } from "@/lib/utils";
import Link from "next/link";
import type { MemeCategory } from "@/types";

const CATEGORIES: Array<{ value: MemeCategory; label: string; emoji: string }> = [
  { value: "global", label: "Global", emoji: "🌐" },
  { value: "turkish", label: "Turkish", emoji: "🇹🇷" },
  { value: "trending", label: "Trending", emoji: "🔥" },
  { value: "classic", label: "Classic", emoji: "💾" },
];

const ACCEPTED = ["image/jpeg", "image/png", "image/gif", "image/webp", "video/mp4", "video/webm"];

export default function UploadPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { addNotification } = useNotificationStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<MemeCategory>("global");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFile = useCallback((f: File) => {
    if (!ACCEPTED.includes(f.type)) {
      addNotification({ type: "error", message: "Unsupported file type. Use JPG, PNG, GIF, WebP, MP4, or WebM." });
      return;
    }
    const maxSize = f.type.startsWith("video/") ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (f.size > maxSize) {
      addNotification({ type: "error", message: `File too large. Max ${f.type.startsWith("video/") ? "50MB" : "10MB"}.` });
      return;
    }
    setFile(f);
    const url = URL.createObjectURL(f);
    setPreview(url);
    // Auto-suggest title from filename
    if (!title) {
      setTitle(f.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "));
    }
  }, [addNotification, title]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

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
      // Step 1: Get presigned upload URL
      const presignRes = await fetch("/api/upload/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mimeType: file.type, size: file.size, contentType: "meme" }),
      });

      if (!presignRes.ok) throw new Error("Failed to get upload URL");
      const { uploadUrl, key, publicUrl } = await presignRes.json();

      setProgress(30);

      // Step 2: Upload directly to R2
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      if (!uploadRes.ok) throw new Error("Failed to upload file");
      setProgress(70);

      // Step 3: Save meme record
      const saveRes = await fetch("/api/memes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          url: publicUrl,
          storageKey: key,
          mimeType: file.type,
          category,
          tags,
        }),
      });

      if (!saveRes.ok) throw new Error("Failed to save meme");
      const { data: savedMeme } = await saveRes.json();

      setProgress(100);
      addNotification({ type: "success", message: "Meme uploaded successfully! 🔥" });
      router.push(`/meme/${savedMeme.id}`);
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
        <p className="text-white/40 text-sm mb-6">You need an account to upload memes</p>
        <Link href="/login" className="btn-brand">Sign In</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-display text-5xl tracking-wider mb-1">
          <span className="gradient-text">UPLOAD</span>
        </h1>
        <p className="text-white/40 text-sm">Share a meme with the world</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Drop zone */}
        {!file ? (
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200",
              dragging
                ? "border-brand-500 bg-brand-500/10"
                : "border-white/10 hover:border-white/25 hover:bg-white/3"
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED.join(",")}
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              className="hidden"
            />
            <Upload size={36} className="mx-auto mb-4 text-white/20" />
            <p className="text-white/60 font-medium mb-1">
              Drop a file here or <span className="text-brand-400">click to browse</span>
            </p>
            <p className="text-white/25 text-sm font-mono">
              JPG · PNG · GIF · WebP · MP4 · WebM · Max 50MB
            </p>
          </div>
        ) : (
          <div className="relative rounded-2xl overflow-hidden border border-white/10 group">
            {file.type.startsWith("video/") ? (
              <video src={preview!} controls className="w-full max-h-80 object-contain bg-black" />
            ) : (
              <Image
                src={preview!}
                alt="Preview"
                width={600}
                height={400}
                className="w-full h-auto max-h-80 object-contain bg-black"
                unoptimized
              />
            )}
            <button
              type="button"
              onClick={() => { setFile(null); setPreview(null); }}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/70 flex items-center justify-center text-white hover:bg-red-500/80 transition-colors"
            >
              <X size={14} />
            </button>
            <div className="absolute bottom-3 left-3">
              <span className={cn(
                "text-[10px] font-mono font-bold uppercase px-2 py-1 rounded-lg",
                file.type.startsWith("video/") ? "bg-red-500/80" : "bg-blue-500/80"
              )}>
                {file.type.startsWith("video/") ? "VIDEO" : file.type.includes("gif") ? "GIF" : "IMAGE"}
              </span>
            </div>
          </div>
        )}

        {/* Title */}
        <div>
          <label className="text-xs font-mono text-white/40 uppercase tracking-wider block mb-2">
            Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Give your meme a catchy title..."
            required
            maxLength={200}
            className="input-field"
          />
          <p className="text-[11px] text-white/20 mt-1 font-mono text-right">{title.length}/200</p>
        </div>

        {/* Description */}
        <div>
          <label className="text-xs font-mono text-white/40 uppercase tracking-wider block mb-2">
            Description <span className="text-white/20">(optional)</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add context or caption..."
            rows={3}
            maxLength={500}
            className="input-field resize-none"
          />
        </div>

        {/* Category */}
        <div>
          <label className="text-xs font-mono text-white/40 uppercase tracking-wider block mb-2">
            Category
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(({ value, label, emoji }) => (
              <button
                key={value}
                type="button"
                onClick={() => setCategory(value)}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2 rounded-xl border text-sm font-medium transition-all duration-150",
                  category === value
                    ? "bg-brand-500/20 border-brand-500/50 text-brand-300"
                    : "border-white/10 text-white/50 hover:text-white hover:border-white/25"
                )}
              >
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
                <button type="button" onClick={() => setTags(tags.filter((t) => t !== tag))}>
                  <X size={10} />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(); }
              }}
              placeholder="Add a tag..."
              maxLength={20}
              className="input-field flex-1 py-2 text-sm"
            />
            <button type="button" onClick={addTag} className="btn-ghost py-2 px-4 text-sm">
              <Tag size={14} />
            </button>
          </div>
          <p className="text-[11px] text-white/20 mt-1 font-mono">Press Enter or comma to add</p>
        </div>

        {/* Submit */}
        <div className="pt-2">
          {uploading && (
            <div className="mb-4">
              <div className="flex justify-between text-xs text-white/40 font-mono mb-1.5">
                <span>Uploading...</span>
                <span>{progress}%</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-500 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
          <button
            type="submit"
            disabled={!file || !title.trim() || uploading}
            className="btn-brand w-full py-3 text-sm flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Uploading... {progress}%
              </>
            ) : (
              <>
                <Upload size={16} />
                Upload Meme
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
