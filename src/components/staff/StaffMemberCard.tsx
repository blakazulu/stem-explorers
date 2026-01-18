"use client";

import { useState, useEffect } from "react";
import { Edit2, Trash2, GripVertical } from "lucide-react";
import { useRoleStyles } from "@/contexts/ThemeContext";
import type { DraggableAttributes } from "@dnd-kit/core";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import type { StaffMember } from "@/types";

interface StaffMemberCardProps {
  member: StaffMember;
  isAdmin?: boolean;
  isDragging?: boolean;
  dragHandleProps?: {
    attributes: DraggableAttributes;
    listeners: SyntheticListenerMap | undefined;
  };
  onEdit?: (member: StaffMember) => void;
  onDelete?: (member: StaffMember) => void;
}

export function StaffMemberCard({
  member,
  isAdmin = false,
  isDragging = false,
  dragHandleProps,
  onEdit,
  onDelete,
}: StaffMemberCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { accent } = useRoleStyles();

  // Reset error state when image URL changes
  useEffect(() => {
    setImageError(false);
  }, [member.imageUrl]);

  const handleToggle = () => {
    // Allow click toggle only for non-admin (admin uses hover only to keep edit/delete accessible)
    if (!isAdmin) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div
      className={`group relative aspect-[4/5] rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300 ${
        isDragging
          ? `opacity-50 scale-105 ring-4 ring-${accent}`
          : `ring-2 ring-${accent}/50 hover:ring-4 hover:ring-${accent}`
      }`}
      onClick={handleToggle}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        {!imageError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={member.imageUrl}
            alt={member.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/30 via-secondary/20 to-accent/30 flex items-center justify-center">
            <span className="text-5xl font-bold text-white/80 drop-shadow-lg">
              {member.name.charAt(0)}
            </span>
          </div>
        )}
      </div>

      {/* Gradient overlay - always visible at bottom */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {/* Admin Actions */}
      {isAdmin && (
        <div className="absolute top-2 left-2 right-2 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
          {/* Drag Handle */}
          {dragHandleProps && (
            <button
              {...dragHandleProps.attributes}
              {...dragHandleProps.listeners}
              className="p-2 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg hover:bg-surface-2 transition-all duration-200 cursor-grab active:cursor-grabbing touch-none"
              title="גרור לשינוי סדר"
              aria-label="גרור לשינוי סדר הצגה"
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical size={16} className="text-gray-600" />
            </button>
          )}
          {!dragHandleProps && <div />}

          {/* Edit/Delete */}
          <div className="flex gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(member);
              }}
              className="p-2 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg hover:bg-primary hover:text-white transition-all duration-200 cursor-pointer"
              title="עריכה"
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(member);
              }}
              className="p-2 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg hover:bg-error hover:text-white transition-all duration-200 cursor-pointer"
              title="מחיקה"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Content Overlay */}
      <div
        className={`absolute bottom-0 left-0 right-0 p-4 transition-all duration-500 ease-out ${
          isExpanded ? "translate-y-0" : "translate-y-[calc(100%-4rem)]"
        }`}
      >
        {/* Glass backdrop for expanded content */}
        <div
          className={`absolute inset-0 bg-black/60 backdrop-blur-md rounded-t-2xl transition-opacity duration-300 ${
            isExpanded ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Content */}
        <div className="relative z-10">
          {/* Name - always visible */}
          <h3 className="font-rubik font-bold text-white text-lg mb-2 drop-shadow-lg">
            {member.name}
          </h3>

          {/* Description - revealed on expand */}
          <div
            className={`transition-all duration-500 ease-out ${
              isExpanded ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <p className="text-white/90 text-sm leading-relaxed overflow-y-auto max-h-36 scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent">
              {member.description}
            </p>
          </div>

          {/* Hint for interaction */}
          <div
            className={`flex items-center justify-center mt-2 transition-all duration-300 ${
              isExpanded ? "opacity-0 h-0" : "opacity-60 h-4"
            }`}
          >
            <div className="w-8 h-1 bg-white/50 rounded-full" />
          </div>
        </div>
      </div>

      {/* Shine effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
      </div>
    </div>
  );
}
