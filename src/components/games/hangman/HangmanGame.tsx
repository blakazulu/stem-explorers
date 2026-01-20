"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useGameContent } from "@/lib/queries/games";
import { FINAL_LETTERS } from "@/lib/constants/games";
import { HangmanFigure } from "./HangmanFigure";
import { HangmanKeyboard } from "./HangmanKeyboard";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Icon } from "@/components/ui/Icon";
import { ArrowRight, RotateCcw, Lightbulb, Tag, PartyPopper } from "lucide-react";
import type { Grade } from "@/types";
import type { Difficulty, HangmanContent } from "@/types/games";

interface HangmanGameProps {
  grade: Grade;
  difficulty: Difficulty;
  onScoreUpdate: (score: number) => void;
  onGameComplete: (won: boolean) => void;
}

type GameStatus = "playing" | "won" | "lost";

// Create a reverse mapping: final letter -> regular letter
const FINAL_TO_REGULAR: Record<string, string> = {};
for (const [regular, final] of Object.entries(FINAL_LETTERS)) {
  FINAL_TO_REGULAR[final] = regular;
}

// Create a combined mapping for letter equivalence checking
const LETTER_EQUIVALENTS: Record<string, string[]> = {};
for (const [regular, final] of Object.entries(FINAL_LETTERS)) {
  LETTER_EQUIVALENTS[regular] = [regular, final];
  LETTER_EQUIVALENTS[final] = [regular, final];
}

/**
 * Main Hangman game component.
 * Fetches content, manages game state, and orchestrates the game flow.
 */
