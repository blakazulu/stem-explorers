// src/components/parent-content/EventCard.tsx
"use client";

import { Calendar, ExternalLink } from "lucide-react";
import type { ParentContentEvent } from "@/types";

interface EventCardProps {
  event: ParentContentEvent;
  isLast: boolean;
}

export function EventCard({ event, isLast }: EventCardProps) {
  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("he-IL", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
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
        <div className="bg-white rounded-xl border border-surface-2 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          {/* Date badge */}
          {event.date && (
            <div className="px-4 pt-4">
              <span className="inline-flex items-center gap-1.5 text-sm bg-role-parent/10 text-role-parent px-3 py-1 rounded-full">
                <Calendar size={14} />
                {formatDate(event.date)}
              </span>
            </div>
          )}

          {/* Image */}
          {event.imageUrl && (
            <div className="mt-3">
              <img
                src={event.imageUrl}
                alt={event.title}
                className="w-full h-48 object-cover"
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
        </div>
      </div>
    </div>
  );
}
