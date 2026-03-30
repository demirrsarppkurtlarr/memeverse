"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize2 } from "lucide-react";
import { cn, formatDuration } from "@/lib/utils";

interface VideoPlayerProps {
  src: string;
  poster?: string;
  className?: string;
  autoPlay?: boolean;
}

export function VideoPlayer({ src, poster, className, autoPlay = false }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play(); setPlaying(true); }
    else { v.pause(); setPlaying(false); }
  }, []);

  const handleTimeUpdate = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    setCurrentTime(v.currentTime);
    setProgress((v.currentTime / v.duration) * 100);
  }, []);

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const v = videoRef.current;
    if (!v) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    v.currentTime = pct * v.duration;
  }, []);

  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setShowControls(false), 2500);
  }, []);

  const handleFullscreen = useCallback(() => {
    videoRef.current?.requestFullscreen();
  }, []);

  return (
    <div
      className={cn("relative bg-black group overflow-hidden", className)}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => playing && setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay={autoPlay}
        muted={muted}
        loop
        playsInline
        className="w-full h-full object-contain"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onClick={togglePlay}
      />

      {/* Big play button (center overlay when paused) */}
      {!playing && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center
                          border border-white/20 hover:bg-black/80 transition-all duration-200 hover:scale-110">
            <Play size={24} fill="white" className="text-white ml-1" />
          </div>
        </button>
      )}

      {/* Bottom controls */}
      <div className={cn(
        "absolute bottom-0 left-0 right-0 transition-opacity duration-300",
        "bg-gradient-to-t from-black/80 to-transparent pt-8 pb-3 px-3",
        showControls || !playing ? "opacity-100" : "opacity-0"
      )}>
        {/* Progress bar */}
        <div
          className="h-1 bg-white/20 rounded-full mb-3 cursor-pointer group/seek relative"
          onClick={handleSeek}
        >
          <div
            className="h-full bg-brand-500 rounded-full relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white
                            scale-0 group-hover/seek:scale-100 transition-transform" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={togglePlay} className="text-white hover:text-brand-400 transition-colors">
            {playing ? <Pause size={18} /> : <Play size={18} fill="currentColor" />}
          </button>

          <button onClick={() => setMuted(!muted)} className="text-white/70 hover:text-white transition-colors">
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>

          <span className="text-xs text-white/50 font-mono flex-1">
            {formatDuration(currentTime * 1000)} / {formatDuration(duration * 1000)}
          </span>

          <button onClick={handleFullscreen} className="text-white/70 hover:text-white transition-colors">
            <Maximize2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
