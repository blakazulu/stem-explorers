"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import YouTubeEmbed, { isYouTubeUrl } from "./YouTubeEmbed";

interface VideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title: string;
  type: "video" | "youtube";
}

export default function VideoPlayerModal({
  isOpen,
  onClose,
  url,
  title,
  type,
}: VideoPlayerModalProps) {
  // Use ref to hold the latest onClose callback
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCloseRef.current();
      }
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const isYouTube = type === "youtube" || isYouTubeUrl(url);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 left-4 p-2 text-white hover:text-gray-300 transition-colors z-10"
        aria-label="סגור"
      >
        <X className="w-8 h-8" />
      </button>

      {/* Title */}
      <div className="absolute top-4 right-4 text-white text-lg font-medium z-10">
        {title}
      </div>

      {/* Video container */}
      <div
        className="relative w-full max-w-4xl mx-4 aspect-video"
        onClick={(e) => e.stopPropagation()}
      >
        {isYouTube ? (
          <YouTubeEmbed url={url} title={title} className="rounded-lg" />
        ) : (
          <video
            src={url}
            controls
            autoPlay
            className="w-full h-full rounded-lg"
          >
            הדפדפן שלך לא תומך בתגית וידאו
          </video>
        )}
      </div>
    </div>
  );
}
