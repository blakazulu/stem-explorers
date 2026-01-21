"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useGameContent } from "@/lib/queries/games";
import { BridgeCanvas, type BridgeSegment } from "./BridgeCanvas";
import { MaterialPalette } from "./MaterialPalette";
import { BudgetDisplay } from "./BudgetDisplay";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Confetti } from "@/components/ui/Progress";
import { RotateCcw, Play, ArrowRight, Trophy, PartyPopper, AlertTriangle } from "lucide-react";
import type { Grade } from "@/types";
import type { Difficulty, BridgeContent, BridgeMaterial } from "@/types/games";

interface BridgeGameProps {
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
 * Main Bridge Building game component.
 * Build a bridge within budget that can support a vehicle crossing.
 */
export function BridgeGame({
  grade,
  difficulty,
  onScoreUpdate,
  onGameComplete,
}: BridgeGameProps) {
  // Fetch game content
  const {
    data: contentList = [],
    isLoading,
    error,
    refetch,
  } = useGameContent("bridge", grade, difficulty);

  // Shuffle content once when loaded
  const shuffledContent = useMemo(() => {
    if (contentList.length === 0) return [];
    return shuffleArray(contentList) as BridgeContent[];
  }, [contentList]);

  // Game state
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const [segments, setSegments] = useState<BridgeSegment[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<BridgeMaterial | null>(null);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);

  // Test mode state
  const [isTestMode, setIsTestMode] = useState(false);
  const [testProgress, setTestProgress] = useState(0);
  const [testResult, setTestResult] = useState<"success" | "failure" | null>(null);
  const [failurePoint, setFailurePoint] = useState<number | null>(null);
  const [failureReason, setFailureReason] = useState<string | null>(null);

  // Refs
  const hasNotifiedCompletion = useRef(false);
  const testIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Get current challenge content
  const currentContent = useMemo(() => {
    if (shuffledContent.length === 0) return null;
    return shuffledContent[currentChallengeIndex];
  }, [shuffledContent, currentChallengeIndex]);

  // Calculate number of positions based on gap width
  const numPositions = useMemo(() => {
    if (!currentContent) return 3;
    return Math.max(3, Math.ceil(currentContent.gapWidth / 20));
  }, [currentContent]);

  // Calculate spent budget
  const spentBudget = useMemo(() => {
    return segments.reduce((total, segment) => total + segment.material.cost, 0);
  }, [segments]);

  // Check if bridge is complete (all positions filled)
  const isBridgeComplete = useMemo(() => {
    if (!currentContent) return false;
    for (let i = 0; i < numPositions; i++) {
      if (!segments.find((s) => s.position === i)) return false;
    }
    return true;
  }, [segments, numPositions, currentContent]);

  // Calculate total strength at each position
  const calculateBridgeStrength = useCallback(() => {
    if (!currentContent) return [];
    const strengths: number[] = [];
    for (let i = 0; i < numPositions; i++) {
      const segment = segments.find((s) => s.position === i);
      strengths.push(segment ? segment.material.strength : 0);
    }
    return strengths;
  }, [segments, numPositions, currentContent]);

  // Reset challenge state when content changes
  useEffect(() => {
    if (currentContent) {
      setSegments([]);
      setSelectedMaterial(null);
      setAttempts(0);
      setShowCelebration(false);
      setGameComplete(false);
      setIsTestMode(false);
      setTestProgress(0);
      setTestResult(null);
      setFailurePoint(null);
      setFailureReason(null);
      hasNotifiedCompletion.current = false;
    }
  }, [currentContent?.id]);

  // Handle adding a segment
  const handleAddSegment = useCallback(
    (position: number) => {
      if (!selectedMaterial || !currentContent) return;
      if (segments.find((s) => s.position === position)) return;

      // Check budget
      if (spentBudget + selectedMaterial.cost > currentContent.budget) {
        // Over budget - don't allow
        return;
      }

      const newSegment: BridgeSegment = {
        id: `segment-${position}-${Date.now()}`,
        position,
        material: selectedMaterial,
      };

      setSegments((prev) => [...prev, newSegment]);
    },
    [selectedMaterial, currentContent, segments, spentBudget]
  );

  // Handle removing a segment
  const handleRemoveSegment = useCallback((segmentId: string) => {
    setSegments((prev) => prev.filter((s) => s.id !== segmentId));
  }, []);

  // Run bridge test
  const runBridgeTest = useCallback(() => {
    if (!currentContent || !isBridgeComplete) return;

    setIsTestMode(true);
    setTestProgress(0);
    setTestResult(null);
    setFailurePoint(null);
    setFailureReason(null);
    setAttempts((prev) => prev + 1);

    const strengths = calculateBridgeStrength();
    const vehicleWeight = currentContent.vehicleWeight;

    // Find the weakest point
    let weakestIndex = 0;
    let weakestStrength = strengths[0];
    for (let i = 1; i < strengths.length; i++) {
      if (strengths[i] < weakestStrength) {
        weakestStrength = strengths[i];
        weakestIndex = i;
      }
    }

    // Calculate failure point based on weight vs strength
    // Vehicle weight is distributed, so we check cumulative effect
    const failsAt = weakestStrength < vehicleWeight ? weakestIndex : null;

    // Animate vehicle crossing
    let progress = 0;
    const failureProgress = failsAt !== null ? ((failsAt + 0.5) / numPositions) * 100 : 100;

    testIntervalRef.current = setInterval(() => {
      progress += 2;
      setTestProgress(Math.min(progress, failureProgress));

      if (progress >= failureProgress) {
        if (testIntervalRef.current) {
          clearInterval(testIntervalRef.current);
        }

        if (failsAt !== null) {
          // Bridge failed
          setTestResult("failure");
          setFailurePoint(failsAt);
          const segment = segments.find((s) => s.position === failsAt);
          setFailureReason(
            segment
              ? `החומר "${getHebrewMaterialName(segment.material.type)}" בחוזק ${segment.material.strength} לא יכול לשאת משקל של ${vehicleWeight}kg`
              : "הגשר לא שלם"
          );
        } else {
          // Bridge succeeded
          setTestResult("success");
        }

        // Allow closing test mode after a delay
        setTimeout(() => {
          setIsTestMode(false);
        }, 1500);
      }
    }, 50);
  }, [currentContent, isBridgeComplete, calculateBridgeStrength, numPositions, segments]);

  // Clean up test interval on unmount
  useEffect(() => {
    return () => {
      if (testIntervalRef.current) {
        clearInterval(testIntervalRef.current);
      }
    };
  }, []);

  // Handle successful bridge
  useEffect(() => {
    if (testResult === "success" && !gameComplete && !hasNotifiedCompletion.current) {
      hasNotifiedCompletion.current = true;

      // Calculate score based on budget efficiency and attempts
      const budgetEfficiency = currentContent
        ? Math.round(((currentContent.budget - spentBudget) / currentContent.budget) * 50)
        : 0;
      const attemptBonus = attempts === 1 ? 50 : attempts === 2 ? 25 : 10;
      const finalScore = Math.max(0, Math.min(100, budgetEfficiency + attemptBonus));

      setScore(finalScore);
      setShowCelebration(true);
      setGameComplete(true);

      // Defer parent callbacks
      setTimeout(() => {
        onScoreUpdate(finalScore);
        onGameComplete(true);
      }, 0);
    }
  }, [testResult, gameComplete, currentContent, spentBudget, attempts, onScoreUpdate, onGameComplete]);

  // Handle next challenge
  const handleNextChallenge = useCallback(() => {
    const nextIndex = currentChallengeIndex + 1;
    if (nextIndex < shuffledContent.length) {
      setCurrentChallengeIndex(nextIndex);
    }
  }, [currentChallengeIndex, shuffledContent.length]);

  // Handle retry current challenge
  const handleRetry = useCallback(() => {
    setSegments([]);
    setSelectedMaterial(null);
    setIsTestMode(false);
    setTestProgress(0);
    setTestResult(null);
    setFailurePoint(null);
    setFailureReason(null);
    setShowCelebration(false);
    setGameComplete(false);
    hasNotifiedCompletion.current = false;
  }, []);

  // Handle restart game
  const handleRestart = useCallback(() => {
    setCurrentChallengeIndex(0);
    handleRetry();
    setAttempts(0);
    setScore(0);
    setTimeout(() => onScoreUpdate(0), 0);
  }, [handleRetry, onScoreUpdate]);

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4" dir="rtl">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6">
          <div className="flex flex-col items-center gap-6">
            <Skeleton variant="text" width={200} height={24} />
            <Skeleton variant="rectangular" className="h-64 w-full rounded-xl" />
            <div className="grid grid-cols-2 gap-4 w-full">
              <Skeleton variant="rectangular" className="h-40 rounded-xl" />
              <Skeleton variant="rectangular" className="h-40 rounded-xl" />
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
        icon="construction"
        title="אין תוכן זמין"
        description="עדיין לא נוספו אתגרי גשר עבור כיתה זו ורמת קושי זו."
        variant="stem"
      />
    );
  }

  const hasMoreChallenges = currentChallengeIndex < shuffledContent.length - 1;
  const canTest = isBridgeComplete && spentBudget <= currentContent.budget;

  return (
    <div className="w-full max-w-4xl mx-auto p-4" dir="rtl">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-4 sm:p-6">
        {/* Game stats */}
        <div className="flex items-center justify-center gap-4 mb-4 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg">
            <span className="text-sm font-medium">
              ניקוד: <span className="font-bold">{score}</span>
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg">
            <span className="text-sm font-medium">
              ניסיונות: <span className="font-bold">{attempts}</span>
            </span>
          </div>
        </div>

        {/* Main game area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Bridge canvas - takes 2 columns on large screens */}
          <div className="lg:col-span-2">
            <BridgeCanvas
              gapWidth={currentContent.gapWidth}
              segments={segments}
              selectedMaterial={selectedMaterial}
              vehicleWeight={currentContent.vehicleWeight}
              isTestMode={isTestMode}
              testProgress={testProgress}
              testResult={testResult}
              failurePoint={failurePoint}
              onAddSegment={handleAddSegment}
              onRemoveSegment={handleRemoveSegment}
              disabled={gameComplete || isTestMode}
            />
          </div>

          {/* Side panel */}
          <div className="space-y-4">
            <BudgetDisplay budget={currentContent.budget} spent={spentBudget} />
            <MaterialPalette
              materials={currentContent.materials || []}
              selectedMaterial={selectedMaterial}
              onSelectMaterial={setSelectedMaterial}
              disabled={gameComplete || isTestMode}
            />
          </div>
        </div>

        {/* Failure message */}
        {testResult === "failure" && failureReason && (
          <div className="mt-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl animate-fade-in">
            <div className="flex items-start gap-2">
              <AlertTriangle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <h4 className="font-bold text-red-700 mb-1">הגשר קרס!</h4>
                <p className="text-sm text-red-600">{failureReason}</p>
                <p className="text-sm text-red-600 mt-1">נסה חומרים חזקים יותר או תכנן את הגשר מחדש.</p>
              </div>
            </div>
          </div>
        )}

        {/* Success celebration */}
        {showCelebration && (
          <div className="mt-4 relative">
            <Confetti show={score >= 80} />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {score >= 80 ? (
                <Trophy size={48} className="text-amber-500 animate-bounce" />
              ) : (
                <PartyPopper size={48} className="text-orange-500 animate-bounce" />
              )}
            </div>
            <div className="bg-emerald-100 text-emerald-800 px-6 py-4 rounded-xl text-center animate-scale-in">
              <div className="text-xl font-bold mb-1">
                {score >= 80 ? "מושלם!" : "הגשר עמד בניסיון!"}
              </div>
              <div className="text-sm">
                בנית גשר חזק ויציב!
                {attempts === 1 && (
                  <span className="block text-emerald-600 font-medium mt-1">
                    +50 נקודות בונוס על ניסיון ראשון!
                  </span>
                )}
              </div>
              <div className="mt-2 text-emerald-600 font-bold text-lg">
                ניקוד סופי: {score}
              </div>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap justify-center gap-3 mt-6">
          {!gameComplete && !isTestMode && (
            <>
              <Button
                onClick={runBridgeTest}
                disabled={!canTest}
                variant="primary"
                leftIcon={Play}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                בדוק את הגשר
              </Button>
              {segments.length > 0 && (
                <Button
                  onClick={handleRetry}
                  variant="outline"
                  leftIcon={RotateCcw}
                >
                  נקה ובנה מחדש
                </Button>
              )}
            </>
          )}

          {testResult === "failure" && !isTestMode && (
            <Button
              onClick={handleRetry}
              variant="primary"
              leftIcon={RotateCcw}
              className="bg-orange-600 hover:bg-orange-700"
            >
              נסה שוב
            </Button>
          )}

          {gameComplete && (
            <>
              {hasMoreChallenges ? (
                <Button
                  onClick={handleNextChallenge}
                  variant="primary"
                  rightIcon={ArrowRight}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  אתגר הבא
                </Button>
              ) : (
                <Button
                  onClick={handleRestart}
                  variant="primary"
                  leftIcon={RotateCcw}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  שחק שוב
                </Button>
              )}
            </>
          )}
        </div>

        {/* Progress indicator */}
        <div className="mt-6 text-center text-sm text-gray-500">
          אתגר {currentChallengeIndex + 1} מתוך {shuffledContent.length}
        </div>
      </div>
    </div>
  );
}

// Helper function for Hebrew material names
function getHebrewMaterialName(type: string): string {
  const names: Record<string, string> = {
    wood: "עץ",
    steel: "פלדה",
    rope: "חבל",
    concrete: "בטון",
    bamboo: "במבוק",
    plastic: "פלסטיק",
    stone: "אבן",
    carbon: "סיב פחמן",
  };
  return names[type] || type;
}
