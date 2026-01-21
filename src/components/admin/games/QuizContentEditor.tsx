"use client";

import { Trash2 } from "lucide-react";
import type { QuizContent } from "@/types/games";

interface QuizContentEditorProps {
  content: QuizContent;
  onEdit: (updates: Partial<QuizContent>) => void;
  onDelete: () => void;
  isNew: boolean;
}

export function QuizContentEditor({
  content,
  onEdit,
  onDelete,
  isNew,
}: QuizContentEditorProps) {
  // Handle option text change
  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...content.options];
    newOptions[index] = value;
    onEdit({ options: newOptions });
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
          {/* Question */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              שאלה:
            </label>
            <textarea
              value={content.question}
              onChange={(e) => onEdit({ question: e.target.value })}
              placeholder="הקלד את השאלה..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              dir="rtl"
            />
          </div>

          {/* Options */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              אפשרויות תשובה:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[0, 1, 2, 3].map((index) => (
                <div key={index} className="relative">
                  <input
                    type="text"
                    value={content.options[index] || ""}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`אפשרות ${index + 1}`}
                    className={`
                      w-full px-3 py-2 border rounded-lg text-gray-800 placeholder-gray-400
                      focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                      ${content.correctIndex === index
                        ? "border-emerald-400 bg-emerald-50"
                        : "border-gray-200"
                      }
                    `}
                    dir="rtl"
                  />
                  {content.correctIndex === index && (
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-emerald-600 font-medium">
                      נכון
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Correct answer selector */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-600">
              תשובה נכונה:
            </label>
            <select
              value={content.correctIndex}
              onChange={(e) => onEdit({ correctIndex: parseInt(e.target.value, 10) })}
              className="px-3 py-2 border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
              dir="rtl"
            >
              {[0, 1, 2, 3].map((index) => (
                <option key={index} value={index}>
                  אפשרות {index + 1}
                </option>
              ))}
            </select>
          </div>

          {/* Explanation */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              הסבר:
            </label>
            <textarea
              value={content.explanation}
              onChange={(e) => onEdit({ explanation: e.target.value })}
              placeholder="הסבר שיוצג לאחר התשובה..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
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
          פריט חדש - יישמר כשתלחץ על &quot;שמור שינויים&quot;
        </div>
      )}
    </div>
  );
}
