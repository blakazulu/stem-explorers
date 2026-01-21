"use client";

import { Trash2, Plus, X } from "lucide-react";
import type { NumberPatternContent } from "@/types/games";

interface NumberPatternContentEditorProps {
  content: NumberPatternContent;
  onEdit: (updates: Partial<NumberPatternContent>) => void;
  onDelete: () => void;
  isNew: boolean;
}

export function NumberPatternContentEditor({
  content,
  onEdit,
  onDelete,
  isNew,
}: NumberPatternContentEditorProps) {
  // Find the index of the missing number (null value)
  const missingIndex = content.sequence.findIndex((n) => n === null);

  // Handle sequence number change
  const handleNumberChange = (index: number, value: string) => {
    const newSequence = [...content.sequence];
    if (value === "" || value === "-") {
      // Keep as empty/partial input during editing, but don't save null
      newSequence[index] = index === missingIndex ? null : 0;
    } else {
      const num = parseInt(value, 10);
      if (!isNaN(num)) {
        newSequence[index] = num;
      }
    }
    onEdit({ sequence: newSequence });
  };

  // Handle setting which number is missing
  const handleSetMissing = (index: number) => {
    const newSequence = content.sequence.map((n, i) => {
      if (i === index) return null;
      if (n === null) return content.answer; // Restore the previously missing number
      return n;
    });
    onEdit({ sequence: newSequence });
  };

  // Add number to sequence
  const handleAddNumber = () => {
    const newSequence = [...content.sequence, 0];
    onEdit({ sequence: newSequence });
  };

  // Remove number from sequence
  const handleRemoveNumber = (index: number) => {
    if (content.sequence.length <= 3) return; // Minimum 3 numbers
    const newSequence = content.sequence.filter((_, i) => i !== index);
    // If we removed the missing number, set the last one as missing
    if (index === missingIndex) {
      newSequence[newSequence.length - 1] = null;
    }
    onEdit({ sequence: newSequence });
  };

  return (
    <div
      className={`
        p-4 rounded-xl border-2
        ${isNew ? "border-orange-300 bg-orange-50/30" : "border-gray-200 bg-white"}
      `}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-4">
          {/* Sequence editor */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              סדרת המספרים:
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {content.sequence.map((num, index) => (
                <div key={index} className="relative group">
                  <input
                    type="text"
                    value={num === null ? "" : num.toString()}
                    onChange={(e) => handleNumberChange(index, e.target.value)}
                    placeholder={num === null ? "?" : "0"}
                    className={`
                      w-14 h-12 text-center font-bold text-lg
                      border-2 rounded-lg
                      focus:outline-none focus:ring-2 focus:ring-orange-400
                      ${num === null
                        ? "border-orange-400 bg-orange-100 text-orange-700"
                        : "border-gray-200 bg-white text-gray-800"
                      }
                    `}
                    dir="ltr"
                  />
                  {/* Set as missing button */}
                  {num !== null && (
                    <button
                      onClick={() => handleSetMissing(index)}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-orange-500 text-white rounded-full text-xs hover:bg-orange-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="הגדר כמספר החסר"
                    >
                      ?
                    </button>
                  )}
                  {/* Remove button */}
                  {content.sequence.length > 3 && (
                    <button
                      onClick={() => handleRemoveNumber(index)}
                      className="absolute -bottom-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      title="הסר מספר"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              ))}
              {/* Add number button */}
              {content.sequence.length < 8 && (
                <button
                  onClick={handleAddNumber}
                  className="w-12 h-12 border-2 border-dashed border-gray-300 rounded-lg text-gray-400 hover:border-orange-400 hover:text-orange-600 transition-colors flex items-center justify-center"
                  title="הוסף מספר"
                >
                  <Plus size={20} />
                </button>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              לחץ על ? כדי לקבוע איזה מספר יהיה חסר. מינימום 3 מספרים, מקסימום 8.
            </p>
          </div>

          {/* Answer */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-600 mb-1">
                התשובה הנכונה:
              </label>
              <input
                type="text"
                value={content.answer.toString()}
                onChange={(e) => {
                  const num = parseInt(e.target.value, 10);
                  if (!isNaN(num)) {
                    onEdit({ answer: num });
                  }
                }}
                placeholder="0"
                className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-gray-800 text-center font-bold focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                dir="ltr"
              />
            </div>
          </div>

          {/* Rule description */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              הכלל (הסבר התבנית):
            </label>
            <input
              type="text"
              value={content.rule}
              onChange={(e) => onEdit({ rule: e.target.value })}
              placeholder="לדוגמה: כל מספר גדל ב-2"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
        <div className="mt-3 text-xs text-orange-600 font-medium">
          פריט חדש - יישמר כשתלחץ על &quot;שמור שינויים&quot;
        </div>
      )}
    </div>
  );
}
