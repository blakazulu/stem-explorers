"use client";

import { Trash2 } from "lucide-react";
import type { HangmanContent } from "@/types/games";

interface HangmanContentEditorProps {
  content: HangmanContent;
  onEdit: (updates: Partial<HangmanContent>) => void;
  onDelete: () => void;
  isNew: boolean;
}

export function HangmanContentEditor({
  content,
  onEdit,
  onDelete,
  isNew,
}: HangmanContentEditorProps) {
  return (
    <div
      className={`
        p-4 rounded-xl border-2
        ${isNew ? "border-indigo-300 bg-indigo-50/30" : "border-gray-200 bg-white"}
      `}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-3">
          {/* Word */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-600 w-16">מילה:</label>
            <input
              type="text"
              value={content.word}
              onChange={(e) => onEdit({ word: e.target.value })}
              placeholder="הקלד מילה..."
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              dir="rtl"
            />
          </div>

          {/* Hint */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-600 w-16">רמז:</label>
            <input
              type="text"
              value={content.hint}
              onChange={(e) => onEdit({ hint: e.target.value })}
              placeholder="הקלד רמז..."
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              dir="rtl"
            />
          </div>

          {/* Category */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-600 w-16">קטגוריה:</label>
            <input
              type="text"
              value={content.category}
              onChange={(e) => onEdit({ category: e.target.value })}
              placeholder="הקלד קטגוריה..."
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              dir="rtl"
            />
          </div>
        </div>

        {/* Delete button */}
        <button
          onClick={onDelete}
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          title="מחק"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {isNew && (
        <div className="mt-3 text-xs text-indigo-600 font-medium">
          ✨ פריט חדש - יישמר כשתלחץ על &quot;שמור שינויים&quot;
        </div>
      )}
    </div>
  );
}
