"use client";

import { useEffect, useRef, useState } from "react";
import { X, Loader2 } from "lucide-react";

interface EmbedPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title: string;
}

export default function EmbedPlayerModal({
  isOpen,
  onClose,
  url,
  title,
}: EmbedPlayerModalProps) {
  const [isLoading, setIsLoading] = useState(true);

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
    setIsLoading(true);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

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

      {/* Embed container */}
      <div
        className="relative w-full max-w-5xl mx-4 aspect-video"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 rounded-lg">
            <Loader2 className="w-10 h-10 text-white animate-spin" />
          </div>
        )}

        <iframe
          src={url}
          title={title}
          className="w-full h-full rounded-lg"
          allowFullScreen
          allow="autoplay; fullscreen; encrypted-media"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-presentation"
          onLoad={() => setIsLoading(false)}
          style={{ border: "none" }}
        />
      </div>
    </div>
  );
}
