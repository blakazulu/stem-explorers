"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

interface SortableItemProps {
  id: string;
  text: string;
  isCorrect?: boolean;
  isWrong?: boolean;
  disabled?: boolean;
}

/**
 * Draggable item component for the Sort game.
 * Uses @dnd-kit/core for drag functionality.
 */
export function SortableItem({
  id,
  text,
  isCorrect = false,
  isWrong = false,
  disabled = false,
}: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id,
      disabled,
    });

  const style = transform
    ? {
        transform: CSS.Translate.toString(transform),
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`
        inline-flex items-center gap-2 px-4 py-2.5 rounded-xl
        font-medium text-sm select-none
        transition-all duration-200
        ${
          isDragging
            ? "bg-violet-200 text-violet-800 shadow-lg scale-105 z-50 opacity-90"
            : isCorrect
            ? "bg-emerald-100 text-emerald-700 border-2 border-emerald-400"
            : isWrong
            ? "bg-red-100 text-red-700 border-2 border-red-400 animate-shake"
            : "bg-white text-gray-700 border-2 border-gray-200 shadow-sm hover:shadow-md hover:border-violet-300"
        }
        ${
          disabled
            ? "cursor-not-allowed opacity-60"
            : "cursor-grab active:cursor-grabbing"
        }
      `}
      dir="rtl"
    >
      {!disabled && !isCorrect && (
        <GripVertical size={16} className="text-gray-400 flex-shrink-0" />
      )}
      <span>{text}</span>
      {isCorrect && <span className="mr-1 text-emerald-600">&#10003;</span>}
    </div>
  );
}
