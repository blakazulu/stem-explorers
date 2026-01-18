"use client";

import { useState } from "react";
import { Image, Calendar, User, Trash2, Images, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import type { Documentation } from "@/types";

interface DocumentationVisibility {
  images: boolean;
  text: boolean;
  teacherName: boolean;
}

interface DocumentationCardProps {
  doc: Documentation;
  canDelete: boolean;
  onDelete: (doc: Documentation) => void;
  onClick?: (doc: Documentation) => void;
  index?: number;
  visibility?: DocumentationVisibility;
}

export function DocumentationCard({
  doc,
  canDelete,
  onDelete,
  onClick,
  index = 0,
  visibility = { images: true, text: true, teacherName: true },
}: DocumentationCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <Card
      padding="none"
      interactive={!!onClick}
      onClick={onClick ? () => onClick(doc) : undefined}
      className={`group overflow-hidden animate-slide-up stagger-${Math.min(index + 1, 6)} ${onClick ? "cursor-pointer" : ""}`}
    >
      {/* Image Section - controlled by visibility */}
      {visibility.images && (
        doc.images.length > 0 && !imageError ? (
          <div className="aspect-video relative overflow-hidden bg-surface-2">
            {/* Loading spinner */}
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 size={32} className="text-gray-400 animate-spin" />
              </div>
            )}
            <img
              src={doc.images[0]}
              alt={doc.text || "תיעוד"}
              className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-105 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Image count badge */}
            {doc.images.length > 1 && (
              <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 bg-black/70 backdrop-blur-sm text-white text-xs px-2.5 py-1.5 rounded-lg">
                <Images size={14} />
                {doc.images.length} תמונות
              </span>
            )}
          </div>
        ) : (
          <div className="aspect-video bg-surface-2 flex items-center justify-center">
            <Image size={48} className="text-gray-300" />
          </div>
        )
      )}

      {/* Content Section */}
      <div className="p-4">
        {visibility.text && doc.text && (
          <p className="text-foreground mb-3 line-clamp-2">{doc.text}</p>
        )}

        {/* Meta info */}
        <div className="flex items-center gap-4 text-sm text-gray-500">
          {visibility.teacherName && (
            <span className="inline-flex items-center gap-1.5">
              <User size={14} />
              {doc.teacherName}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5">
            <Calendar size={14} />
            {doc.createdAt.toLocaleDateString("he-IL")}
          </span>
        </div>

        {/* Delete button */}
        {canDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(doc);
            }}
            className="mt-3 inline-flex items-center gap-1.5 text-sm text-error hover:text-error/80 hover:underline cursor-pointer transition-colors"
          >
            <Trash2 size={14} />
            מחק
          </button>
        )}
      </div>
    </Card>
  );
}
