"use client";

interface ProblemDisplayProps {
  problem: string;
  isCorrect: boolean | null;
  showResult: boolean;
}

/**
 * Displays the math problem in a large, prominent format
 */
export function ProblemDisplay({
  problem,
  isCorrect,
  showResult,
}: ProblemDisplayProps) {
  return (
    <div className="relative">
      <div
        className={`
          p-6 sm:p-8 rounded-2xl text-center
          transition-all duration-300
          ${showResult
            ? isCorrect
              ? "bg-emerald-100 border-2 border-emerald-400"
              : "bg-red-100 border-2 border-red-400"
            : "bg-white/80 border-2 border-blue-200"
          }
        `}
      >
        <h2
          className={`
            text-3xl sm:text-4xl md:text-5xl font-bold font-rubik
            ${showResult
              ? isCorrect
                ? "text-emerald-700"
                : "text-red-700"
              : "text-gray-800"
            }
          `}
          dir="ltr"
        >
          {problem}
        </h2>
      </div>
    </div>
  );
}
