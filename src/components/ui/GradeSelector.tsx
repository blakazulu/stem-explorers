"use client";

import type { Grade } from "@/types";

const grades: Grade[] = ["א", "ב", "ג", "ד", "ה", "ו"];

interface GradeSelectorProps {
  selected: Grade | null;
  onSelect: (grade: Grade) => void;
  disabled?: boolean;
}

export function GradeSelector({ selected, onSelect, disabled }: GradeSelectorProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      {grades.map((grade) => (
        <button
          key={grade}
          onClick={() => onSelect(grade)}
          disabled={disabled}
          className={`w-12 h-12 rounded-lg font-rubik font-bold text-lg transition-all duration-200 cursor-pointer ${
            selected === grade
              ? "bg-primary text-white"
              : "bg-white border-2 border-gray-200 text-foreground hover:border-primary hover:text-primary"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {grade}
        </button>
      ))}
    </div>
  );
}
