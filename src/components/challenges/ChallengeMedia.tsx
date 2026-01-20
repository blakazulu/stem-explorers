"use client";

import { useState } from "react";
import { Play, ExternalLink } from "lucide-react";

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

  const hasVideo = videoUrl || videoStorageUrl;
  const hasImage = imageUrl;

  if (!hasVideo && !hasImage) {
    return null;
  }

  // Render YouTube embed
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

  // Render Vimeo embed
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

  // Render direct uploaded video
  if (videoStorageUrl) {
    return (
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-900">
        {!videoPlaying ? (
          <button
            onClick={() => setVideoPlaying(true)}
            className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/50 transition-colors cursor-pointer group"
          >
            {/* Show thumbnail image if available */}
            {imageUrl && (
              <img
                src={imageUrl}
                alt={title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}
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

  // Render external video URL (not YouTube/Vimeo)
  if (videoUrl && !isYouTubeUrl(videoUrl) && !isVimeoUrl(videoUrl)) {
    return (
      <div className="space-y-3">
        {imageUrl && (
          <a
            href={imageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-auto max-h-[400px] object-contain rounded-xl shadow-sm hover:shadow-md transition-shadow"
            />
          </a>
        )}
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
      </div>
    );
  }

  // Render image only
  if (imageUrl) {
    return (
      <a
        href={imageUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-auto max-h-[400px] object-contain rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer"
        />
      </a>
    );
  }

  return null;
}
