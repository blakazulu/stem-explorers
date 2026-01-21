"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useGameContent } from "@/lib/queries/games";
import { SortBucket } from "./SortBucket";
import { SortableItem } from "./SortableItem";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Confetti } from "@/components/ui/Progress";
import { RotateCcw, PartyPopper, Trophy, ArrowRight, Timer } from "lucide-react";
import type { Grade } from "@/types";
import type { Difficulty, SortContent, SortItem } from "@/types/games";

interface SortGameProps {
  grade: Grade;
  difficulty: Difficulty;
  onScoreUpdate: (score: number) => void;
  onGameComplete: (won: boolean) => void;
}

/** Item state for tracking placement */
interface ItemState {
  id: string;
  text: string;
  correctBucket: string;
  currentBucket: string | null; // null = in pool
  isCorrect: boolean;
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
 * Create item states from sort items
 */
function createItemStates(items: SortItem[]): ItemState[] {
  const timestamp = Date.now();
  return shuffleArray(
    items.map((item, index) => ({
      id: `item-${index}-${timestamp}`,
      text: item.text,
      correctBucket: item.correctBucket,
      currentBucket: null,
      isCorrect: false,
    }))
  );
}

/**
 * Main Sort game component.
 * Drag and drop items into the correct category buckets.
 */
export function SortGame({
  grade,
  difficulty,
  onScoreUpdate,
  onGameComplete,
}: SortGameProps) {
  // Fetch game content
  const {
    data: contentList = [],
    isLoading,
    error,
    refetch,
  } = useGameContent("sort", grade, difficulty);

  // Shuffle content once when loaded
  const shuffledContent = useMemo(() => {
    if (contentList.length === 0) return [];
    return shuffleArray(contentList) as SortContent[];
  }, [contentList]);

  // Game state
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [itemStates, setItemStates] = useState<ItemState[]>([]);
  const [score, setScore] = useState(100);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [shakeItemId, setShakeItemId] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);

  // Refs
  const hasNotifiedCompletion = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Get current puzzle content
  const currentContent = useMemo(() => {
    if (shuffledContent.length === 0) return null;
    return shuffledContent[currentPuzzleIndex];
  }, [shuffledContent, currentPuzzleIndex]);

  // Initialize items when content changes
  useEffect(() => {
    if (currentContent?.items) {
      setItemStates(createItemStates(currentContent.items));
      setScore(100);
      setWrongAttempts(0);
      setShowCelebration(false);
      setGameComplete(false);
      hasNotifiedCompletion.current = false;
      setStartTime(Date.now());
      setElapsedTime(0);
    }
  }, [currentContent?.id, currentContent?.items]);

  // Timer effect
  useEffect(() => {
    if (gameComplete || !currentContent) return;

    timerRef.current = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [startTime, gameComplete, currentContent]);

  // Configure sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    })
  );

  // Get items in pool (not placed in any bucket)
  const poolItems = useMemo(() => {
    return itemStates.filter((item) => item.currentBucket === null);
  }, [itemStates]);

  // Get items in each bucket
  const bucketItems = useMemo(() => {
    const buckets: Record<string, ItemState[]> = {};
    currentContent?.buckets.forEach((bucket) => {
      buckets[bucket] = itemStates.filter(
        (item) => item.currentBucket === bucket
      );
    });
    return buckets;
  }, [itemStates, currentContent?.buckets]);

  // Check for puzzle completion
  useEffect(() => {
    if (!currentContent || gameComplete || itemStates.length === 0) return;

    const allCorrect = itemStates.every((item) => item.isCorrect);
    const allPlaced = itemStates.every((item) => item.currentBucket !== null);

    if (allCorrect && allPlaced && !hasNotifiedCompletion.current) {
      hasNotifiedCompletion.current = true;

      // Calculate final score with time bonus
      let finalScore = score;
      if (elapsedTime < 60) {
        finalScore += 20; // Speed bonus
      }
      finalScore = Math.max(0, finalScore);

      setScore(finalScore);
      setShowCelebration(true);
      setGameComplete(true);

      // Stop timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      // Defer parent callbacks to avoid setState during render
      setTimeout(() => {
        onScoreUpdate(finalScore);
        onGameComplete(true);
      }, 0);
    }
  }, [
    itemStates,
    currentContent,
    gameComplete,
    score,
    elapsedTime,
    onScoreUpdate,
    onGameComplete,
  ]);

