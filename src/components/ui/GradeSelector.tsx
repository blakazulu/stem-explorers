"use client";

import { GraduationCap } from "lucide-react";
import type { Grade } from "@/types";

const grades: Grade[] = ["א", "ב", "ג", "ד", "ה", "ו"];

// Hebrew grade to number mapping for visual display
const gradeNumbers: Record<Grade, string> = {
  "א": "1",
  "ב": "2",
  "ג": "3",
  "ד": "4",
  "ה": "5",
  "ו": "6",
};

interface GradeSelectorProps {
  selected: Grade | null;
  onSelect: (grade: Grade) => void;
  disabled?: boolean;
  showLabel?: boolean;
}

export function GradeSelector({
  selected,
  onSelect,
  disabled,
  showLabel = true,
}: GradeSelectorProps) {
  return (
    <div className="space-y-3">
      {showLabel && (
        <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
          <GraduationCap size={16} className="text-primary" />
          <span>בחר כיתה</span>
        </div>
      )}
      <div className="flex gap-2 flex-wrap">
        {grades.map((grade) => {
          const isSelected = selected === grade;
          return (
            <button
              key={grade}
              onClick={() => onSelect(grade)}
              disabled={disabled}
              className={`group relative w-14 h-14 rounded-xl font-rubik font-bold text-xl transition-all duration-200 cursor-pointer ${
                isSelected
                  ? "bg-primary text-white shadow-lg shadow-primary/30 scale-105 ring-2 ring-primary ring-offset-2"
                  : "bg-surface-0 border-2 border-surface-3 text-foreground hover:border-primary hover:text-primary hover:bg-primary/5 hover:scale-105"
              } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
            >
              {/* Grade letter */}
              <span className="relative z-10">{grade}</span>

              {/* Subtle number indicator */}
              <span
                className={`absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] font-normal transition-opacity duration-200 ${
                  isSelected
                    ? "text-white/70"
                    : "text-gray-400 group-hover:text-primary/50"
                }`}
              >
                {gradeNumbers[grade]}
              </span>

              {/* Hover glow effect */}
              {!disabled && !isSelected && (
                <span className="absolute inset-0 rounded-xl bg-primary/0 group-hover:bg-primary/5 transition-colors duration-200" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
