"use client";

interface YouTubeEmbedProps {
  url: string;
  title?: string;
  className?: string;
}

/**
 * Extract YouTube video ID from various URL formats
 */
function getYouTubeVideoId(url: string): string | null {
  // Regular youtube.com URLs
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
 * Get YouTube thumbnail URL from video ID
 */
export function getYouTubeThumbnail(url: string): string | null {
  const videoId = getYouTubeVideoId(url);
  if (!videoId) return null;
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

/**
 * Check if a URL is a YouTube URL
 */
export function isYouTubeUrl(url: string): boolean {
  return url.includes("youtube.com") || url.includes("youtu.be");
}

export default function YouTubeEmbed({
  url,
  title = "YouTube video",
  className = "",
}: YouTubeEmbedProps) {
  const videoId = getYouTubeVideoId(url);

  if (!videoId) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100 text-gray-500">
        קישור YouTube לא תקין
      </div>
    );
  }

  return (
    <iframe
      src={`https://www.youtube.com/embed/${videoId}`}
      title={title}
      className={`w-full h-full ${className}`}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    />
  );
}
