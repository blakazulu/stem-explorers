"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useGameContent } from "@/lib/queries/games";
import { ExperimentHeader } from "./ExperimentHeader";
import { ExperimentStep } from "./ExperimentStep";
import { ExperimentConclusion } from "./ExperimentConclusion";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { ArrowRight, ArrowLeft, RotateCcw, Play, Send } from "lucide-react";
import type { Grade } from "@/types";
import type { Difficulty, ExperimentContent } from "@/types/games";

interface ExperimentGameProps {
  grade: Grade;
  difficulty: Difficulty;
  onScoreUpdate: (score: number) => void;
  onGameComplete: (won: boolean) => void;
}

/** Game phases */
type GamePhase = "hypothesis" | "steps" | "conclusion";

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
 * Main Experiment game component.
 * Science experiment simulation - follow steps to conduct virtual experiments.
 */
export function ExperimentGame({
  grade,
  difficulty,
  onScoreUpdate,
  onGameComplete,
}: ExperimentGameProps) {
  // Fetch game content
  const {
    data: contentList = [],
    isLoading,
    error,
    refetch,
  } = useGameContent("experiment", grade, difficulty);

  // Shuffle content once when loaded
  const shuffledContent = useMemo(() => {
    if (contentList.length === 0) return [];
    return shuffleArray(contentList) as ExperimentContent[];
  }, [contentList]);

  // Game state
  const [currentExperimentIndex, setCurrentExperimentIndex] = useState(0);
  const [phase, setPhase] = useState<GamePhase>("hypothesis");
  const [hypothesis, setHypothesis] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [score, setScore] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);

  // Refs
  const hasNotifiedCompletion = useRef(false);

  // Get current experiment content
  const currentContent = useMemo(() => {
    if (shuffledContent.length === 0) return null;
    return shuffledContent[currentExperimentIndex];
  }, [shuffledContent, currentExperimentIndex]);

  // Reset state when content changes
  useEffect(() => {
    if (currentContent) {
      setPhase("hypothesis");
      setHypothesis("");
      setCurrentStep(0);
      setScore(0);
      setGameComplete(false);
      hasNotifiedCompletion.current = false;
    }
  }, [currentContent?.id]);

  // Calculate score for completing a step
  const calculateStepScore = useCallback(() => {
    return 10; // +10 per step completed
  }, []);

  // Calculate bonus for hypothesis quality (simple heuristic)
  const calculateHypothesisBonus = useCallback((text: string) => {
    // Bonus for providing a hypothesis
    if (!text || text.trim().length === 0) return 0;
    // More detailed hypothesis gets higher bonus
    const wordCount = text.trim().split(/\s+/).length;
    if (wordCount >= 10) return 30; // Great hypothesis
    if (wordCount >= 5) return 20; // Good hypothesis
    return 10; // Basic hypothesis
  }, []);

  // Handle hypothesis submission
  const handleHypothesisSubmit = useCallback(() => {
    if (!hypothesis.trim()) {
      // Allow skipping hypothesis but no bonus
      setPhase("steps");
      return;
    }

    const bonus = calculateHypothesisBonus(hypothesis);
    const newScore = score + bonus;
    setScore(newScore);

    // Defer parent callback
    setTimeout(() => onScoreUpdate(newScore), 0);

    setPhase("steps");
  }, [hypothesis, score, calculateHypothesisBonus, onScoreUpdate]);

  // Handle moving to next step
  const handleNextStep = useCallback(() => {
    if (!currentContent) return;

    const stepScore = calculateStepScore();
    const newScore = score + stepScore;
    setScore(newScore);

    // Defer parent callback
    setTimeout(() => onScoreUpdate(newScore), 0);

    if (currentStep < currentContent.steps.length - 1) {
      // Move to next step
      setCurrentStep((prev) => prev + 1);
    } else {
      // All steps completed, move to conclusion
      setPhase("conclusion");
      setGameComplete(true);
      hasNotifiedCompletion.current = true;

      // Notify parent of completion
      setTimeout(() => onGameComplete(true), 0);
    }
  }, [currentContent, currentStep, score, calculateStepScore, onScoreUpdate, onGameComplete]);

  // Handle previous step (for navigation)
  const handlePrevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  // Handle next experiment
  const handleNextExperiment = useCallback(() => {
    const nextIndex = currentExperimentIndex + 1;
    if (nextIndex < shuffledContent.length) {
      setCurrentExperimentIndex(nextIndex);
    }
  }, [currentExperimentIndex, shuffledContent.length]);

  // Handle restart
  const handleRestart = useCallback(() => {
    setCurrentExperimentIndex(0);
    setPhase("hypothesis");
    setHypothesis("");
    setCurrentStep(0);
    setScore(0);
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
            <Skeleton variant="text" width={200} height={28} />
            <Skeleton variant="rectangular" className="w-full h-32 rounded-xl" />
            <div className="space-y-3 w-full">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} variant="rectangular" className="h-16 rounded-xl" />
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
        title="שגיאה בטעינת הניסוי"
        description="לא הצלחנו לטעון את תוכן הניסוי. נסו שוב."
        action={{ label: "נסה שוב", onClick: () => refetch() }}
      />
    );
  }

  // No content available
  if (!currentContent) {
    return (
      <EmptyState
        icon="flask"
        title="אין ניסויים זמינים"
        description="עדיין לא נוספו ניסויים עבור כיתה זו ורמת קושי זו."
        variant="stem"
      />
    );
  }

  const hasMoreExperiments = currentExperimentIndex < shuffledContent.length - 1;
  const totalSteps = currentContent.steps.length;

  return (
    <div className="w-full max-w-2xl mx-auto p-4" dir="rtl">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-4 sm:p-6">
        {/* Score and progress */}
        <div className="flex items-center justify-center gap-4 mb-6 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg">
            <span className="text-sm font-medium">
              ניקוד: <span className="font-bold">{score}</span>
            </span>
          </div>
          {phase === "steps" && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
              <span className="text-sm font-medium">
                שלב: <span className="font-bold">{currentStep + 1}</span>/{totalSteps}
              </span>
            </div>
          )}
        </div>

        {/* Phase: Hypothesis */}
        {phase === "hypothesis" && (
          <div className="space-y-6">
            <ExperimentHeader
              title={currentContent.title}
              hypothesisPrompt={currentContent.hypothesisPrompt}
              imageUrl={currentContent.imageUrl}
            />

            {/* Hypothesis input */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                מה לדעתך יקרה? כתוב את ההשערה שלך:
              </label>
              <textarea
                value={hypothesis}
                onChange={(e) => setHypothesis(e.target.value)}
                placeholder="לדעתי..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                rows={3}
                dir="rtl"
              />
              <p className="text-xs text-gray-500">
                * ניתן להשאיר ריק ולדלג, אבל כתיבת השערה מפורטת מזכה בנקודות בונוס!
              </p>
            </div>

            {/* Start experiment button */}
            <div className="flex justify-center">
              <Button
                onClick={handleHypothesisSubmit}
                variant="primary"
                rightIcon={Play}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                התחל את הניסוי
              </Button>
            </div>
          </div>
        )}

        {/* Phase: Steps */}
        {phase === "steps" && (
          <div className="space-y-4">
            {/* Experiment title reminder */}
            <div className="text-center mb-4">
              <h3 className="text-lg font-rubik font-bold text-gray-800">
                {currentContent.title}
              </h3>
            </div>

            {/* Steps list */}
            <div className="space-y-3">
              {currentContent.steps.map((step, index) => (
                <ExperimentStep
                  key={index}
                  stepNumber={index + 1}
                  instruction={step.instruction}
                  imageUrl={step.imageUrl}
                  isCompleted={index < currentStep}
                  isCurrent={index === currentStep}
                />
              ))}
            </div>

            {/* Navigation buttons */}
            <div className="flex justify-center gap-3 mt-6">
              {currentStep > 0 && (
                <Button
                  onClick={handlePrevStep}
                  variant="outline"
                  leftIcon={ArrowRight}
                >
                  שלב קודם
                </Button>
              )}
              <Button
                onClick={handleNextStep}
                variant="primary"
                rightIcon={currentStep === totalSteps - 1 ? Send : ArrowLeft}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {currentStep === totalSteps - 1 ? "סיים את הניסוי" : "שלב הבא"}
              </Button>
            </div>
          </div>
        )}

        {/* Phase: Conclusion */}
        {phase === "conclusion" && (
          <div className="space-y-6">
            <ExperimentConclusion
              conclusion={currentContent.conclusion}
              hypothesis={hypothesis}
              score={score}
            />

            {/* Action buttons */}
            <div className="flex flex-wrap justify-center gap-3">
              {hasMoreExperiments ? (
                <Button
                  onClick={handleNextExperiment}
                  variant="primary"
                  rightIcon={ArrowLeft}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  ניסוי הבא
                </Button>
              ) : (
                <Button
                  onClick={handleRestart}
                  variant="primary"
                  leftIcon={RotateCcw}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  שחק שוב
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Progress indicator */}
        <div className="mt-6 text-center text-sm text-gray-500">
          ניסוי {currentExperimentIndex + 1} מתוך {shuffledContent.length}
        </div>
      </div>
    </div>
  );
}
