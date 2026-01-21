"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useGameContent } from "@/lib/queries/games";
import { PatternSequence } from "./PatternSequence";
import { PatternOptions } from "./PatternOptions";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Confetti } from "@/components/ui/Progress";
import { RotateCcw, PartyPopper, Trophy, ArrowRight, Eye } from "lucide-react";
import type { Grade } from "@/types";
import type { Difficulty, PatternContent } from "@/types/games";

interface PatternGameProps {
  grade: Grade;
  difficulty: Difficulty;
  onScoreUpdate: (score: number) => void;
  onGameComplete: (won: boolean) => void;
}

/**
 * Shuffle array using Fisher-Yates algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Main Pattern game component.
 * Visual pattern completion - find what comes next in a sequence.
 */
export function PatternGame({
  grade,
  difficulty,
  onScoreUpdate,
  onGameComplete,
}: PatternGameProps) {
  // Fetch game content
  const {
    data: contentList = [],
    isLoading,
    error,
    refetch,
  } = useGameContent("pattern", grade, difficulty);

  // Shuffle content once when loaded
  const shuffledContent = useMemo(() => {
    if (contentList.length === 0) return [];
    return shuffleArray(contentList) as PatternContent[];
  }, [contentList]);

  // Game state
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [score, setScore] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);

  // Refs
  const hasNotifiedCompletion = useRef(false);

  // Get current puzzle content
  const currentContent = useMemo(() => {
    if (shuffledContent.length === 0) return null;
    return shuffledContent[currentPuzzleIndex];
  }, [shuffledContent, currentPuzzleIndex]);

  // Reset state when moving to new puzzle
  useEffect(() => {
    if (currentContent) {
      setSelectedIndex(null);
      setIsRevealed(false);
      setAttempts(0);
      hasNotifiedCompletion.current = false;
    }
  }, [currentContent?.id]);

  // Calculate points based on attempts
  const calculatePoints = useCallback((attemptNumber: number): number => {
    if (attemptNumber === 1) return 10; // First try
    if (attemptNumber === 2) return 5;  // Second try
    return 0; // After second try
  }, []);

  // Handle option selection
  const handleSelect = useCallback(
    (index: number) => {
      if (isRevealed || !currentContent) return;

      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setSelectedIndex(index);

      const isCorrect = index === currentContent.correctIndex;

      if (isCorrect) {
        // Correct answer
        const points = calculatePoints(newAttempts);
        const newScore = score + points;
        setScore(newScore);
        setIsRevealed(true);
        setTotalCorrect((prev) => prev + 1);
        setShowCelebration(true);

        // Defer parent callback
        setTimeout(() => {
          onScoreUpdate(newScore);
        }, 0);
      } else {
        // Wrong answer - check if should reveal (after 2 attempts)
        if (newAttempts >= 2) {
          setIsRevealed(true);
          setTotalQuestions((prev) => prev + 1);
        } else {
          // Allow retry - clear selection after a moment
          setTimeout(() => {
            setSelectedIndex(null);
          }, 800);
        }
      }
    },
    [isRevealed, currentContent, attempts, score, calculatePoints, onScoreUpdate]
  );

  // Handle next puzzle
  const handleNextPuzzle = useCallback(() => {
    const nextIndex = currentPuzzleIndex + 1;
    setShowCelebration(false);

    if (nextIndex < shuffledContent.length) {
      setCurrentPuzzleIndex(nextIndex);
    } else {
      // Game complete
      if (!hasNotifiedCompletion.current) {
        hasNotifiedCompletion.current = true;
        setGameComplete(true);
        setTimeout(() => {
          onGameComplete(true);
        }, 0);
      }
    }
  }, [currentPuzzleIndex, shuffledContent.length, onGameComplete]);

  // Handle restart game
  const handleRestart = useCallback(() => {
    setCurrentPuzzleIndex(0);
    setScore(0);
    setTotalCorrect(0);
    setTotalQuestions(0);
    setShowCelebration(false);
    setGameComplete(false);
    hasNotifiedCompletion.current = false;
    // Defer callback
    setTimeout(() => onScoreUpdate(0), 0);
  }, [onScoreUpdate]);

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full max-w-2xl mx-auto p-4" dir="rtl">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6">
          <div className="flex flex-col items-center gap-6">
            <Skeleton variant="text" width={200} height={24} />
            <div className="flex gap-4 justify-center">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton
                  key={i}
                  variant="rectangular"
                  width={64}
                  height={64}
                  className="rounded-xl"
                />
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4 w-full max-w-md">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton
                  key={i}
                  variant="rectangular"
                  height={56}
                  className="rounded-xl"
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
        icon="workflow"
        title="אין תוכן זמין"
        description="עדיין לא נוספו תבניות עבור כיתה זו ורמת קושי זו."
        variant="stem"
      />
    );
  }

  const hasMorePuzzles = currentPuzzleIndex < shuffledContent.length - 1;
  const correctAnswer = currentContent.options[currentContent.correctIndex];

  return (
    <div className="w-full max-w-2xl mx-auto p-4" dir="rtl">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-4 sm:p-6">
        {/* Game stats */}
        <div className="flex items-center justify-center gap-4 mb-6 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-cyan-100 text-cyan-700 rounded-lg">
            <span className="text-sm font-medium">
              ניקוד: <span className="font-bold">{score}</span>
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
            <span className="text-sm font-medium">
              נכונים: <span className="font-bold">{totalCorrect}</span>/{currentPuzzleIndex + (isRevealed ? 1 : 0)}
            </span>
          </div>
          {attempts > 0 && !isRevealed && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg">
              <span className="text-sm font-medium">
                ניסיון: <span className="font-bold">{attempts}</span>/2
              </span>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="text-center mb-6">
          <h3 className="text-lg font-rubik font-bold text-gray-800 mb-1">
            מצא את הדפוס
          </h3>
          <p className="text-sm text-gray-600">
            {isRevealed
              ? "צפה בהסבר על הכלל"
              : "מה ממשיך את הסדרה? בחר את התשובה הנכונה"}
          </p>
        </div>

        {/* Pattern sequence */}
        <div className="mb-8 p-4 bg-gray-50 rounded-xl">
          <PatternSequence
            sequence={currentContent.sequence}
            isRevealed={isRevealed}
            correctAnswer={correctAnswer}
          />
        </div>

        {/* Options grid */}
        <div className="mb-6">
          <PatternOptions
            options={currentContent.options}
            correctIndex={currentContent.correctIndex}
            selectedIndex={selectedIndex}
            isRevealed={isRevealed}
            onSelect={handleSelect}
          />
        </div>

        {/* Rule explanation when revealed */}
        {isRevealed && (
          <div className="mb-6 animate-fade-in">
            <div className="bg-cyan-50 border-2 border-cyan-200 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Eye size={18} className="text-cyan-600" />
                <span className="text-sm font-bold text-cyan-700">הכלל:</span>
              </div>
              <p className="text-cyan-800 font-medium">{currentContent.rule}</p>
            </div>
          </div>
        )}

        {/* Celebration message */}
        {showCelebration && selectedIndex === currentContent.correctIndex && (
          <div className="mb-6 relative">
            <Confetti show={attempts === 1} />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {attempts === 1 ? (
                <Trophy size={48} className="text-amber-500 animate-bounce" />
              ) : (
                <PartyPopper
                  size={48}
                  className="text-cyan-500 animate-bounce"
                />
              )}
            </div>
            <div className="bg-emerald-100 text-emerald-800 px-6 py-4 rounded-xl text-center animate-scale-in">
              <div className="text-xl font-bold mb-1">
                {attempts === 1 ? "מושלם! +10 נקודות" : "כל הכבוד! +5 נקודות"}
              </div>
              <div className="text-sm">
                {attempts === 1
                  ? "זיהית את הדפוס בניסיון ראשון!"
                  : "זיהית את הדפוס נכון!"}
              </div>
            </div>
          </div>
        )}

        {/* Action buttons when revealed */}
        {isRevealed && !gameComplete && (
          <div className="flex flex-wrap justify-center gap-3">
            {hasMorePuzzles ? (
              <Button
                onClick={handleNextPuzzle}
                variant="primary"
                rightIcon={ArrowRight}
                className="bg-cyan-600 hover:bg-cyan-700"
              >
                תבנית הבאה
              </Button>
            ) : (
              <Button
                onClick={handleNextPuzzle}
                variant="primary"
                rightIcon={Trophy}
                className="bg-cyan-600 hover:bg-cyan-700"
              >
                סיים משחק
              </Button>
            )}
          </div>
        )}

        {/* Game complete state */}
        {gameComplete && (
          <div className="text-center">
            <Confetti show={totalCorrect >= shuffledContent.length / 2} />
            <div className="bg-gradient-to-br from-cyan-100 to-emerald-100 rounded-xl p-6 mb-4">
              <Trophy size={64} className="text-amber-500 mx-auto mb-3" />
              <h3 className="text-2xl font-rubik font-bold text-gray-800 mb-2">
                סיימת את המשחק!
              </h3>
              <div className="text-lg text-gray-700 mb-2">
                ניקוד סופי: <span className="font-bold text-cyan-600">{score}</span>
              </div>
              <div className="text-sm text-gray-600">
                זיהית {totalCorrect} מתוך {shuffledContent.length} תבניות
              </div>
            </div>
            <Button
              onClick={handleRestart}
              variant="primary"
              leftIcon={RotateCcw}
              className="bg-cyan-600 hover:bg-cyan-700"
            >
              שחק שוב
            </Button>
          </div>
        )}

        {/* Progress indicator */}
        <div className="mt-6 text-center text-sm text-gray-500">
          תבנית {currentPuzzleIndex + 1} מתוך {shuffledContent.length}
        </div>
      </div>
    </div>
  );
}
