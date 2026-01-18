"use client";

import { useState, useEffect } from "react";
import { Edit2, Trash2, GripVertical } from "lucide-react";
import type { DraggableAttributes } from "@dnd-kit/core";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import type { Expert, ExpertAvailability } from "@/types";
import { useRoleStyles } from "@/contexts/ThemeContext";

function getExpertBadge(availability: ExpertAvailability[] | undefined): {
  type: "none" | "no-month" | "no-future";
  label: string;
  color: string;
} | null {
  if (!availability || availability.length === 0) {
    return {
      type: "no-future",
      label: "לא זמין",
      color: "bg-red-500 text-white",
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split("T")[0];

  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  // Check for any future dates
  const hasFutureDates = availability.some((a) => a.date >= todayStr);

  if (!hasFutureDates) {
    return {
      type: "no-future",
      label: "לא זמין",
      color: "bg-red-500 text-white",
    };
  }

  // Check for dates in current month
  const hasCurrentMonthDates = availability.some((a) => {
    const date = new Date(a.date);
    return (
      date >= today &&
      date.getMonth() === currentMonth &&
      date.getFullYear() === currentYear
    );
  });

  if (!hasCurrentMonthDates) {
    return {
      type: "no-month",
      label: "לא זמין החודש",
      color: "bg-amber-500 text-white",
    };
  }

  return null;
}

interface ExpertCardProps {
  expert: Expert;
  isAdmin?: boolean;
  isDragging?: boolean;
  dragHandleProps?: {
    attributes: DraggableAttributes;
    listeners: SyntheticListenerMap | undefined;
  };
  onClick: () => void;
  onEdit?: (expert: Expert) => void;
  onDelete?: (expert: Expert) => void;
}

export function ExpertCard({
  expert,
  isAdmin = false,
  isDragging = false,
  dragHandleProps,
  onClick,
  onEdit,
  onDelete,
}: ExpertCardProps) {
  const [imageError, setImageError] = useState(false);
  const roleStyles = useRoleStyles();
  const badge = isAdmin ? getExpertBadge(expert.availability) : null;

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
      className={`group relative flex flex-col items-center text-center p-4 rounded-theme bg-surface-0 border border-surface-2 hover:${roleStyles.border}/30 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-${roleStyles.accent}/50 focus:${roleStyles.border} transition-all duration-theme ease-theme cursor-pointer min-w-[140px] ${
        isDragging ? "opacity-50 scale-105 ring-2 ring-primary shadow-xl" : ""
      }`}
    >
      {/* Availability Badge (Admin only) */}
      {badge && (
        <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-medium ${badge.color} z-10`}>
          {badge.label}
        </div>
      )}

      {/* Admin Actions */}
      {isAdmin && (
        <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
          {/* Drag Handle */}
          {dragHandleProps && (
            <button
              {...dragHandleProps.attributes}
              {...dragHandleProps.listeners}
              className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg shadow-md hover:bg-surface-2 transition-colors cursor-grab active:cursor-grabbing touch-none"
              title="גרור לשינוי סדר"
              aria-label="גרור לשינוי סדר הצגה"
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical size={14} className="text-gray-600" />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(expert);
            }}
            className={`p-1.5 bg-white/90 backdrop-blur-sm rounded-lg shadow-md hover:${roleStyles.bgLight} hover:${roleStyles.text} transition-colors cursor-pointer`}
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
        <div className={`absolute inset-0 rounded-full ${roleStyles.bg} opacity-20 blur-sm scale-110 group-hover:opacity-40 group-hover:scale-115 transition-all duration-theme ease-theme`} />

        {/* Image container */}
        <div className="relative w-20 h-20 rounded-full overflow-hidden border-3 border-white shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-theme ease-theme">
          {!imageError && expert.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={expert.imageUrl}
              alt={expert.name}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className={`w-full h-full ${roleStyles.bgLight} flex items-center justify-center`}>
              <span className={`text-2xl font-bold ${roleStyles.text} opacity-60`}>
                {expert.name.charAt(0)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Name */}
      <h3 className={`font-rubik font-bold text-foreground text-sm mb-0.5 group-hover:${roleStyles.text} transition-colors duration-theme line-clamp-1`}>
        {expert.name}
      </h3>

      {/* Title */}
      <p className="text-xs text-gray-500 line-clamp-1">
        {expert.title}
      </p>
    </div>
  );
}
