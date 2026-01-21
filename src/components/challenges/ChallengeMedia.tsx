"use client";

import { useState, useEffect } from "react";
import { Play, ExternalLink, X } from "lucide-react";

interface ChallengeMediaProps {
  imageUrl?: string;
  videoUrl?: string;        // YouTube/Vimeo URL
  videoStorageUrl?: string; // Direct upload URL
  title: string;
}

/**
 * Extract YouTube video ID from various URL formats
 */
function getYouTubeVideoId(url: string): string | null {
  const regExp =
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);

  if (match && match[2].length === 11) {
    return match[2];
  }

  // YouTube Shorts
  const shortsMatch = url.match(/youtube\.com\/shorts\/([^#&?]*)/);
  if (shortsMatch && shortsMatch[1].length === 11) {
    return shortsMatch[1];
  }

  return null;
}

/**
 * Extract Vimeo video ID
 */
function getVimeoVideoId(url: string): string | null {
  const regExp = /vimeo\.com\/(\d+)/;
  const match = url.match(regExp);
  return match ? match[1] : null;
}

/**
 * Check if URL is YouTube
 */
function isYouTubeUrl(url: string): boolean {
  return url.includes("youtube.com") || url.includes("youtu.be");
}

/**
 * Check if URL is Vimeo
 */
function isVimeoUrl(url: string): boolean {
  return url.includes("vimeo.com");
}

export function ChallengeMedia({
  imageUrl,
  videoUrl,
  videoStorageUrl,
  title,
}: ChallengeMediaProps) {
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);

  // Handle Escape key to close modal
  useEffect(() => {
    if (!imageModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setImageModalOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [imageModalOpen]);

  const hasVideo = videoUrl || videoStorageUrl;
  const hasImage = imageUrl;

  if (!hasVideo && !hasImage) {
    return null;
  }

  // Helper to render video
  const renderVideo = () => {
    // YouTube embed
    if (videoUrl && isYouTubeUrl(videoUrl)) {
      const videoId = getYouTubeVideoId(videoUrl);
      if (videoId) {
        return (
          <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-100">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              title={title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        );
      }
    }

    // Vimeo embed
    if (videoUrl && isVimeoUrl(videoUrl)) {
      const videoId = getVimeoVideoId(videoUrl);
      if (videoId) {
        return (
          <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-100">
            <iframe
              src={`https://player.vimeo.com/video/${videoId}`}
              title={title}
              className="w-full h-full"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          </div>
        );
      }
    }

    // Direct uploaded video
    if (videoStorageUrl) {
      return (
        <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-900">
          {!videoPlaying ? (
            <button
              onClick={() => setVideoPlaying(true)}
              className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/50 transition-colors cursor-pointer group"
            >
              <div className="relative z-10 w-16 h-16 md:w-20 md:h-20 flex items-center justify-center bg-white/90 rounded-full shadow-lg group-hover:scale-110 transition-transform">
                <Play className="w-8 h-8 md:w-10 md:h-10 text-amber-600 mr-[-2px]" />
              </div>
            </button>
          ) : (
            <video
              src={videoStorageUrl}
              controls
              autoPlay
              className="w-full h-full object-contain"
            >
              הדפדפן שלך לא תומך בתגית וידאו
            </video>
          )}
        </div>
      );
    }

    // External video URL (not YouTube/Vimeo)
    if (videoUrl && !isYouTubeUrl(videoUrl) && !isVimeoUrl(videoUrl)) {
      return (
        <a
          href={videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors text-sm font-medium"
        >
          <Play size={16} />
          צפה בסרטון
          <ExternalLink size={14} />
        </a>
      );
    }

    return null;
  };

  // Helper to render image
  const renderImage = () => {
    if (!imageUrl) return null;
    return (
      <button
        onClick={() => setImageModalOpen(true)}
        className="block w-full text-right"
      >
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-auto max-h-[400px] object-contain rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer"
        />
      </button>
    );
  };

  // Render both if both exist, otherwise render whichever exists
  return (
    <>
      <div className="space-y-4">
        {renderVideo()}
        {renderImage()}
      </div>

      {/* Image Modal */}
      {imageModalOpen && imageUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setImageModalOpen(false)}
        >
          <button
            onClick={() => setImageModalOpen(false)}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            aria-label="סגור"
          >
            <X size={24} className="text-white" />
          </button>
          <img
            src={imageUrl}
            alt={title}
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
