"use client";

import { useState, useEffect } from "react";
import { Edit2, Trash2 } from "lucide-react";
import type { Expert } from "@/types";

interface ExpertCardProps {
  expert: Expert;
  isAdmin?: boolean;
  onClick: () => void;
  onEdit?: (expert: Expert) => void;
  onDelete?: (expert: Expert) => void;
}

export function ExpertCard({
  expert,
  isAdmin = false,
  onClick,
  onEdit,
  onDelete,
}: ExpertCardProps) {
  const [imageError, setImageError] = useState(false);

  // Reset error state when image URL changes
  useEffect(() => {
    setImageError(false);
  }, [expert.imageUrl]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      onClick={onClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`${expert.name}, ${expert.title}`}
      className="group relative flex flex-col items-center text-center p-4 rounded-2xl bg-surface-0 border border-surface-2 hover:border-primary/30 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300 cursor-pointer min-w-[140px]"
    >
      {/* Admin Actions */}
      {isAdmin && (
        <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(expert);
            }}
            className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg shadow-md hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
            title="עריכה"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(expert);
            }}
            className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg shadow-md hover:bg-error/10 hover:text-error transition-colors cursor-pointer"
            title="מחיקה"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}

      {/* Profile Image */}
      <div className="relative mb-3">
        {/* Decorative ring */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary via-secondary to-accent opacity-20 blur-sm scale-110 group-hover:opacity-40 group-hover:scale-115 transition-all duration-300" />

        {/* Image container */}
        <div className="relative w-20 h-20 rounded-full overflow-hidden border-3 border-white shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
          {!imageError && expert.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={expert.imageUrl}
              alt={expert.name}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
              <span className="text-2xl font-bold text-primary/60">
                {expert.name.charAt(0)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Name */}
      <h3 className="font-rubik font-bold text-foreground text-sm mb-0.5 group-hover:text-primary transition-colors duration-300 line-clamp-1">
        {expert.name}
      </h3>

      {/* Title */}
      <p className="text-xs text-gray-500 line-clamp-1">
        {expert.title}
      </p>
    </div>
  );
}
