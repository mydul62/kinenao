"use client";

import React, { useState, useRef } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, Film } from "lucide-react";

interface ProductVideoPlayerProps {
  videoUrl: string;
  posterUrl?: string | null;
  productName?: string;
  className?: string;
}

export default function ProductVideoPlayer({
  videoUrl,
  posterUrl,
  productName = "Product Video",
  className = "",
}: ProductVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleFullScreen = () => {
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  if (!videoUrl) return null;

  return (
    <div
      className={`relative w-full rounded-2xl md:rounded-3xl overflow-hidden bg-black aspect-video group shadow-md border border-slate-200/80 ${className}`}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={videoUrl}
        poster={posterUrl || undefined}
        playsInline
        muted={isMuted}
        loop
        preload="metadata"
        onLoadedData={() => setIsLoaded(true)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onClick={togglePlay}
        className="w-full h-full object-cover cursor-pointer"
      />

      {/* Video Badge */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-black/60 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide">
        <Film className="w-3.5 h-3.5 text-emerald-400" />
        <span>HD Video</span>
      </div>

      {/* Center Play/Pause Overlay */}
      {!isPlaying && (
        <button
          onClick={togglePlay}
          aria-label="Play video"
          className="absolute inset-0 m-auto w-14 h-14 md:w-16 md:h-16 rounded-full bg-emerald-600/90 text-white flex items-center justify-center shadow-2xl hover:scale-110 hover:bg-emerald-600 transition-all duration-300 z-20 cursor-pointer"
        >
          <Play className="w-7 h-7 fill-white translate-x-0.5" />
        </button>
      )}

      {/* Bottom Controls Bar (Fades in on hover / active) */}
      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 md:p-4 flex items-center justify-between text-white opacity-90 group-hover:opacity-100 transition-opacity z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={togglePlay}
            className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-white" />}
          </button>
          <button
            onClick={toggleMute}
            className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5" />}
          </button>
          <span className="text-xs font-semibold text-slate-200 hidden sm:inline truncate max-w-[200px]">
            {productName}
          </span>
        </div>

        <button
          onClick={handleFullScreen}
          className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
          title="Fullscreen"
        >
          <Maximize className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
