"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useGameContent } from "@/lib/queries/games";
import { SequenceDisplay } from "./SequenceDisplay";
import { NumberInput } from "./NumberInput";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Confetti } from "@/components/ui/Progress";
import { RotateCcw, PartyPopper, Trophy, ArrowLeft, Check, X } from "lucide-react";
import type { Grade } from "@/types";
import type { Difficulty, NumberPatternContent } from "@/types/games";

interface NumberPatternGameProps {
  grade: Grade;
  difficulty: Difficulty;
  onScoreUpdate: (score: number) => void;
  onGameComplete: (won: boolean) => void;
}

/** Puzzle state tracking */
interface PuzzleState {
  id: string;
  solved: boolean;
  attempts: number;
  pointsEarned: number;
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
 * Main Number Pattern game component.
 * Players complete number sequences by finding the missing number.
 */
export function NumberPatternGame({
  grade,
  difficulty,
  onScoreUpdate,
  onGameComplete,
}: NumberPatternGameProps) {
  // Fetch game content
  const {
    data: contentList = [],
    isLoading,
    error,
    refetch,
  } = useGameContent("numberPattern", grade, difficulty);

  // Shuffle content once when loaded
  const shuffledContent = useMemo(() => {
    if (contentList.length === 0) return [];
    return shuffleArray(contentList) as NumberPatternContent[];
  }, [contentList]);

  // Game state
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [puzzleStates, setPuzzleStates] = useState<PuzzleState[]>([]);
  const [userAnswer, setUserAnswer] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showRule, setShowRule] = useState(false);
  const [score, setScore] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // Refs
  const hasNotifiedCompletion = useRef(false);

  // Initialize puzzle states when content loads
  useEffect(() => {
    if (shuffledContent.length > 0 && puzzleStates.length === 0) {
      setPuzzleStates(
        shuffledContent.map((content) => ({
          id: content.id,
          solved: false,
          attempts: 0,
          pointsEarned: 0,
        }))
      );
    }
  }, [shuffledContent, puzzleStates.length]);

  // Get current puzzle content
  const currentContent = useMemo(() => {
    if (shuffledContent.length === 0) return null;
    return shuffledContent[currentPuzzleIndex];
  }, [shuffledContent, currentPuzzleIndex]);

  // Total puzzles
  const totalPuzzles = shuffledContent.length;

  // Calculate points based on attempt number
  const calculatePoints = useCallback((attemptNumber: number): number => {
    if (attemptNumber === 1) return 10;
    if (attemptNumber === 2) return 5;
    if (attemptNumber === 3) return 2;
    return 0;
  }, []);

