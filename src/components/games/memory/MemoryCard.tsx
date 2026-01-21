"use client";

import { Brain } from "lucide-react";

interface MemoryCardProps {
  /** The text content to display when flipped */
  content: string;
  /** Whether the card is currently flipped (showing front) */
  isFlipped: boolean;
  /** Whether this card has been matched */
  isMatched: boolean;
  /** Click handler */
  onClick: () => void;
  /** Whether interaction is disabled */
  disabled: boolean;
  /** Index for staggered animation */
  index: number;
}

/**
 * A single memory card with flip animation.
 * Shows a pattern/icon on the back and text content on the front.
 */
export function MemoryCard({
  content,
  isFlipped,
  isMatched,
  onClick,
  disabled,
  index,
}: MemoryCardProps) {
  const handleClick = () => {
    if (!disabled && !isFlipped && !isMatched) {
      onClick();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      className="perspective-1000 w-full aspect-square"
      style={{
        animationDelay: `${index * 50}ms`,
      }}
    >
      <button
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        disabled={disabled || isMatched}
        aria-label={isFlipped || isMatched ? content : "קלף הפוך"}
        className={`
          relative w-full h-full
          transform-style-3d
          transition-transform duration-500 ease-out
          ${isFlipped || isMatched ? "rotate-y-180" : ""}
          ${!disabled && !isFlipped && !isMatched ? "cursor-pointer" : "cursor-default"}
          focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2
          rounded-xl
        `}
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped || isMatched ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* Card Back */}
        <div
          className={`
            absolute inset-0 w-full h-full
            backface-hidden rounded-xl
            bg-gradient-to-br from-violet-500 via-purple-500 to-violet-600
            flex items-center justify-center
            shadow-lg
            transition-all duration-300
            ${!disabled && !isFlipped && !isMatched ? "hover:shadow-xl hover:scale-105" : ""}
            ${isMatched ? "opacity-0" : ""}
          `}
          style={{
            backfaceVisibility: "hidden",
          }}
        >
          {/* Decorative pattern */}
          <div className="absolute inset-2 border-2 border-white/20 rounded-lg" />
          <div className="absolute inset-4 border border-white/10 rounded-md" />

          {/* Brain icon */}
          <Brain className="w-8 h-8 sm:w-10 sm:h-10 text-white/90" />

          {/* Shine effect */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-white/0 via-white/10 to-white/0 pointer-events-none" />
        </div>

        {/* Card Front */}
        <div
          className={`
            absolute inset-0 w-full h-full
            backface-hidden rounded-xl
            bg-white
            flex items-center justify-center
            p-2 sm:p-3
            shadow-lg
            transition-all duration-300
            ${isMatched ? "border-4 border-emerald-400 bg-emerald-50" : "border-2 border-violet-200"}
          `}
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <span
            className={`
              text-sm sm:text-base md:text-lg font-bold text-center
              leading-tight
              ${isMatched ? "text-emerald-700" : "text-gray-800"}
            `}
          >
            {content}
          </span>

          {/* Match indicator */}
          {isMatched && (
            <div className="absolute top-1 right-1 w-5 h-5 sm:w-6 sm:h-6 bg-emerald-500 rounded-full flex items-center justify-center">
              <svg
                className="w-3 h-3 sm:w-4 sm:h-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          )}
        </div>
      </button>
    </div>
  );
}