export function HangmanGame({
  grade,
  difficulty,
  onScoreUpdate,
  onGameComplete,
}: HangmanGameProps) {
  // Fetch game content
  const { data: contentList = [], isLoading, error, refetch } = useGameContent(
    "hangman",
    grade,
    difficulty
  );

  // Game state
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set());
  const [score, setScore] = useState(0);
  const [gameStatus, setGameStatus] = useState<GameStatus>("playing");
  const [showCelebration, setShowCelebration] = useState(false);

  // Get current word content
  const currentContent = useMemo(() => {
    if (contentList.length === 0) return null;
    return contentList[currentWordIndex] as HangmanContent;
  }, [contentList, currentWordIndex]);

  // Get the word letters (normalized)
  const wordLetters = useMemo(() => {
    if (!currentContent?.word) return [];
    return currentContent.word.split("");
  }, [currentContent]);

  // Calculate correct letters (including equivalents)
  const correctLetters = useMemo(() => {
    const correct = new Set<string>();
    guessedLetters.forEach((letter) => {
      // Get all equivalent forms of the guessed letter
      const equivalents = LETTER_EQUIVALENTS[letter] || [letter];

      // Check if any equivalent is in the word
      const isInWord = wordLetters.some((wordLetter) => {
        const wordEquivalents = LETTER_EQUIVALENTS[wordLetter] || [wordLetter];
        return equivalents.some((eq) => wordEquivalents.includes(eq));
      });

      if (isInWord) {
        correct.add(letter);
        // Also mark equivalent letters as correct
        equivalents.forEach((eq) => {
          if (guessedLetters.has(eq)) {
            correct.add(eq);
          }
        });
      }
    });
    return correct;
  }, [guessedLetters, wordLetters]);

  // Calculate wrong guesses count
  const wrongGuesses = useMemo(() => {
    let count = 0;
    guessedLetters.forEach((letter) => {
      if (!correctLetters.has(letter)) {
        count++;
      }
    });
    return count;
  }, [guessedLetters, correctLetters]);

  // Check if letter is revealed (guessed or equivalent guessed)
  const isLetterRevealed = useCallback(
    (letter: string): boolean => {
      const equivalents = LETTER_EQUIVALENTS[letter] || [letter];
      return equivalents.some((eq) => correctLetters.has(eq));
    },
    [correctLetters]
  );

  // Check win/lose conditions
  useEffect(() => {
    if (!currentContent || gameStatus !== "playing") return;

    // Check for win - all letters revealed
    // Use \u05D0-\u05EA to match only Hebrew consonants (not nikud/vowels)
    const allRevealed = wordLetters.every((letter) => {
      // Skip spaces, punctuation, and non-consonant characters
      if (!/[\u05D0-\u05EA]/.test(letter)) return true;
      return isLetterRevealed(letter);
    });

    if (allRevealed && guessedLetters.size > 0) {
      // Win! Add bonus points using functional update to avoid infinite loop
      const bonus = 50;
      setScore((prevScore) => {
        const newScore = prevScore + bonus;
        onScoreUpdate(newScore);
        return newScore;
      });
      setGameStatus("won");
      setShowCelebration(true);
      onGameComplete(true);
      return;
    }

    // Check for lose - 6 wrong guesses
    if (wrongGuesses >= 6) {
      setGameStatus("lost");
      onGameComplete(false);
    }
  }, [
    currentContent,
    wordLetters,
    isLetterRevealed,
    wrongGuesses,
    guessedLetters,
    gameStatus,
    onScoreUpdate,
    onGameComplete,
  ]);

  // Handle letter guess
  const handleGuess = useCallback(
    (letter: string) => {
      if (gameStatus !== "playing" || guessedLetters.has(letter)) return;

      const newGuessedLetters = new Set(guessedLetters);
      newGuessedLetters.add(letter);
      setGuessedLetters(newGuessedLetters);

      // Check if it's a correct guess (check word for this letter or its equivalents)
      const equivalents = LETTER_EQUIVALENTS[letter] || [letter];
      const isCorrect = wordLetters.some((wordLetter) => {
        const wordEquivalents = LETTER_EQUIVALENTS[wordLetter] || [wordLetter];
        return equivalents.some((eq) => wordEquivalents.includes(eq));
      });

      if (isCorrect) {
        // Award points for correct guess
        const newScore = score + 10;
        setScore(newScore);
        onScoreUpdate(newScore);
      }
    },
    [gameStatus, guessedLetters, wordLetters, score, onScoreUpdate]
  );

  // Handle next word
  const handleNextWord = useCallback(() => {
    const nextIndex = currentWordIndex + 1;
    if (nextIndex < contentList.length) {
      setCurrentWordIndex(nextIndex);
      setGuessedLetters(new Set());
      setGameStatus("playing");
      setShowCelebration(false);
    }
  }, [currentWordIndex, contentList.length]);

  // Handle restart game
  const handleRestart = useCallback(() => {
    setCurrentWordIndex(0);
    setGuessedLetters(new Set());
    setScore(0);
    setGameStatus("playing");
    setShowCelebration(false);
    onScoreUpdate(0);
  }, [onScoreUpdate]);

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full max-w-3xl mx-auto p-4" dir="rtl">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6">
          <div className="flex flex-col items-center gap-6">
            <Skeleton variant="rectangular" width={200} height={200} className="rounded-xl" />
            <Skeleton variant="text" width={300} height={40} />
            <Skeleton variant="text" width={200} height={24} />
            <div className="flex flex-wrap justify-center gap-2">
              {Array.from({ length: 22 }).map((_, i) => (
                <Skeleton
                  key={i}
                  variant="rectangular"
                  width={40}
                  height={40}
                  className="rounded-lg"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <EmptyState
        icon="alert-circle"
        title="שגיאה בטעינת המשחק"
        description="לא הצלחנו לטעון את תוכן המשחק. נסו שוב."
        action={{ label: "נסה שוב", onClick: () => refetch() }}
      />
    );
  }

  // No content available
  if (!currentContent) {
    return (
      <EmptyState
        icon="file-text"
        title="אין מילים זמינות"
        description="עדיין לא נוספו מילים למשחק איש תלוי עבור כיתה זו ורמת קושי זו."
        variant="stem"
      />
    );
  }

  // Render word with blanks
  const renderWord = () => {
    // Use content ID for stable keys
    const keyPrefix = currentContent?.id || "word";

    return (
      <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-6" dir="rtl">
        {wordLetters.map((letter, index) => {
          const key = `${keyPrefix}-${index}`;

          // Handle spaces
          if (letter === " ") {
            return <div key={key} className="w-4" />;
          }

          // Handle non-Hebrew consonant characters (show as-is)
          // Use \u05D0-\u05EA to match only Hebrew consonants
          if (!/[\u05D0-\u05EA]/.test(letter)) {
            return (
              <div
                key={key}
                className="text-2xl sm:text-3xl font-bold text-gray-700"
              >
                {letter}
              </div>
            );
          }

          const revealed = isLetterRevealed(letter);

          return (
            <div
              key={key}
              className={`
                w-10 h-12 sm:w-12 sm:h-14
                flex items-center justify-center
                border-b-4
                transition-all duration-300
                ${revealed
                  ? "border-emerald-500"
                  : "border-gray-400"
                }
              `}
            >
              <span
                className={`
                  text-2xl sm:text-3xl font-bold
                  transition-all duration-300
                  ${revealed
                    ? "text-gray-800 scale-100 opacity-100"
                    : "text-transparent scale-0 opacity-0"
                  }
                `}
              >
                {letter}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  // Has more words to play
  const hasMoreWords = currentWordIndex < contentList.length - 1;

  return (
    <div className="w-full max-w-3xl mx-auto p-4" dir="rtl">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-4 sm:p-6">
        {/* Game header info */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-4 text-sm">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-100 text-teal-700 rounded-lg">
            <Tag size={16} />
            <span className="font-medium">{currentContent.category}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg">
            <Lightbulb size={16} />
            <span className="font-medium">{currentContent.hint}</span>
          </div>
        </div>

        {/* Main game area */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-10 mb-6">
          {/* Hangman figure */}
          <div className="flex-shrink-0">
            <HangmanFigure wrongGuesses={wrongGuesses} />
          </div>

          {/* Word display */}
          <div className="flex-1 flex flex-col items-center">
            {/* Wrong guesses counter */}
            <div className="mb-4 text-center">
              <span className="text-sm text-gray-500">טעויות: </span>
              <span
                className={`font-bold ${
                  wrongGuesses >= 5
                    ? "text-red-500"
                    : wrongGuesses >= 3
                    ? "text-amber-500"
                    : "text-gray-700"
                }`}
              >
                {wrongGuesses} / 6
              </span>
            </div>

            {/* Word */}
            {renderWord()}

            {/* Game status messages */}
            {gameStatus === "won" && (
              <div className="relative">
                {showCelebration && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <PartyPopper
                      size={48}
                      className="text-amber-500 animate-bounce"
                    />
                  </div>
                )}
                <div className="bg-emerald-100 text-emerald-800 px-6 py-3 rounded-xl text-center animate-scale-in">
                  <div className="text-xl font-bold mb-1">כל הכבוד!</div>
                  <div className="text-sm">ניחשת את המילה נכון!</div>
                </div>
              </div>
            )}

            {gameStatus === "lost" && (
              <div className="bg-red-100 text-red-800 px-6 py-3 rounded-xl text-center animate-scale-in">
                <div className="text-xl font-bold mb-1">אוי לא!</div>
                <div className="text-sm">
                  המילה הייתה: <span className="font-bold">{currentContent.word}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Keyboard */}
        {gameStatus === "playing" && (
          <HangmanKeyboard
            guessedLetters={guessedLetters}
            correctLetters={correctLetters}
            onGuess={handleGuess}
            disabled={gameStatus !== "playing"}
          />
        )}

        {/* Action buttons when game is over */}
        {gameStatus !== "playing" && (
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            {hasMoreWords && gameStatus === "won" && (
              <Button
                onClick={handleNextWord}
                variant="primary"
                rightIcon={ArrowRight}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                מילה הבאה
              </Button>
            )}
            <Button
              onClick={handleRestart}
              variant="outline"
              leftIcon={RotateCcw}
            >
              התחל מחדש
            </Button>
          </div>
        )}

        {/* Progress indicator */}
        <div className="mt-6 text-center text-sm text-gray-500">
          מילה {currentWordIndex + 1} מתוך {contentList.length}
        </div>
      </div>
    </div>
  );
}
