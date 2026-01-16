"use client";

import { useState, useEffect } from "react";
import { Edit2, Trash2 } from "lucide-react";
import type { StaffMember } from "@/types";

interface StaffMemberCardProps {
  member: StaffMember;
  isAdmin?: boolean;
  onEdit?: (member: StaffMember) => void;
  onDelete?: (member: StaffMember) => void;
}

export function StaffMemberCard({
  member,
  isAdmin = false,
  onEdit,
  onDelete,
}: StaffMemberCardProps) {
  const [imageError, setImageError] = useState(false);

  // Reset error state when image URL changes
  useEffect(() => {
    setImageError(false);
  }, [member.imageUrl]);

  return (
    <div className="group relative flex flex-col items-center text-center p-4 rounded-2xl bg-surface-0 border border-surface-2 hover:border-primary/30 hover:shadow-lg transition-all duration-300">
      {/* Admin Actions */}
      {isAdmin && (
        <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={() => onEdit?.(member)}
            className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg shadow-md hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
            title="עריכה"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => onDelete?.(member)}
            className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg shadow-md hover:bg-error/10 hover:text-error transition-colors cursor-pointer"
            title="מחיקה"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}

      {/* Profile Image */}
      <div className="relative mb-4">
        {/* Decorative ring */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary via-secondary to-accent opacity-20 blur-sm scale-110 group-hover:opacity-40 group-hover:scale-115 transition-all duration-300" />

        {/* Image container */}
        <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-4 border-white shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
          {!imageError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={member.imageUrl}
              alt={member.name}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
              <span className="text-3xl font-bold text-primary/60">
                {member.name.charAt(0)}
              </span>
            </div>
          )}
        </div>

        {/* Sparkle decoration */}
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-bounce transition-opacity duration-300" />
      </div>

      {/* Name */}
      <h3 className="font-rubik font-bold text-foreground text-lg mb-2 group-hover:text-primary transition-colors duration-300">
        {member.name}
      </h3>

      {/* Description */}
      <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">
        {member.description}
      </p>
    </div>
  );
}
