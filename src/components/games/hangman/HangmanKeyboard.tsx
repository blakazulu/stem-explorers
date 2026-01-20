"use client";

import { HEBREW_ALPHABET, FINAL_LETTERS } from "@/lib/constants/games";

interface HangmanKeyboardProps {
  guessedLetters: Set<string>;
  correctLetters: Set<string>;
  onGuess: (letter: string) => void;
  disabled?: boolean;
}

// Get all final letters as a separate array
const FINAL_LETTERS_ARRAY = Object.values(FINAL_LETTERS);

/**
 * Hebrew letter keyboard for guessing in Hangman game.
 * Displays all Hebrew letters including final letters (sofiot).
 * Provides visual feedback for correct (green), wrong (red), and unguessed letters.
 */
export function HangmanKeyboard({
  guessedLetters,
  correctLetters,
  onGuess,
  disabled = false,
}: HangmanKeyboardProps) {
  // Determine the status of a letter
  const getLetterStatus = (
    letter: string
  ): "correct" | "wrong" | "unguessed" => {
    if (correctLetters.has(letter)) {
      return "correct";
    }
    if (guessedLetters.has(letter)) {
      return "wrong";
    }
    return "unguessed";
  };

  // Get styling based on letter status
  const getLetterStyles = (status: "correct" | "wrong" | "unguessed") => {
    switch (status) {
      case "correct":
        return "bg-emerald-500 text-white border-emerald-600 shadow-emerald-200 cursor-not-allowed";
      case "wrong":
        return "bg-red-400 text-white border-red-500 shadow-red-200 cursor-not-allowed opacity-60";
      case "unguessed":
        return "bg-white hover:bg-emerald-50 text-gray-800 border-gray-300 hover:border-emerald-400 hover:shadow-emerald-100 cursor-pointer active:scale-95";
    }
  };

  const handleClick = (letter: string) => {
    if (disabled || guessedLetters.has(letter)) return;
    onGuess(letter);
  };

  const renderLetterButton = (letter: string) => {
    const status = getLetterStatus(letter);
    const isDisabled = disabled || status !== "unguessed";

    return (
      <button
        key={letter}
        onClick={() => handleClick(letter)}
        disabled={isDisabled}
        aria-label={`אות ${letter}`}
        aria-pressed={status !== "unguessed"}
        className={`
          w-10 h-10 sm:w-12 sm:h-12
          rounded-lg border-2
          font-bold text-lg sm:text-xl
          transition-all duration-200 ease-out
          shadow-sm hover:shadow-md
          flex items-center justify-center
          ${getLetterStyles(status)}
          ${isDisabled ? "" : "transform hover:-translate-y-0.5"}
        `}
      >
        {letter}
      </button>
    );
  };

  return (
    <div className="w-full max-w-2xl mx-auto" dir="rtl">
      {/* Main Hebrew alphabet - arranged in rows */}
      <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 mb-3">
        {HEBREW_ALPHABET.map((letter) => renderLetterButton(letter))}
      </div>

      {/* Final letters (sofiot) - separate row with label */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center mb-2 font-medium">
          אותיות סופיות
        </div>
        <div className="flex justify-center gap-1.5 sm:gap-2">
          {FINAL_LETTERS_ARRAY.map((letter) => renderLetterButton(letter))}
        </div>
      </div>
    </div>
  );
}
