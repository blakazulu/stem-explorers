"use client";

import { useState } from "react";
import { Play, Pencil, Trash2, GripVertical, ImageIcon, Presentation } from "lucide-react";
import type { PersonalMedia } from "@/types";
import { getYouTubeThumbnail } from "./YouTubeEmbed";

interface PersonalMediaCardProps {
  media: PersonalMedia;
  onClick: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  isAdmin?: boolean;
  isDragging?: boolean;
  dragHandleProps?: Record<string, unknown>;
}

export default function PersonalMediaCard({
  media,
  onClick,
  onEdit,
  onDelete,
  isAdmin = false,
  isDragging = false,
  dragHandleProps,
}: PersonalMediaCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const isVideo = media.type === "video" || media.type === "youtube";
  const isEmbed = media.type === "embed";

  // Get thumbnail URL
  const thumbnailUrl =
    media.type === "youtube"
      ? getYouTubeThumbnail(media.url)
      : media.thumbnailUrl || (media.type === "image" ? media.url : null);

  return (
    <div
      className={`group relative rounded-lg overflow-hidden bg-white shadow-md transition-all duration-200 ${
        isDragging ? "opacity-50 scale-95" : "hover:shadow-lg"
      }`}
    >
      {/* Drag handle (admin only) */}
      {isAdmin && dragHandleProps && (
        <button
          type="button"
          {...dragHandleProps}
          className="absolute top-2 right-2 z-10 p-1.5 bg-white/80 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
          aria-label="גרור כדי לסדר מחדש"
        >
          <GripVertical className="w-4 h-4 text-gray-500" />
        </button>
      )}

      {/* Image/Thumbnail */}
      <div
        className="relative cursor-pointer aspect-[4/3] overflow-hidden bg-gray-100"
        onClick={onClick}
      >
        {isEmbed ? (
          // Embed placeholder with gradient background
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-teal-50 to-teal-100">
            <Presentation className="w-12 h-12 text-teal-500 mb-2" />
            <span className="text-xs text-teal-600 font-medium">מצגת</span>
          </div>
        ) : thumbnailUrl && !imageError ? (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
              </div>
            )}
            <img
              src={thumbnailUrl}
              alt={media.title}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <ImageIcon className="w-12 h-12 text-gray-300" />
          </div>
        )}

        {/* Video play button overlay */}
        {isVideo && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
            <div className="w-14 h-14 flex items-center justify-center bg-white/90 rounded-full shadow-lg group-hover:scale-110 transition-transform">
              <Play className="w-7 h-7 text-gray-800 mr-[-2px]" />
            </div>
          </div>
        )}

        {/* Embed open button overlay */}
        {isEmbed && (
          <div className="absolute inset-0 flex items-center justify-center bg-teal-500/10 group-hover:bg-teal-500/20 transition-colors">
            <div className="w-14 h-14 flex items-center justify-center bg-white/90 rounded-full shadow-lg group-hover:scale-110 transition-transform">
              <Presentation className="w-7 h-7 text-teal-600" />
            </div>
          </div>
        )}
      </div>

      {/* Info section */}
      <div className="p-3">
        <h3 className="font-medium text-gray-900 truncate text-right">
          {media.title}
        </h3>
        {media.description && (
          <p className="text-sm text-gray-500 mt-1 line-clamp-2 text-right">
            {media.description}
          </p>
        )}
      </div>

      {/* Admin actions */}
      {isAdmin && (
        <div className="absolute bottom-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="p-1.5 bg-white/90 hover:bg-white rounded-full shadow transition-colors"
              title="ערוך"
            >
              <Pencil className="w-4 h-4 text-gray-600" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-1.5 bg-white/90 hover:bg-red-50 rounded-full shadow transition-colors"
              title="מחק"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
