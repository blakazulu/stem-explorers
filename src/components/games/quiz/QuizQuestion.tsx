"use client";

import { useState, useEffect } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { QuizContent } from "@/types/games";

interface QuizQuestionProps {
  content: QuizContent;
  onAnswer: (isCorrect: boolean) => void;
  questionNumber: number;
}

type AnswerState = "unanswered" | "correct" | "incorrect";

/**
 * Single question display with answer options
 */
export function QuizQuestion({
  content,
  onAnswer,
  questionNumber,
}: QuizQuestionProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [answerState, setAnswerState] = useState<AnswerState>("unanswered");
  const [showExplanation, setShowExplanation] = useState(false);

  // Reset state when question changes
  useEffect(() => {
    setSelectedIndex(null);
    setAnswerState("unanswered");
    setShowExplanation(false);
  }, [content.id]);

  const handleOptionClick = (index: number) => {
    if (answerState !== "unanswered") return;

    setSelectedIndex(index);
    const isCorrect = index === content.correctIndex;
    setAnswerState(isCorrect ? "correct" : "incorrect");
    setShowExplanation(true);
  };

  const handleContinue = () => {
    const isCorrect = selectedIndex === content.correctIndex;
    onAnswer(isCorrect);
  };

  const getOptionStyle = (index: number) => {
    const baseStyle = `
      w-full p-4 rounded-xl border-2 text-right
      transition-all duration-300 ease-out
      font-medium text-lg
    `;

    if (answerState === "unanswered") {
      return `${baseStyle} border-gray-200 bg-white hover:border-amber-400 hover:bg-amber-50 cursor-pointer hover:scale-[1.02]`;
    }

    // After answer
    if (index === content.correctIndex) {
      // This is the correct answer
      return `${baseStyle} border-emerald-500 bg-emerald-50 text-emerald-800`;
    }

    if (index === selectedIndex && answerState === "incorrect") {
      // This is the wrong answer that was selected
      return `${baseStyle} border-red-500 bg-red-50 text-red-800`;
    }

    // Other options - disabled look
    return `${baseStyle} border-gray-200 bg-gray-50 text-gray-400`;
  };

  return (
    <div className="w-full">
      {/* Question */}
      <div className="mb-6">
        <div className="flex items-start gap-3 mb-4">
          <span className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-lg">
            {questionNumber}
          </span>
          <h2 className="text-xl sm:text-2xl font-rubik font-bold text-gray-800 leading-relaxed">
            {content.question}
          </h2>
        </div>
      </div>

      {/* Options grid - 2x2 on larger screens, stacked on mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {content.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleOptionClick(index)}
            disabled={answerState !== "unanswered"}
            className={getOptionStyle(index)}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="flex-1">{option}</span>
              {answerState !== "unanswered" && index === content.correctIndex && (
                <Check size={24} className="text-emerald-600 flex-shrink-0" />
              )}
              {answerState === "incorrect" && index === selectedIndex && (
                <X size={24} className="text-red-600 flex-shrink-0" />
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Feedback and explanation */}
      {showExplanation && (
        <div className="animate-fade-in">
          {/* Answer feedback */}
          <div
            className={`
              p-4 rounded-xl mb-4
              ${answerState === "correct"
                ? "bg-emerald-100 text-emerald-800 border-2 border-emerald-300"
                : "bg-red-100 text-red-800 border-2 border-red-300"
              }
            `}
          >
            <div className="flex items-center gap-2 mb-2">
              {answerState === "correct" ? (
                <>
                  <Check size={24} />
                  <span className="font-bold text-lg">נכון!</span>
                </>
              ) : (
                <>
                  <X size={24} />
                  <span className="font-bold text-lg">לא נכון</span>
                </>
              )}
            </div>
            <p className="text-base">{content.explanation}</p>
          </div>

          {/* Continue button */}
          <div className="flex justify-center">
            <Button
              onClick={handleContinue}
              variant="primary"
              className="bg-amber-500 hover:bg-amber-600 text-lg px-8 py-3"
            >
              המשך
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
