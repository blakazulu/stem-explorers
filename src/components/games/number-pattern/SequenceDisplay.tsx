"use client";

interface SequenceDisplayProps {
  sequence: (number | null)[];
  userAnswer: string;
  isCorrect: boolean | null;
  showResult: boolean;
}

/**
 * Displays the number sequence with the missing number highlighted.
 * Shows the user's answer or a placeholder "?" for the missing number.
 */
export function SequenceDisplay({
  sequence,
  userAnswer,
  isCorrect,
  showResult,
}: SequenceDisplayProps) {
  return (
    <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
      {sequence.map((num, index) => {
        const isMissing = num === null;

        return (
          <div
            key={index}
            className={`
              w-14 h-14 sm:w-16 sm:h-16
              flex items-center justify-center
              rounded-xl font-bold text-xl sm:text-2xl
              transition-all duration-300
              ${isMissing
                ? showResult
                  ? isCorrect
                    ? "bg-emerald-100 border-2 border-emerald-400 text-emerald-700"
                    : "bg-red-100 border-2 border-red-400 text-red-700"
                  : "bg-blue-100 border-2 border-blue-400 text-blue-700 animate-pulse"
                : "bg-gray-100 border-2 border-gray-300 text-gray-700"
              }
            `}
          >
            {isMissing ? (
              showResult ? (
                userAnswer || "?"
              ) : (
                "?"
              )
            ) : (
              num
            )}
          </div>
        );
      })}
    </div>
  );
}
