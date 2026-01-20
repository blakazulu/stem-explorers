"use client";

import { CheckCircle2, Search } from "lucide-react";

interface WordListProps {
  words: string[];
  foundWords: Set<string>;
}

/**
 * Word List component showing all words to find.
 * Displays progress and crosses out found words with visual feedback.
 */
export function WordList({ words, foundWords }: WordListProps) {
  const foundCount = foundWords.size;
  const totalCount = words.length;
  const progressPercent = totalCount > 0 ? (foundCount / totalCount) * 100 : 0;

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-4 sm:p-5" dir="rtl">
      {/* Header with count */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Search className="w-5 h-5 text-pink-500" />
          <h3 className="text-lg font-rubik font-bold text-gray-800">
            מילים למצוא
          </h3>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-pink-100 text-pink-700 rounded-lg">
          <span className="font-medium text-sm">
            נמצאו {foundCount} מתוך {totalCount}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-pink-100 rounded-full mb-4 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-pink-400 to-pink-500 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Word list */}
      <div className="flex flex-wrap gap-2 justify-center">
        {words.map((word) => {
          const isFound = foundWords.has(word);
          return (
            <div
              key={word}
              className={`
                px-3 py-2 rounded-lg border-2
                transition-all duration-300 ease-out
                ${
                  isFound
                    ? "bg-emerald-100 border-emerald-400 text-emerald-700 line-through decoration-2"
                    : "bg-pink-50 border-pink-200 text-pink-800"
                }
              `}
            >
              <div className="flex items-center gap-2">
                {isFound && (
                  <CheckCircle2
                    className="w-4 h-4 text-emerald-500 animate-scale-in"
                    aria-hidden="true"
                  />
                )}
                <span
                  className={`font-rubik font-bold text-base sm:text-lg ${
                    isFound ? "opacity-70" : ""
                  }`}
                >
                  {word}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Completion message */}
      {foundCount === totalCount && totalCount > 0 && (
        <div className="mt-4 p-3 bg-emerald-100 text-emerald-800 rounded-xl text-center animate-scale-in">
          <span className="text-lg font-bold">
            כל הכבוד! מצאת את כל המילים!
          </span>
        </div>
      )}
    </div>
  );
}
