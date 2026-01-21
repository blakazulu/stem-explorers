"use client";

import { Trash2, Plus, X } from "lucide-react";
import type { PatternContent } from "@/types/games";

interface PatternContentEditorProps {
  content: PatternContent;
  onEdit: (updates: Partial<PatternContent>) => void;
  onDelete: () => void;
  isNew: boolean;
}

export function PatternContentEditor({
  content,
  onEdit,
  onDelete,
  isNew,
}: PatternContentEditorProps) {
  // Handle sequence item change
  const handleSequenceChange = (index: number, value: string) => {
    const newSequence = [...content.sequence];
    newSequence[index] = value;
    onEdit({ sequence: newSequence });
  };

  // Handle adding a new sequence item
  const handleAddSequenceItem = () => {
    if (content.sequence.length >= 8) return; // Max 8 items
    // Insert before the "?" if it exists at the end
    const lastIndex = content.sequence.length - 1;
    if (content.sequence[lastIndex] === "?") {
      const newSequence = [
        ...content.sequence.slice(0, lastIndex),
        "",
        "?",
      ];
      onEdit({ sequence: newSequence });
    } else {
      onEdit({ sequence: [...content.sequence, ""] });
    }
  };

  // Handle removing a sequence item
  const handleRemoveSequenceItem = (index: number) => {
    if (content.sequence.length <= 3) return; // Minimum 3 items (2 + ?)
    const newSequence = content.sequence.filter((_, i) => i !== index);
    onEdit({ sequence: newSequence });
  };

  // Handle setting an item as the question mark
  const handleSetQuestionMark = (index: number) => {
    const newSequence = content.sequence.map((item, i) => {
      if (i === index) return "?";
      if (item === "?") return ""; // Clear the previous question mark
      return item;
    });
    onEdit({ sequence: newSequence });
  };

  // Handle option change
  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...content.options];
    newOptions[index] = value;
    onEdit({ options: newOptions });
  };

  // Handle correct index change
  const handleCorrectIndexChange = (index: number) => {
    onEdit({ correctIndex: index });
  };

  // Handle rule change
  const handleRuleChange = (value: string) => {
    onEdit({ rule: value });
  };

  // Check if sequence has a question mark
  const hasQuestionMark = content.sequence.includes("?");

  return (
    <div
      className={`
        p-4 rounded-xl border-2
        ${isNew ? "border-indigo-300 bg-indigo-50/30" : "border-gray-200 bg-white"}
      `}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-4">
          {/* Sequence section */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              רצף התבנית ({content.sequence.length} פריטים):
            </label>
            <div className="flex flex-wrap gap-2">
              {content.sequence.map((item, index) => (
                <div key={index} className="flex items-center gap-1">
                  <div className="relative">
                    <input
                      type="text"
                      value={item === "?" ? "" : item}
                      onChange={(e) => handleSequenceChange(index, e.target.value)}
                      placeholder={item === "?" ? "?" : `#${index + 1}`}
                      disabled={item === "?"}
                      className={`
                        w-16 h-12 px-2 text-center text-lg font-bold
                        border rounded-lg
                        focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                        ${item === "?"
                          ? "bg-cyan-100 border-cyan-400 text-cyan-600"
                          : "border-gray-200 text-gray-800 placeholder-gray-400"
                        }
                      `}
                      dir="ltr"
                    />
                    {item !== "?" && (
                      <button
                        onClick={() => handleSetQuestionMark(index)}
                        className="absolute -top-2 -left-2 w-5 h-5 bg-cyan-500 text-white rounded-full text-xs font-bold hover:bg-cyan-600 transition-colors"
                        title="הגדר כמקום החסר"
                      >
                        ?
                      </button>
                    )}
                  </div>
                  {content.sequence.length > 3 && item !== "?" && (
                    <button
                      onClick={() => handleRemoveSequenceItem(index)}
                      className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                      title="הסר פריט"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
              {content.sequence.length < 8 && (
                <button
                  onClick={handleAddSequenceItem}
                  className="w-12 h-12 border-2 border-dashed border-gray-300 rounded-lg text-gray-400 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all duration-150 flex items-center justify-center"
                  title="הוסף פריט"
                >
                  <Plus size={16} />
                </button>
              )}
            </div>
            {!hasQuestionMark && (
              <p className="text-xs text-amber-600 mt-1">
                לחץ על ? בפריט כדי להגדיר אותו כמקום החסר
              </p>
            )}
          </div>

          {/* Options section */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              אפשרויות תשובה (4):
            </label>
            <div className="grid grid-cols-2 gap-2">
              {content.options.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`correct-${content.id}`}
                    checked={content.correctIndex === index}
                    onChange={() => handleCorrectIndexChange(index)}
                    className="w-4 h-4 text-emerald-600 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`אפשרות ${index + 1}`}
                    className={`
                      flex-1 px-3 py-2 border rounded-lg text-sm font-medium
                      focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                      ${content.correctIndex === index
                        ? "border-emerald-400 bg-emerald-50 text-emerald-800"
                        : "border-gray-200 text-gray-800 placeholder-gray-400"
                      }
                    `}
                    dir="rtl"
                  />
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              בחר את התשובה הנכונה על ידי לחיצה על העיגול
            </p>
          </div>

          {/* Rule section */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              הסבר הכלל:
            </label>
            <textarea
              value={content.rule}
              onChange={(e) => handleRuleChange(e.target.value)}
              placeholder="תאר את הכלל של התבנית (למשל: מתחלף בין צורות)"
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              dir="rtl"
            />
          </div>
        </div>

        {/* Delete button */}
        <button
          onClick={onDelete}
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          title="מחק תבנית"
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
