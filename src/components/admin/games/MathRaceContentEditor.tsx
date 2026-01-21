"use client";

import { Trash2 } from "lucide-react";
import type { MathRaceContent } from "@/types/games";

interface MathRaceContentEditorProps {
  content: MathRaceContent;
  onEdit: (updates: Partial<MathRaceContent>) => void;
  onDelete: () => void;
  isNew: boolean;
}

export function MathRaceContentEditor({
  content,
  onEdit,
  onDelete,
  isNew,
}: MathRaceContentEditorProps) {
  // Handle option change
  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...content.options];
    const num = parseInt(value, 10);
    if (!isNaN(num)) {
      newOptions[index] = num;
      onEdit({ options: newOptions });
    } else if (value === "" || value === "-") {
      // Allow empty for editing
      newOptions[index] = 0;
      onEdit({ options: newOptions });
    }
  };

  // Handle answer change - update both answer and ensure it's in options
  const handleAnswerChange = (value: string) => {
    const num = parseInt(value, 10);
    if (!isNaN(num)) {
      // Update answer
      onEdit({ answer: num });
      // Also update options[0] to match (correct answer is typically first, then shuffled)
      const newOptions = [...content.options];
      newOptions[0] = num;
      onEdit({ answer: num, options: newOptions });
    }
  };

  return (
    <div
      className={`
        p-4 rounded-xl border-2
        ${isNew ? "border-blue-300 bg-blue-50/30" : "border-gray-200 bg-white"}
      `}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-4">
          {/* Problem input */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              התרגיל (כולל סימן שאלה):
            </label>
            <input
              type="text"
              value={content.problem}
              onChange={(e) => onEdit({ problem: e.target.value })}
              placeholder="לדוגמה: 5 + 3 = ?"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              dir="ltr"
            />
            <p className="text-xs text-gray-500 mt-1">
              כתוב את התרגיל עם סימן שאלה במקום התשובה
            </p>
          </div>

          {/* Answer input */}
          <div className="flex items-center gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                התשובה הנכונה:
              </label>
              <input
                type="text"
                value={content.answer.toString()}
                onChange={(e) => handleAnswerChange(e.target.value)}
                placeholder="0"
                className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-gray-800 text-center font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                dir="ltr"
              />
            </div>
          </div>

          {/* Options input */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              אפשרויות תשובה (4 אפשרויות):
            </label>
            <div className="grid grid-cols-4 gap-2">
              {content.options.map((option, index) => (
                <div key={index} className="relative">
                  <input
                    type="text"
                    value={option.toString()}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder="0"
                    className={`
                      w-full px-3 py-2 border rounded-lg text-center font-bold
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                      ${option === content.answer
                        ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                        : "border-gray-200 text-gray-800"
                      }
                    `}
                    dir="ltr"
                  />
                  {option === content.answer && (
                    <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                      נכון
                    </span>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              ודא שאחת האפשרויות זהה לתשובה הנכונה. האפשרויות יערבבו אוטומטית במשחק.
            </p>
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
        <div className="mt-3 text-xs text-blue-600 font-medium">
          פריט חדש - יישמר כשתלחץ על &quot;שמור שינויים&quot;
        </div>
      )}
    </div>
  );
}
