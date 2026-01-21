"use client";

import { useDroppable } from "@dnd-kit/core";
import { BoxSelect } from "lucide-react";

interface SortBucketProps {
  id: string;
  name: string;
  children?: React.ReactNode;
  isOver?: boolean;
  itemCount: number;
}

/**
 * Drop zone bucket component for the Sort game.
 * Items can be dragged into this bucket for classification.
 */
export function SortBucket({
  id,
  name,
  children,
  itemCount,
}: SortBucketProps) {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`
        flex flex-col rounded-2xl border-3 border-dashed p-4 min-h-[180px]
        transition-all duration-200
        ${
          isOver
            ? "border-violet-500 bg-violet-100/50 scale-[1.02]"
            : "border-violet-300 bg-violet-50/30"
        }
      `}
      dir="rtl"
    >
      {/* Bucket header */}
      <div className="flex items-center justify-center gap-2 mb-3 pb-2 border-b border-violet-200">
        <BoxSelect size={20} className="text-violet-500" />
        <h3 className="font-rubik font-bold text-violet-700 text-lg">{name}</h3>
        <span className="text-xs text-violet-500 bg-violet-100 px-2 py-0.5 rounded-full">
          {itemCount}
        </span>
      </div>

      {/* Bucket content area */}
      <div className="flex-1 flex flex-wrap gap-2 content-start min-h-[100px]">
        {children}
        {itemCount === 0 && (
          <div className="w-full h-full flex items-center justify-center text-violet-400 text-sm">
            {isOver ? "שחרר כאן" : "גרור פריטים לכאן"}
          </div>
        )}
      </div>
    </div>
  );
}
