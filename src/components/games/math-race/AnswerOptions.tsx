"use client";

import { Check, X } from "lucide-react";

interface AnswerOptionsProps {
  options: number[];
  correctAnswer: number;
  selectedAnswer: number | null;
  onSelect: (answer: number) => void;
  disabled: boolean;
  showResult: boolean;
}

/**
 * Grid of 4 clickable answer buttons for the math race game
 */
export function AnswerOptions({
  options,
  correctAnswer,
  selectedAnswer,
  onSelect,
  disabled,
  showResult,
}: AnswerOptionsProps) {
  const getButtonStyle = (option: number) => {
    const baseStyle = `
      w-full p-4 sm:p-6 rounded-xl border-2
      text-2xl sm:text-3xl font-bold
      transition-all duration-200
      flex items-center justify-center gap-2
    `;

    if (!showResult) {
      // Normal state
      return `${baseStyle} border-blue-200 bg-white hover:border-blue-400 hover:bg-blue-50 cursor-pointer hover:scale-105 text-gray-800`;
    }

    // After answer
    if (option === correctAnswer) {
      // Correct answer
      return `${baseStyle} border-emerald-500 bg-emerald-100 text-emerald-800`;
    }

    if (option === selectedAnswer && selectedAnswer !== correctAnswer) {
      // Wrong answer that was selected
      return `${baseStyle} border-red-500 bg-red-100 text-red-800`;
    }

    // Other options
    return `${baseStyle} border-gray-200 bg-gray-50 text-gray-400`;
  };

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4">
      {options.map((option, index) => (
        <button
          key={index}
          onClick={() => !disabled && onSelect(option)}
          disabled={disabled}
          className={getButtonStyle(option)}
          dir="ltr"
        >
          <span>{option}</span>
          {showResult && option === correctAnswer && (
            <Check size={24} className="text-emerald-600 flex-shrink-0" />
          )}
          {showResult && option === selectedAnswer && option !== correctAnswer && (
            <X size={24} className="text-red-600 flex-shrink-0" />
          )}
        </button>
      ))}
    </div>
  );
}
