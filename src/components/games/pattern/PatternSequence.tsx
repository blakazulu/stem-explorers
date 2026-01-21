"use client";

interface PatternSequenceProps {
  sequence: string[];
  isRevealed: boolean;
  correctAnswer: string;
}

/**
 * Displays the pattern sequence with the last item as a question mark.
 * When revealed, shows the correct answer with green highlight.
 */
export function PatternSequence({
  sequence,
  isRevealed,
  correctAnswer,
}: PatternSequenceProps) {
  // Guard against empty sequence
  if (!sequence || sequence.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4" dir="rtl">
      {sequence.map((item, index) => {
        const isQuestionMark = item === "?";
        const showAnswer = isQuestionMark && isRevealed;

        return (
          <div
            key={index}
            className={`
              relative flex items-center justify-center
              w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18
              rounded-xl text-2xl sm:text-3xl font-bold
              transition-all duration-300
              ${
                showAnswer
                  ? "bg-emerald-100 text-emerald-700 border-3 border-emerald-400 scale-110"
                  : isQuestionMark
                  ? "bg-cyan-100 text-cyan-600 border-3 border-cyan-400 border-dashed animate-pulse"
                  : "bg-white text-gray-800 border-2 border-gray-200 shadow-sm"
              }
            `}
          >
            {showAnswer ? correctAnswer : item}
            {isQuestionMark && !isRevealed && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-cyan-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">?</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
