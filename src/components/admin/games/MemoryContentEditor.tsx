"use client";

import { Trash2, Plus, X, ArrowLeftRight } from "lucide-react";
import type { MemoryContent, MemoryPair } from "@/types/games";

interface MemoryContentEditorProps {
  content: MemoryContent;
  onEdit: (updates: Partial<MemoryContent>) => void;
  onDelete: () => void;
  isNew: boolean;
}

export function MemoryContentEditor({
  content,
  onEdit,
  onDelete,
  isNew,
}: MemoryContentEditorProps) {
  const handlePairChange = (index: number, field: keyof MemoryPair, value: string) => {
    const newPairs = content.pairs.map((pair, i) =>
      i === index ? { ...pair, [field]: value } : pair
    );
    onEdit({ pairs: newPairs });
  };

  const handleAddPair = () => {
    onEdit({ pairs: [...content.pairs, { term: "", match: "" }] });
  };

  const handleRemovePair = (index: number) => {
    if (content.pairs.length <= 1) return;
    const newPairs = content.pairs.filter((_, i) => i !== index);
    onEdit({ pairs: newPairs });
  };

  return (
    <div
      className={`
        p-4 rounded-xl border-2
        ${isNew ? "border-indigo-300 bg-indigo-50/30" : "border-gray-200 bg-white"}
      `}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-600">
              זוגות ({content.pairs.filter((p) => p.term.trim() && p.match.trim()).length}):
            </span>
          </div>

          {/* Pairs list */}
          <div className="space-y-2">
            {content.pairs.map((pair, index) => (
              <div key={index} className="flex items-center gap-2">
                {/* Term */}
                <input
                  type="text"
                  value={pair.term}
                  onChange={(e) => handlePairChange(index, "term", e.target.value)}
                  placeholder="מושג"
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  dir="rtl"
                />

                {/* Arrow indicator */}
                <ArrowLeftRight size={16} className="text-gray-400 flex-shrink-0" />

                {/* Match */}
                <input
                  type="text"
                  value={pair.match}
                  onChange={(e) => handlePairChange(index, "match", e.target.value)}
                  placeholder="התאמה"
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  dir="rtl"
                />

                {/* Remove pair */}
                {content.pairs.length > 1 && (
                  <button
                    onClick={() => handleRemovePair(index)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors flex-shrink-0"
                    title="הסר זוג"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}

            {/* Add pair button */}
            <button
              onClick={handleAddPair}
              className="w-full py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all duration-150 flex items-center justify-center gap-1"
            >
              <Plus size={14} />
              הוסף זוג
            </button>
          </div>
        </div>

        {/* Delete button */}
        <button
          onClick={onDelete}
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          title="מחק סט"
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
