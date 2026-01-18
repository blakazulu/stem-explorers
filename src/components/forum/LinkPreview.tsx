"use client";

import { useState, useEffect } from "react";
import { ExternalLink, Globe } from "lucide-react";

interface LinkPreviewData {
  url: string;
  title: string;
  description: string;
  image: string | null;
  siteName: string | null;
}

interface LinkPreviewProps {
  url: string;
}

// LRU-style cache with size limit
const MAX_CACHE_SIZE = 100;
const previewCache = new Map<string, LinkPreviewData>();

function setCacheItem(url: string, data: LinkPreviewData) {
  // Remove oldest entry if at capacity
  if (previewCache.size >= MAX_CACHE_SIZE) {
    const firstKey = previewCache.keys().next().value;
    if (firstKey) previewCache.delete(firstKey);
  }
  previewCache.set(url, data);
}

// Runtime validation of API response
function isValidPreviewData(data: unknown): data is LinkPreviewData {
  if (typeof data !== "object" || data === null) return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d.url === "string" &&
    typeof d.title === "string" &&
    typeof d.description === "string" &&
    (d.image === null || typeof d.image === "string") &&
    (d.siteName === null || typeof d.siteName === "string")
  );
}

export function LinkPreview({ url }: LinkPreviewProps) {
  const [preview, setPreview] = useState<LinkPreviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchPreview() {
      // Check cache first
      if (previewCache.has(url)) {
        setPreview(previewCache.get(url)!);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("/.netlify/functions/fetch-link-preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });

        if (!response.ok) throw new Error("Failed to fetch");

        const data: unknown = await response.json();

        // Validate response structure
        if (!isValidPreviewData(data)) {
          throw new Error("Invalid response data");
        }

        if (!cancelled) {
          setCacheItem(url, data);
          setPreview(data);
          setLoading(false);
        }
      } catch (err) {
        console.warn("Link preview fetch failed for:", url, err);
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      }
    }

    fetchPreview();

    return () => {
      cancelled = true;
    };
  }, [url]);

  if (loading) {
    return (
      <div className="mt-3 border border-surface-3 rounded-theme overflow-hidden animate-pulse">
        <div className="flex">
          <div className="w-24 h-24 bg-surface-2 shrink-0" />
          <div className="flex-1 p-3 space-y-2">
            <div className="h-4 bg-surface-2 rounded w-3/4" />
            <div className="h-3 bg-surface-2 rounded w-full" />
            <div className="h-3 bg-surface-2 rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !preview) {
    return null;
  }

  // Don't show preview if we only have the URL/hostname (no real metadata)
  if (preview.title === new URL(url).hostname && !preview.description && !preview.image) {
    return null;
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-3 block border border-surface-3 rounded-theme overflow-hidden hover:border-primary/50 transition-colors duration-theme group"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex">
        {/* Image */}
        {preview.image ? (
          <div className="w-24 h-24 md:w-32 md:h-32 shrink-0 bg-surface-2 overflow-hidden">
            <img
              src={preview.image}
              alt=""
              className="w-full h-full object-cover"
              onError={(e) => {
                // Hide image on error
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        ) : (
          <div className="w-24 h-24 md:w-32 md:h-32 shrink-0 bg-surface-2 flex items-center justify-center">
            <Globe size={32} className="text-gray-400" />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 p-3 min-w-0">
          {/* Site name */}
          {preview.siteName && (
            <p className="text-xs text-gray-500 mb-1 truncate">
              {preview.siteName}
            </p>
          )}

          {/* Title */}
          <h4 className="font-medium text-foreground text-sm line-clamp-2 group-hover:text-primary transition-colors duration-theme">
            {preview.title}
          </h4>

          {/* Description */}
          {preview.description && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
              {preview.description}
            </p>
          )}

          {/* URL indicator */}
          <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
            <ExternalLink size={12} />
            <span className="truncate">{new URL(url).hostname}</span>
          </div>
        </div>
      </div>
    </a>
  );
}

// Extract all URLs from text (excluding markdown link URLs which are handled separately)
export function extractUrls(text: string): string[] {
  // Match markdown links first to exclude them
  const markdownLinkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
  const markdownUrls = new Set<string>();
  let match;
  while ((match = markdownLinkRegex.exec(text)) !== null) {
    markdownUrls.add(match[2]);
  }

  // Match plain URLs
  const urlRegex = /https?:\/\/[^\s<>")\]]+/g;
  const allUrls: string[] = [];
  while ((match = urlRegex.exec(text)) !== null) {
    // Clean trailing punctuation
    let url = match[0].replace(/[.,;:!?)]+$/, "");
    // Only add if not already in markdown links
    if (!markdownUrls.has(url) && !allUrls.includes(url)) {
      allUrls.push(url);
    }
  }

  // Add markdown URLs (they also get previews)
  for (const url of markdownUrls) {
    if (!allUrls.includes(url)) {
      allUrls.push(url);
    }
  }

  // Return unique URLs, max 3 previews per post
  return allUrls.slice(0, 3);
}