  // Handle drag start
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  // Handle drag end
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);

      if (!over || !currentContent) return;

      const itemId = active.id as string;
      const targetBucket = over.id as string;

      // Find the item
      const item = itemStates.find((i) => i.id === itemId);
      if (!item) return;

      // If already correctly placed, don't allow moving
      if (item.isCorrect) return;

      // Check if dropped on a valid bucket
      if (!currentContent.buckets.includes(targetBucket)) return;

      // Check if correct placement
      const isCorrect = item.correctBucket === targetBucket;

      if (isCorrect) {
        // Correct placement
        setItemStates((prev) =>
          prev.map((i) =>
            i.id === itemId
              ? { ...i, currentBucket: targetBucket, isCorrect: true }
              : i
          )
        );
      } else {
        // Wrong placement - shake and return to pool
        setShakeItemId(itemId);
        setWrongAttempts((prev) => prev + 1);

        // Deduct points
        setScore((prev) => Math.max(0, prev - 5));

        // Clear shake after animation
        setTimeout(() => {
          setShakeItemId(null);
        }, 500);
      }
    },
    [itemStates, currentContent]
  );

  // Handle next puzzle
  const handleNextPuzzle = useCallback(() => {
    const nextIndex = currentPuzzleIndex + 1;
    if (nextIndex < shuffledContent.length) {
      setCurrentPuzzleIndex(nextIndex);
    }
  }, [currentPuzzleIndex, shuffledContent.length]);

  // Handle restart game
  const handleRestart = useCallback(() => {
    setCurrentPuzzleIndex(0);
    setScore(100);
    setWrongAttempts(0);
    // Defer callback
    setTimeout(() => onScoreUpdate(0), 0);
  }, [onScoreUpdate]);

  // Get active item for drag overlay
  const activeItem = useMemo(() => {
    if (!activeId) return null;
    return itemStates.find((item) => item.id === activeId);
  }, [activeId, itemStates]);

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full max-w-3xl mx-auto p-4" dir="rtl">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6">
          <div className="flex flex-col items-center gap-6">
            <Skeleton variant="text" width={200} height={24} />
            <div className="grid grid-cols-2 gap-4 w-full">
              {[1, 2].map((i) => (
                <Skeleton
                  key={i}
                  variant="rectangular"
                  className="h-40 rounded-xl"
                />
              ))}
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton
                  key={i}
                  variant="rectangular"
                  width={80}
                  height={36}
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
        icon="git-merge"
        title="אין תוכן זמין"
        description="עדיין לא נוספו משימות מיון עבור כיתה זו ורמת קושי זו."
        variant="stem"
      />
    );
  }

  const hasMorePuzzles = currentPuzzleIndex < shuffledContent.length - 1;
  const totalItems = itemStates.length;
  const correctItems = itemStates.filter((i) => i.isCorrect).length;

  return (
    <div className="w-full max-w-3xl mx-auto p-4" dir="rtl">
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-4 sm:p-6">
          {/* Game stats */}
          <div className="flex items-center justify-center gap-4 mb-6 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-violet-100 text-violet-700 rounded-lg">
              <span className="text-sm font-medium">
                ניקוד: <span className="font-bold">{score}</span>
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
              <span className="text-sm font-medium">
                מוינו: <span className="font-bold">{correctItems}</span>/
                {totalItems}
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg">
              <Timer size={14} />
              <span className="text-sm font-medium">{formatTime(elapsedTime)}</span>
            </div>
            {wrongAttempts > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg">
                <span className="text-sm font-medium">
                  טעויות: <span className="font-bold">{wrongAttempts}</span>
                </span>
              </div>
            )}
          </div>

          {/* Buckets grid */}
          <div
            className={`
              grid gap-4 mb-6
              ${
                currentContent.buckets.length <= 2
                  ? "grid-cols-1 sm:grid-cols-2"
                  : currentContent.buckets.length === 3
                  ? "grid-cols-1 sm:grid-cols-3"
                  : "grid-cols-2 sm:grid-cols-4"
              }
            `}
          >
            {currentContent.buckets.map((bucket) => (
              <SortBucket
                key={bucket}
                id={bucket}
                name={bucket}
                itemCount={bucketItems[bucket]?.length || 0}
              >
                {bucketItems[bucket]?.map((item) => (
                  <SortableItem
                    key={item.id}
                    id={item.id}
                    text={item.text}
                    isCorrect={item.isCorrect}
                    disabled={item.isCorrect || gameComplete}
                  />
                ))}
              </SortBucket>
            ))}
          </div>

          {/* Item pool */}
          {!gameComplete && poolItems.length > 0 && (
            <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
              <h4 className="text-sm font-medium text-gray-600 mb-3 text-center">
                גרור את הפריטים לקטגוריה המתאימה
              </h4>
              <div className="flex flex-wrap gap-2 justify-center">
                {poolItems.map((item) => (
                  <SortableItem
                    key={item.id}
                    id={item.id}
                    text={item.text}
                    isWrong={shakeItemId === item.id}
                    disabled={gameComplete}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Celebration message */}
          {showCelebration && (
            <div className="mt-6 relative">
              <Confetti show={score >= 80} />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {score >= 80 ? (
                  <Trophy size={48} className="text-amber-500 animate-bounce" />
                ) : (
                  <PartyPopper
                    size={48}
                    className="text-violet-500 animate-bounce"
                  />
                )}
              </div>
              <div className="bg-violet-100 text-violet-800 px-6 py-4 rounded-xl text-center animate-scale-in">
                <div className="text-xl font-bold mb-1">
                  {score >= 80 ? "מושלם!" : "כל הכבוד!"}
                </div>
                <div className="text-sm">
                  מיינת את כל הפריטים בהצלחה!
                  {elapsedTime < 60 && (
                    <span className="block text-emerald-600 font-medium mt-1">
                      +20 נקודות בונוס על מהירות!
                    </span>
                  )}
                </div>
                <div className="mt-2 text-violet-600 font-bold text-lg">
                  ניקוד סופי: {score}
                </div>
              </div>
            </div>
          )}

          {/* Action buttons when game is complete */}
          {gameComplete && (
            <div className="flex flex-wrap justify-center gap-3 mt-6">
              {hasMorePuzzles ? (
                <Button
                  onClick={handleNextPuzzle}
                  variant="primary"
                  rightIcon={ArrowRight}
                  className="bg-violet-600 hover:bg-violet-700"
                >
                  משחק הבא
                </Button>
              ) : (
                <Button
                  onClick={handleRestart}
                  variant="primary"
                  leftIcon={RotateCcw}
                  className="bg-violet-600 hover:bg-violet-700"
                >
                  שחק שוב
                </Button>
              )}
            </div>
          )}

          {/* Progress indicator */}
          <div className="mt-6 text-center text-sm text-gray-500">
            משחק {currentPuzzleIndex + 1} מתוך {shuffledContent.length}
          </div>
        </div>

        {/* Drag overlay */}
        <DragOverlay>
          {activeItem ? (
            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm bg-violet-200 text-violet-800 shadow-lg scale-105">
              <span>{activeItem.text}</span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
