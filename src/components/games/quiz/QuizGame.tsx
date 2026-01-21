"use client";

import { useState, useCallback, useMemo } from "react";
import { useGameContent } from "@/lib/queries/games";
import { QuizQuestion } from "./QuizQuestion";
import { QuizProgress } from "./QuizProgress";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Confetti } from "@/components/ui/Progress";
import { RotateCcw, PartyPopper, Trophy } from "lucide-react";
import type { Grade } from "@/types";
import type { Difficulty, QuizContent } from "@/types/games";

interface QuizGameProps {
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
 * Main Quiz game component.
 * Fetches content, manages game state, and orchestrates the quiz flow.
 */
export function QuizGame({
  grade,
  difficulty,
  onScoreUpdate,
  onGameComplete,
}: QuizGameProps) {
  // Fetch game content
  const {
    data: contentList = [],
    isLoading,
    error,
    refetch,
  } = useGameContent("quiz", grade, difficulty);

  // Shuffle content once when loaded
  const shuffledContent = useMemo(() => {
    if (contentList.length === 0) return [];
    return shuffleArray(contentList) as QuizContent[];
  }, [contentList]);

  // Game state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // Get current question content
  const currentContent = useMemo(() => {
    if (shuffledContent.length === 0) return null;
    return shuffledContent[currentQuestionIndex];
  }, [shuffledContent, currentQuestionIndex]);

  // Total questions
  const totalQuestions = shuffledContent.length;

  // Handle answer
  const handleAnswer = useCallback(
    (isCorrect: boolean) => {
      if (isCorrect) {
        const newScore = score + 10;
        setScore(newScore);
        setCorrectAnswers((prev) => prev + 1);
        onScoreUpdate(newScore);
      }

      // Check if this was the last question
      const isLastQuestion = currentQuestionIndex >= shuffledContent.length - 1;

      if (isLastQuestion) {
        // Game complete
        setGameComplete(true);
        setShowCelebration(true);

        // Calculate final percentage
        const finalCorrect = isCorrect ? correctAnswers + 1 : correctAnswers;
        const percentage = Math.round((finalCorrect / totalQuestions) * 100);

        // Consider "won" if scored at least 60%
        const won = percentage >= 60;
        onGameComplete(won);
      } else {
        // Move to next question
        setCurrentQuestionIndex((prev) => prev + 1);
      }
    },
    [
      score,
      currentQuestionIndex,
      shuffledContent.length,
      correctAnswers,
      totalQuestions,
      onScoreUpdate,
      onGameComplete,
    ]
  );

  // Handle restart game
  const handleRestart = useCallback(() => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setCorrectAnswers(0);
    setGameComplete(false);
    setShowCelebration(false);
    onScoreUpdate(0);
  }, [onScoreUpdate]);

  // Calculate final percentage
  const finalPercentage = useMemo(() => {
    if (!gameComplete || totalQuestions === 0) return 0;
    return Math.round((correctAnswers / totalQuestions) * 100);
  }, [gameComplete, correctAnswers, totalQuestions]);

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full max-w-2xl mx-auto p-4" dir="rtl">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6">
          <div className="flex flex-col items-center gap-6">
            <Skeleton variant="text" width={200} height={24} />
            <Skeleton variant="rectangular" className="w-full h-3 rounded-full" />
            <Skeleton variant="text" className="w-full h-16" />
            <div className="grid grid-cols-2 gap-3 w-full">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton
                  key={i}
                  variant="rectangular"
                  className="h-16 rounded-xl"
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
  if (!currentContent && !gameComplete) {
    return (
      <EmptyState
        icon="help-circle"
        title="אין שאלות זמינות"
        description="עדיין לא נוספו שאלות לחידון עבור כיתה זו ורמת קושי זו."
        variant="stem"
      />
    );
  }

  // Game complete - show results
  if (gameComplete) {
    const isPerfect = finalPercentage === 100;
    const isGood = finalPercentage >= 70;

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
                  <span className="text-3xl">🌟</span>
                </div>
              )}
            </div>

            <h2 className="text-2xl font-rubik font-bold text-gray-800 mb-2">
              {isPerfect
                ? "מושלם!"
                : isGood
                ? "כל הכבוד!"
                : "סיימת את החידון!"}
            </h2>
            <p className="text-gray-600">
              {isPerfect
                ? "ענית נכון על כל השאלות!"
                : isGood
                ? "עשית עבודה מצוינת!"
                : "תמשיך להתאמן ותשתפר!"}
            </p>
          </div>

          {/* Score display */}
          <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-6 mb-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold text-amber-600">{score}</div>
                <div className="text-sm text-gray-600">ניקוד</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-emerald-600">
                  {correctAnswers}/{totalQuestions}
                </div>
                <div className="text-sm text-gray-600">תשובות נכונות</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600">
                  {finalPercentage}%
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
                style={{ width: `${finalPercentage}%` }}
              />
            </div>
          </div>

          {/* Play again button */}
          <div className="flex justify-center">
            <Button
              onClick={handleRestart}
              variant="primary"
              leftIcon={RotateCcw}
              className="bg-amber-500 hover:bg-amber-600 text-lg px-8"
            >
              שחק שוב
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Main game view
  return (
    <div className="w-full max-w-2xl mx-auto p-4" dir="rtl">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-4 sm:p-6">
        {/* Progress bar */}
        <QuizProgress
          currentQuestion={currentQuestionIndex + 1}
          totalQuestions={totalQuestions}
          score={score}
        />

        {/* Current question */}
        <QuizQuestion
          content={currentContent}
          onAnswer={handleAnswer}
          questionNumber={currentQuestionIndex + 1}
        />
      </div>
    </div>
  );
}
