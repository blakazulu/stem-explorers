"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useGameContent } from "@/lib/queries/games";
import { ProblemDisplay } from "./ProblemDisplay";
import { AnswerOptions } from "./AnswerOptions";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Confetti } from "@/components/ui/Progress";
import { RotateCcw, PartyPopper, Trophy, Timer, Zap } from "lucide-react";
import type { Grade } from "@/types";
import type { Difficulty, MathRaceContent } from "@/types/games";

interface MathRaceGameProps {
  grade: Grade;
  difficulty: Difficulty;
  onScoreUpdate: (score: number) => void;
  onGameComplete: (won: boolean) => void;
}

/** Problem state tracking */
interface ProblemState {
  id: string;
  answered: boolean;
  correct: boolean;
  pointsEarned: number;
  timeBonus: number;
}

/** Time per round in seconds */
const ROUND_TIME = 30;

/** Points for correct answer */
const CORRECT_POINTS = 10;

/** Penalty for wrong answer */
const WRONG_PENALTY = 5;

/** Max time bonus (when answered instantly) */
const MAX_TIME_BONUS = 5;

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
 * Main Math Race game component.
 * Speed math game with countdown timer and bonus points for quick answers.
 */
export function MathRaceGame({
  grade,
  difficulty,
  onScoreUpdate,
  onGameComplete,
}: MathRaceGameProps) {
  // Fetch game content
  const {
    data: contentList = [],
    isLoading,
    error,
    refetch,
  } = useGameContent("mathRace", grade, difficulty);

  // Shuffle content once when loaded
  const shuffledContent = useMemo(() => {
    if (contentList.length === 0) return [];
    return shuffleArray(contentList) as MathRaceContent[];
  }, [contentList]);

  // Game state
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [problemStates, setProblemStates] = useState<ProblemState[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME);
  const [problemStartTime, setProblemStartTime] = useState<number>(Date.now());
  const [gameComplete, setGameComplete] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Refs
  const hasNotifiedCompletion = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize problem states when content loads
  useEffect(() => {
    if (shuffledContent.length > 0 && problemStates.length === 0) {
      setProblemStates(
        shuffledContent.map((content) => ({
          id: content.id,
          answered: false,
          correct: false,
          pointsEarned: 0,
          timeBonus: 0,
        }))
      );
    }
  }, [shuffledContent, problemStates.length]);

  // Timer countdown effect
  useEffect(() => {
    if (gameComplete || isPaused || showResult || shuffledContent.length === 0) {
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time's up for this problem
          handleTimeout();
          return ROUND_TIME;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameComplete, isPaused, showResult, currentProblemIndex, shuffledContent.length]);

  // Get current problem content
  const currentContent = useMemo(() => {
    if (shuffledContent.length === 0) return null;
    return shuffledContent[currentProblemIndex];
  }, [shuffledContent, currentProblemIndex]);

  // Total problems
  const totalProblems = shuffledContent.length;

  // Calculate time bonus based on how quickly the answer was given
  const calculateTimeBonus = useCallback((): number => {
    const elapsed = (Date.now() - problemStartTime) / 1000;
    const speedRatio = Math.max(0, 1 - elapsed / ROUND_TIME);
    return Math.round(speedRatio * MAX_TIME_BONUS);
  }, [problemStartTime]);

  // Handle timeout (time ran out for current problem)
  const handleTimeout = useCallback(() => {
    if (!currentContent || showResult) return;

    setShowResult(true);
    setSelectedAnswer(null);

    // Update problem state - no points
    setProblemStates((prev) =>
      prev.map((state, index) =>
        index === currentProblemIndex
          ? { ...state, answered: true, correct: false, pointsEarned: 0, timeBonus: 0 }
          : state
      )
    );

    // Auto-continue after showing result
    setTimeout(() => {
      moveToNextProblem();
    }, 1500);
  }, [currentContent, showResult, currentProblemIndex]);

  // Handle answer selection
  const handleAnswerSelect = useCallback(
    (answer: number) => {
      if (!currentContent || showResult) return;

      setSelectedAnswer(answer);
      setShowResult(true);

      const isCorrect = answer === currentContent.answer;
      const timeBonus = isCorrect ? calculateTimeBonus() : 0;
      const pointsEarned = isCorrect ? CORRECT_POINTS + timeBonus : -WRONG_PENALTY;
      const newScore = Math.max(0, score + pointsEarned);

      setScore(newScore);

      // Update problem state
      setProblemStates((prev) =>
        prev.map((state, index) =>
          index === currentProblemIndex
            ? { ...state, answered: true, correct: isCorrect, pointsEarned: isCorrect ? CORRECT_POINTS : -WRONG_PENALTY, timeBonus }
            : state
        )
      );

      // Defer score update to parent
      setTimeout(() => {
        onScoreUpdate(newScore);
      }, 0);

      // Auto-continue after showing result
      setTimeout(() => {
        moveToNextProblem();
      }, 1500);
    },
    [currentContent, showResult, calculateTimeBonus, score, currentProblemIndex, onScoreUpdate]
  );

  // Move to next problem or complete game
  const moveToNextProblem = useCallback(() => {
    const nextIndex = currentProblemIndex + 1;

    if (nextIndex >= totalProblems) {
      // Game complete
      setGameComplete(true);
      setShowCelebration(true);

      if (!hasNotifiedCompletion.current) {
        hasNotifiedCompletion.current = true;

        // Calculate final stats
        const correctCount = problemStates.filter((s) => s.correct).length + (selectedAnswer === currentContent?.answer ? 1 : 0);
        const won = correctCount >= Math.ceil(totalProblems * 0.6);

        // Defer completion callback
        setTimeout(() => {
          onGameComplete(won);
        }, 0);
      }
    } else {
      // Move to next problem
      setCurrentProblemIndex(nextIndex);
      setSelectedAnswer(null);
      setShowResult(false);
      setTimeLeft(ROUND_TIME);
      setProblemStartTime(Date.now());
    }
  }, [currentProblemIndex, totalProblems, problemStates, selectedAnswer, currentContent, onGameComplete]);

  // Handle restart game
  const handleRestart = useCallback(() => {
    setCurrentProblemIndex(0);
    setProblemStates(
      shuffledContent.map((content) => ({
        id: content.id,
        answered: false,
        correct: false,
        pointsEarned: 0,
        timeBonus: 0,
      }))
    );
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setTimeLeft(ROUND_TIME);
    setProblemStartTime(Date.now());
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
    if (!gameComplete || problemStates.length === 0) {
      return { totalScore: 0, correctCount: 0, percentage: 0, totalTimeBonus: 0 };
    }

    const correctCount = problemStates.filter((s) => s.correct).length;
    const totalScore = problemStates.reduce((sum, s) => sum + Math.max(0, s.pointsEarned + s.timeBonus), 0);
    const totalTimeBonus = problemStates.reduce((sum, s) => sum + s.timeBonus, 0);
    const percentage = Math.round((correctCount / totalProblems) * 100);

    return { totalScore, correctCount, percentage, totalTimeBonus };
  }, [gameComplete, problemStates, totalProblems]);

  // Get timer color based on time left
  const getTimerColor = useCallback(() => {
    if (timeLeft > 20) return "text-emerald-600";
    if (timeLeft > 10) return "text-amber-600";
    return "text-red-600";
  }, [timeLeft]);

  // Get timer progress percentage
  const timerProgress = (timeLeft / ROUND_TIME) * 100;

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full max-w-2xl mx-auto p-4" dir="rtl">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6">
          <div className="flex flex-col items-center gap-6">
            <Skeleton variant="text" width={200} height={24} />
            <Skeleton variant="rectangular" className="w-full h-3 rounded-full" />
            <Skeleton variant="rectangular" className="w-full h-24 rounded-xl" />
            <div className="grid grid-cols-2 gap-3 w-full">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton
                  key={i}
                  variant="rectangular"
                  className="h-20 rounded-xl"
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
        icon="zap"
        title="אין תרגילים זמינים"
        description="עדיין לא נוספו תרגילי חשבון עבור כיתה זו ורמת קושי זו."
        variant="stem"
      />
    );
  }

  // Game complete - show results
  if (gameComplete) {
    const { totalScore, correctCount, percentage, totalTimeBonus } = finalStats;
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
                  <Zap size={32} className="text-amber-500" />
                </div>
              )}
            </div>

            <h2 className="text-2xl font-rubik font-bold text-gray-800 mb-2">
              {isPerfect
                ? "מושלם!"
                : isGood
                ? "כל הכבוד!"
                : "סיימת את המרוץ!"}
            </h2>
            <p className="text-gray-600">
              {isPerfect
                ? "פתרת את כל התרגילים נכון!"
                : isGood
                ? "מהירות מרשימה!"
                : "תמשיך להתאמן ותשתפר!"}
            </p>
          </div>

          {/* Score display */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-600">{score}</div>
                <div className="text-sm text-gray-600">ניקוד</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-emerald-600">
                  {correctCount}/{totalProblems}
                </div>
                <div className="text-sm text-gray-600">תשובות נכונות</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-orange-600">
                  {percentage}%
                </div>
                <div className="text-sm text-gray-600">אחוז הצלחה</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-amber-600">
                  +{totalTimeBonus}
                </div>
                <div className="text-sm text-gray-600">בונוס מהירות</div>
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

  return (
    <div className="w-full max-w-2xl mx-auto p-4" dir="rtl">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-4 sm:p-6">
        {/* Header with progress and timer */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              תרגיל {currentProblemIndex + 1} מתוך {totalProblems}
            </span>
            <div className="flex items-center gap-2">
              <Timer size={18} className={getTimerColor()} />
              <span className={`text-lg font-bold ${getTimerColor()}`}>
                {timeLeft}
              </span>
            </div>
          </div>
          {/* Timer progress bar */}
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
            <div
              className={`h-full transition-all duration-1000 ease-linear rounded-full ${
                timeLeft > 20
                  ? "bg-emerald-500"
                  : timeLeft > 10
                  ? "bg-amber-500"
                  : "bg-red-500"
              }`}
              style={{ width: `${timerProgress}%` }}
            />
          </div>
          {/* Score display */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">
              ניקוד: <span className="font-bold text-blue-600">{score}</span>
            </span>
            {showResult && selectedAnswer === currentContent.answer && (
              <span className="text-emerald-600 font-medium animate-fade-in">
                +{CORRECT_POINTS} + בונוס מהירות!
              </span>
            )}
          </div>
        </div>

        {/* Problem display */}
        <div className="mb-6">
          <ProblemDisplay
            problem={currentContent.problem}
            isCorrect={selectedAnswer === currentContent.answer}
            showResult={showResult}
          />
        </div>

        {/* Answer options */}
        <AnswerOptions
          options={currentContent.options}
          correctAnswer={currentContent.answer}
          selectedAnswer={selectedAnswer}
          onSelect={handleAnswerSelect}
          disabled={showResult}
          showResult={showResult}
        />

        {/* Result feedback */}
        {showResult && (
          <div
            className={`
              mt-4 p-3 rounded-xl text-center font-medium animate-scale-in
              ${selectedAnswer === currentContent.answer
                ? "bg-emerald-100 text-emerald-700"
                : selectedAnswer === null
                ? "bg-amber-100 text-amber-700"
                : "bg-red-100 text-red-700"
              }
            `}
          >
            {selectedAnswer === currentContent.answer
              ? "נכון!"
              : selectedAnswer === null
              ? "נגמר הזמן!"
              : `לא נכון. התשובה הנכונה היא ${currentContent.answer}`}
          </div>
        )}
      </div>
    </div>
  );
}
