"use client";

interface PatternOptionsProps {
  options: string[];
  correctIndex: number;
  selectedIndex: number | null;
  isRevealed: boolean;
  onSelect: (index: number) => void;
}

/**
 * Displays the 4 answer options for the pattern game.
 * Shows correct/wrong highlighting after selection.
 */
export function PatternOptions({
  options,
  correctIndex,
  selectedIndex,
  isRevealed,
  onSelect,
}: PatternOptionsProps) {
  // Guard against empty options
  if (!options || options.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-md mx-auto" dir="rtl">
      {options.map((option, index) => {
        const isSelected = selectedIndex === index;
        const isCorrect = index === correctIndex;
        const showCorrect = isRevealed && isCorrect;
        const showWrong = isRevealed && isSelected && !isCorrect;

        return (
          <button
            key={index}
            onClick={() => !isRevealed && onSelect(index)}
            disabled={isRevealed}
            className={`
              relative flex items-center justify-center
              py-4 px-6 rounded-xl text-xl sm:text-2xl font-bold
              transition-all duration-300 cursor-pointer
              ${
                showCorrect
                  ? "bg-emerald-100 text-emerald-700 border-3 border-emerald-500 scale-105"
                  : showWrong
                  ? "bg-red-100 text-red-700 border-3 border-red-500 scale-95 opacity-80"
                  : isRevealed
                  ? "bg-gray-100 text-gray-500 border-2 border-gray-200"
                  : "bg-white text-gray-800 border-2 border-gray-200 shadow-sm hover:shadow-md hover:border-cyan-400 hover:scale-105 active:scale-95"
              }
              ${isRevealed ? "cursor-not-allowed" : ""}
            `}
          >
            {option}
            {showCorrect && (
              <span className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">&#10003;</span>
              </span>
            )}
            {showWrong && (
              <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">&#10007;</span>
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