  // Handle answer submission
  const handleSubmit = useCallback(() => {
    if (!currentContent || !userAnswer.trim()) return;

    const answer = parseInt(userAnswer, 10);
    const correct = answer === currentContent.answer;
    const newAttempts = attempts + 1;

    setAttempts(newAttempts);
    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      // Calculate points based on attempt number
      const points = calculatePoints(newAttempts);
      const newScore = score + points;
      setScore(newScore);
      setShowRule(true);

      // Update puzzle state
      setPuzzleStates((prev) =>
        prev.map((state, index) =>
          index === currentPuzzleIndex
            ? { ...state, solved: true, attempts: newAttempts, pointsEarned: points }
            : state
        )
      );

      // Defer score update to parent
      setTimeout(() => {
        onScoreUpdate(newScore);
      }, 0);
    } else if (newAttempts >= 3) {
      // Failed all attempts
      setShowRule(true);
      setPuzzleStates((prev) =>
        prev.map((state, index) =>
          index === currentPuzzleIndex
            ? { ...state, solved: true, attempts: newAttempts, pointsEarned: 0 }
            : state
        )
      );
    }
  }, [currentContent, userAnswer, attempts, score, currentPuzzleIndex, calculatePoints, onScoreUpdate]);

  // Handle retry (when wrong but attempts left)
  const handleRetry = useCallback(() => {
    setUserAnswer("");
    setIsCorrect(null);
    setShowResult(false);
  }, []);

  // Handle continue to next puzzle
  const handleContinue = useCallback(() => {
    const nextIndex = currentPuzzleIndex + 1;

    if (nextIndex >= totalPuzzles) {
      // Game complete
      setGameComplete(true);
      setShowCelebration(true);

      if (!hasNotifiedCompletion.current) {
        hasNotifiedCompletion.current = true;

        // Calculate final stats
        const solvedCount = puzzleStates.filter((s) => s.pointsEarned > 0).length + (isCorrect ? 1 : 0);
        const won = solvedCount >= Math.ceil(totalPuzzles * 0.6);

        // Defer completion callback
        setTimeout(() => {
          onGameComplete(won);
        }, 0);
      }
    } else {
      // Move to next puzzle
      setCurrentPuzzleIndex(nextIndex);
      setUserAnswer("");
      setAttempts(0);
      setIsCorrect(null);
      setShowResult(false);
      setShowRule(false);
    }
  }, [currentPuzzleIndex, totalPuzzles, puzzleStates, isCorrect, onGameComplete]);

  // Handle restart game
  const handleRestart = useCallback(() => {
    setCurrentPuzzleIndex(0);
    setPuzzleStates(
      shuffledContent.map((content) => ({
        id: content.id,
        solved: false,
        attempts: 0,
        pointsEarned: 0,
      }))
    );
    setUserAnswer("");
    setAttempts(0);
    setIsCorrect(null);
    setShowResult(false);
    setShowRule(false);
    setScore(0);
    setGameComplete(false);
    setShowCelebration(false);
    hasNotifiedCompletion.current = false;

    // Defer score reset callback
    setTimeout(() => {
      onScoreUpdate(0);
    }, 0);
  }, [shuffledContent, onScoreUpdate]);

  // Calculate final stats
  const finalStats = useMemo(() => {
    if (!gameComplete || puzzleStates.length === 0) {
      return { totalScore: 0, solvedCount: 0, percentage: 0 };
    }

    const solvedCount = puzzleStates.filter((s) => s.pointsEarned > 0).length;
    const totalScore = puzzleStates.reduce((sum, s) => sum + s.pointsEarned, 0);
    const percentage = Math.round((solvedCount / totalPuzzles) * 100);

    return { totalScore, solvedCount, percentage };
  }, [gameComplete, puzzleStates, totalPuzzles]);

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full max-w-2xl mx-auto p-4" dir="rtl">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6">
          <div className="flex flex-col items-center gap-6">
            <Skeleton variant="text" width={200} height={24} />
            <div className="flex gap-4">
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
            <Skeleton variant="rectangular" width={200} height={56} className="rounded-xl" />
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
  if (!currentContent && !gameComplete) {
    return (
      <EmptyState
        icon="hash"
        title="אין סדרות זמינות"
        description="עדיין לא נוספו סדרות מספרים עבור כיתה זו ורמת קושי זו."
        variant="stem"
      />
    );
  }

  // Game complete - show results
  if (gameComplete) {
    const { totalScore, solvedCount, percentage } = finalStats;
    const isPerfect = percentage === 100;
    const isGood = percentage >= 70;

    return (
      <div className="w-full max-w-2xl mx-auto p-4" dir="rtl">
        <Confetti show={showCelebration && isPerfect} />

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 animate-scale-in">
          {/* Celebration header */}
          <div className="text-center mb-6">
            <div className="relative inline-block mb-4">
              <div
                className={`
                  w-24 h-24 rounded-full flex items-center justify-center mx-auto
                  ${isPerfect
                    ? "bg-gradient-to-br from-amber-400 to-yellow-500"
                    : isGood
                    ? "bg-gradient-to-br from-emerald-400 to-teal-500"
                    : "bg-gradient-to-br from-blue-400 to-indigo-500"
                  }
                `}
              >
                {isPerfect ? (
                  <Trophy size={48} className="text-white" />
                ) : (
                  <PartyPopper size={48} className="text-white" />
                )}
              </div>
              {isPerfect && (
                <div className="absolute -top-2 -right-2 animate-bounce">
                  <span className="text-3xl">*</span>
                </div>
              )}
            </div>

            <h2 className="text-2xl font-rubik font-bold text-gray-800 mb-2">
              {isPerfect
                ? "מושלם!"
                : isGood
                ? "כל הכבוד!"
                : "סיימת את המשחק!"}
            </h2>
            <p className="text-gray-600">
              {isPerfect
                ? "פתרת את כל הסדרות!"
                : isGood
                ? "עשית עבודה מצוינת!"
                : "תמשיך להתאמן ותשתפר!"}
            </p>
          </div>

          {/* Score display */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-600">{totalScore}</div>
                <div className="text-sm text-gray-600">ניקוד</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-emerald-600">
                  {solvedCount}/{totalPuzzles}
                </div>
                <div className="text-sm text-gray-600">סדרות פתורות</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-orange-600">
                  {percentage}%
                </div>
                <div className="text-sm text-gray-600">אחוז הצלחה</div>
              </div>
            </div>
          </div>

          {/* Progress bar visualization */}
          <div className="mb-6">
            <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${
                  isPerfect
                    ? "bg-gradient-to-r from-amber-400 to-yellow-500"
                    : isGood
                    ? "bg-gradient-to-r from-emerald-400 to-teal-500"
                    : "bg-gradient-to-r from-blue-400 to-indigo-500"
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>

          {/* Play again button */}
          <div className="flex justify-center">
            <Button
              onClick={handleRestart}
              variant="primary"
              leftIcon={RotateCcw}
              className="bg-blue-500 hover:bg-blue-600 text-lg px-8"
            >
              שחק שוב
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Main game view
  if (!currentContent) return null;

  const canRetry = !isCorrect && showResult && attempts < 3;
  const showContinueButton = showRule;

  return (
    <div className="w-full max-w-2xl mx-auto p-4" dir="rtl">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-4 sm:p-6">
        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              סדרה {currentPuzzleIndex + 1} מתוך {totalPuzzles}
            </span>
            <span className="text-sm font-bold text-blue-600">
              ניקוד: {score}
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${((currentPuzzleIndex + 1) / totalPuzzles) * 100}%` }}
            />
          </div>
        </div>

        {/* Sequence display */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-700 text-center mb-6">
            מצא את המספר החסר בסדרה
          </h3>
          <SequenceDisplay
            sequence={currentContent.sequence}
            userAnswer={userAnswer}
            isCorrect={isCorrect}
            showResult={showResult}
          />
        </div>

        {/* Result feedback */}
        {showResult && (
          <div
            className={`
              flex items-center justify-center gap-2 mb-6 px-4 py-3 rounded-xl
              animate-scale-in
              ${isCorrect
                ? "bg-emerald-100 text-emerald-700"
                : "bg-red-100 text-red-700"
              }
            `}
          >
            {isCorrect ? (
              <>
                <Check size={20} />
                <span className="font-medium">
                  נכון! +{calculatePoints(attempts)} נקודות
                </span>
              </>
            ) : attempts >= 3 ? (
              <>
                <X size={20} />
                <span className="font-medium">
                  התשובה הנכונה היא: {currentContent.answer}
                </span>
              </>
            ) : (
              <>
                <X size={20} />
                <span className="font-medium">לא נכון, נסה שוב!</span>
              </>
            )}
          </div>
        )}

        {/* Rule explanation */}
        {showRule && (
          <div className="mb-6 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl animate-slide-up">
            <p className="text-sm font-medium text-blue-700 text-center">
              <span className="font-bold">הכלל: </span>
              {currentContent.rule}
            </p>
          </div>
        )}

        {/* Input or continue button */}
        {showContinueButton ? (
          <div className="flex justify-center">
            <Button
              onClick={handleContinue}
              variant="primary"
              rightIcon={ArrowLeft}
              className="bg-blue-600 hover:bg-blue-700"
            >
              המשך
            </Button>
          </div>
        ) : (
          <NumberInput
            value={userAnswer}
            onChange={setUserAnswer}
            onSubmit={handleSubmit}
            onRetry={handleRetry}
            disabled={showResult && !canRetry}
            showRetry={canRetry}
            attemptsLeft={3 - attempts}
          />
        )}
      </div>
    </div>
  );
}
