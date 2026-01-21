"use client";

import { Trash2, Plus, X } from "lucide-react";
import type { WordSearchContent } from "@/types/games";

interface WordSearchContentEditorProps {
  content: WordSearchContent;
  onEdit: (updates: Partial<WordSearchContent>) => void;
  onDelete: () => void;
  isNew: boolean;
}

const GRID_SIZES = [8, 10, 12];
const DIRECTION_OPTIONS: { value: "horizontal" | "vertical" | "diagonal"; label: string }[] = [
  { value: "horizontal", label: "אופקי" },
  { value: "vertical", label: "אנכי" },
  { value: "diagonal", label: "אלכסוני" },
];

export function WordSearchContentEditor({
  content,
  onEdit,
  onDelete,
  isNew,
}: WordSearchContentEditorProps) {
  const handleWordChange = (index: number, value: string) => {
    const newWords = [...content.words];
    newWords[index] = value;
    onEdit({ words: newWords });
  };

  const handleAddWord = () => {
    onEdit({ words: [...content.words, ""] });
  };

  const handleRemoveWord = (index: number) => {
    if (content.words.length <= 1) return;
    const newWords = content.words.filter((_, i) => i !== index);
    onEdit({ words: newWords });
  };

  const handleDirectionToggle = (direction: "horizontal" | "vertical" | "diagonal") => {
    const hasDirection = content.directions.includes(direction);
    if (hasDirection && content.directions.length <= 1) return; // Must have at least one

    const newDirections = hasDirection
      ? content.directions.filter((d) => d !== direction)
      : [...content.directions, direction];
    onEdit({ directions: newDirections });
  };

  return (
    <div
      className={`
        p-4 rounded-xl border-2
        ${isNew ? "border-indigo-300 bg-indigo-50/30" : "border-gray-200 bg-white"}
      `}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-4">
          {/* Grid size and directions */}
          <div className="flex flex-wrap items-center gap-6">
            {/* Grid size */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-600">גודל לוח:</label>
              <div className="flex gap-1">
                {GRID_SIZES.map((size) => (
                  <button
                    key={size}
                    onClick={() => onEdit({ gridSize: size })}
                    className={`
                      px-3 py-1 rounded-lg text-sm font-medium
                      transition-all duration-150
                      ${content.gridSize === size
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }
                    `}
                  >
                    {size}×{size}
                  </button>
                ))}
              </div>
            </div>

            {/* Directions */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-600">כיוונים:</label>
              <div className="flex gap-1">
                {DIRECTION_OPTIONS.map((dir) => (
                  <button
                    key={dir.value}
                    onClick={() => handleDirectionToggle(dir.value)}
                    className={`
                      px-3 py-1 rounded-lg text-sm font-medium
                      transition-all duration-150
                      ${content.directions.includes(dir.value)
                        ? "bg-emerald-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }
                    `}
                  >
                    {dir.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Words list */}
          <div>
            <label className="text-sm font-medium text-gray-600 mb-2 block">
              מילים ({content.words.filter((w) => w.trim()).length}):
            </label>
            <div className="flex flex-wrap gap-2">
              {content.words.map((word, index) => (
                <div key={index} className="flex items-center gap-1">
                  <input
                    type="text"
                    value={word}
                    onChange={(e) => handleWordChange(index, e.target.value)}
                    placeholder={`מילה ${index + 1}`}
                    className="w-28 px-2 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    dir="rtl"
                  />
                  {content.words.length > 1 && (
                    <button
                      onClick={() => handleRemoveWord(index)}
                      className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={handleAddWord}
                className="flex items-center gap-1 px-2 py-1.5 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              >
                <Plus size={14} />
                הוסף
              </button>
            </div>
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
