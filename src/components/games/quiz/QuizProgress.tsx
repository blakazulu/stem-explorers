"use client";

interface QuizProgressProps {
  currentQuestion: number;
  totalQuestions: number;
  score: number;
}

/**
 * Progress bar showing question count and current score
 */
export function QuizProgress({
  currentQuestion,
  totalQuestions,
  score,
}: QuizProgressProps) {
  const percentage = (currentQuestion / totalQuestions) * 100;

  return (
    <div className="w-full mb-6">
      {/* Progress info */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600">
            שאלה {currentQuestion} מתוך {totalQuestions}
          </span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-700 rounded-lg">
          <span className="text-sm font-medium">
            ניקוד: <span className="font-bold">{score}</span>
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-3 bg-amber-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-l from-amber-500 to-yellow-400 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
