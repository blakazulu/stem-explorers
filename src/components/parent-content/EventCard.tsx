// src/components/parent-content/EventCard.tsx
"use client";

import { useState, useEffect } from "react";
import { Calendar, ExternalLink, X } from "lucide-react";
import type { ParentContentEvent } from "@/types";

interface EventCardProps {
  event: ParentContentEvent;
  isLast: boolean;
}

export function EventCard({ event, isLast }: EventCardProps) {
  const [isImageExpanded, setIsImageExpanded] = useState(false);

  // Close expanded image on Escape key
  useEffect(() => {
    if (!isImageExpanded) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsImageExpanded(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isImageExpanded]);

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="relative flex gap-4">
      {/* Timeline line and dot */}
      <div className="flex flex-col items-center">
        <div className="w-3 h-3 bg-role-parent rounded-full border-2 border-white shadow-sm z-10" />
        {!isLast && (
          <div className="w-0.5 bg-role-parent/30 flex-1 min-h-[24px]" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pb-6">
        <div className="relative bg-white rounded-xl border border-surface-2 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          {/* Date badge */}
          {event.date && (
            <div className="px-4 pt-4">
              <span className="inline-flex items-center gap-1.5 text-sm bg-role-parent/10 text-role-parent px-3 py-1 rounded-full">
                <Calendar size={14} />
                {formatDate(event.date)}
              </span>
            </div>
          )}

          {/* Image thumbnail */}
          {event.imageUrl && (
            <div
              className="mt-3 cursor-pointer group"
              onClick={() => setIsImageExpanded(true)}
            >
              <img
                src={event.imageUrl}
                alt={event.title}
                className="w-full max-h-96 object-contain bg-gray-50 transition-all group-hover:brightness-95"
              />
            </div>
          )}

          {/* Text content */}
          <div className="p-4">
            <h3 className="font-semibold text-lg text-foreground">
              {event.title}
            </h3>
            <p className="text-gray-600 mt-2 leading-relaxed whitespace-pre-wrap">
              {event.description}
            </p>

            {/* Link */}
            {event.linkUrl && (
              <a
                href={event.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-3 text-role-parent hover:text-role-parent/80 font-medium transition-colors"
              >
                <ExternalLink size={16} />
                לפרטים נוספים
              </a>
            )}
          </div>

          {/* Expanded image overlay - covers entire card */}
          {event.imageUrl && isImageExpanded && (
            <div
              role="dialog"
              aria-modal="true"
              aria-label="תמונה מוגדלת"
              className="absolute inset-0 z-20 bg-black flex items-center justify-center cursor-pointer animate-fade-in"
              onClick={() => setIsImageExpanded(false)}
            >
              <img
                src={event.imageUrl}
                alt={event.title}
                className="max-w-full max-h-full object-contain"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsImageExpanded(false);
                }}
                className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white rounded-full shadow-md transition-colors"
                aria-label="סגור תמונה"
              >
                <X size={20} className="text-gray-700" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
