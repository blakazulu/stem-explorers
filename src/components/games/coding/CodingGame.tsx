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
import { CodingGrid, type GridPosition } from "./CodingGrid";
import { CommandPalette, type CommandType, COMMAND_INFO } from "./CommandPalette";
import { CommandSequence, type Command } from "./CommandSequence";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Confetti } from "@/components/ui/Progress";
import { RotateCcw, PartyPopper, Trophy, ArrowRight, Timer } from "lucide-react";
import type { Grade } from "@/types";
import type { Difficulty, CodingContent } from "@/types/games";

interface CodingGameProps {
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
 * Main Coding Puzzles game component.
 * Guide a robot through a grid using visual programming commands.
 */
export function CodingGame({
  grade,
  difficulty,
  onScoreUpdate,
  onGameComplete,
}: CodingGameProps) {
  // Fetch game content
  const {
    data: contentList = [],
    isLoading,
    error,
    refetch,
  } = useGameContent("coding", grade, difficulty);

  // Shuffle content once when loaded
  const shuffledContent = useMemo(() => {
    if (contentList.length === 0) return [];
    return shuffleArray(contentList) as CodingContent[];
  }, [contentList]);

  // Game state
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [commands, setCommands] = useState<Command[]>([]);
  const [robotPosition, setRobotPosition] = useState<GridPosition>({ x: 0, y: 0 });
  const [robotDirection, setRobotDirection] = useState<"up" | "down" | "left" | "right">("up");
  const [isRunning, setIsRunning] = useState(false);
  const [currentExecutingIndex, setCurrentExecutingIndex] = useState<number | null>(null);
  const [showError, setShowError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [score, setScore] = useState(100);
  const [attempts, setAttempts] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
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

  // Initialize puzzle when content changes
  useEffect(() => {
    if (currentContent) {
      setRobotPosition({ ...currentContent.start });
      setRobotDirection("up");
      setCommands([]);
      setIsRunning(false);
      setCurrentExecutingIndex(null);
      setShowError(false);
      setShowSuccess(false);
      setScore(100);
      setAttempts(0);
      setShowCelebration(false);
      setGameComplete(false);
      hasNotifiedCompletion.current = false;
      setStartTime(Date.now());
      setElapsedTime(0);
    }
  }, [currentContent?.id]);

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

  // Check if a position is valid (within bounds and not an obstacle)
  const isValidPosition = useCallback(
    (pos: GridPosition): boolean => {
      if (!currentContent) return false;

      const { gridSize, obstacles } = currentContent;

      // Check bounds
      if (pos.x < 0 || pos.x >= gridSize || pos.y < 0 || pos.y >= gridSize) {
        return false;
      }

      // Check obstacles
      return !obstacles.some((obs) => obs.x === pos.x && obs.y === pos.y);
    },
    [currentContent]
  );

  // Check if position is the goal
  const isGoalPosition = useCallback(
    (pos: GridPosition): boolean => {
      if (!currentContent) return false;
      return pos.x === currentContent.goal.x && pos.y === currentContent.goal.y;
    },
    [currentContent]
  );

  // Execute commands one by one
  const executeCommands = useCallback(async () => {
    if (!currentContent || commands.length === 0) return;

    setIsRunning(true);
    setAttempts((prev) => prev + 1);

    let currentPos = { ...currentContent.start };
    let hitError = false;

    for (let i = 0; i < commands.length; i++) {
      setCurrentExecutingIndex(i);

      const cmd = commands[i];
      let newPos = { ...currentPos };
      let newDirection: "up" | "down" | "left" | "right" = robotDirection;

      // Calculate new position based on command
      switch (cmd.type) {
        case "up":
          newPos.y = currentPos.y - 1;
          newDirection = "up";
          break;
        case "down":
          newPos.y = currentPos.y + 1;
          newDirection = "down";
          break;
        case "left":
          newPos.x = currentPos.x - 1;
          newDirection = "left";
          break;
        case "right":
          newPos.x = currentPos.x + 1;
          newDirection = "right";
          break;
        // Loop and conditional would need more complex handling
        default:
          break;
      }

      // Animate direction change
      setRobotDirection(newDirection);

      // Wait for animation
      await new Promise((resolve) => setTimeout(resolve, 400));

      // Check if new position is valid
      if (!isValidPosition(newPos)) {
        // Hit wall or obstacle
        setShowError(true);
        hitError = true;

        // Deduct points
        setScore((prev) => Math.max(0, prev - 15));

        // Wait then reset
        await new Promise((resolve) => setTimeout(resolve, 800));
        setShowError(false);
        setRobotPosition({ ...currentContent.start });
        setRobotDirection("up");
        break;
      }

      // Move robot
      setRobotPosition(newPos);
      currentPos = newPos;

      // Check if reached goal
      if (isGoalPosition(newPos)) {
        setShowSuccess(true);

        // Calculate final score
        let finalScore = score;
        if (attempts === 0) {
          finalScore += 20; // First try bonus
        }
        if (elapsedTime < 30) {
          finalScore += 10; // Speed bonus
        }
        if (commands.length <= currentContent.maxMoves - 2) {
          finalScore += 10; // Efficiency bonus
        }
        finalScore = Math.max(0, Math.min(150, finalScore));

        setScore(finalScore);
        setShowCelebration(true);
        setGameComplete(true);

        // Stop timer
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }

        // Defer parent callbacks
        if (!hasNotifiedCompletion.current) {
          hasNotifiedCompletion.current = true;
          setTimeout(() => {
            onScoreUpdate(finalScore);
            onGameComplete(true);
          }, 0);
        }

        break;
      }

      // Pause between commands
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    setIsRunning(false);
    setCurrentExecutingIndex(null);

    // If finished all commands but didn't reach goal
    if (!hitError && !isGoalPosition(currentPos)) {
      setShowError(true);
      setScore((prev) => Math.max(0, prev - 10));
      await new Promise((resolve) => setTimeout(resolve, 600));
      setShowError(false);
    }
  }, [
    commands,
    currentContent,
    robotDirection,
    isValidPosition,
    isGoalPosition,
    score,
    attempts,
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

      const activeData = active.data.current as { type: CommandType; fromPalette?: boolean; fromSequence?: boolean; index?: number };

      // Dropping on the sequence area
      if (over.id === "command-sequence") {
        if (activeData.fromPalette) {
          // Add new command from palette
          const newCommand: Command = {
            id: `cmd-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
            type: activeData.type,
          };
          setCommands((prev) => [...prev, newCommand]);
        }
      }
    },
    [currentContent]
  );

  // Handle removing a command from sequence
  const handleRemoveCommand = useCallback((index: number) => {
    setCommands((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Handle clearing all commands
  const handleClearAll = useCallback(() => {
    setCommands([]);
  }, []);

  // Handle reset puzzle
  const handleReset = useCallback(() => {
    if (!currentContent) return;
    setRobotPosition({ ...currentContent.start });
    setRobotDirection("up");
    setShowError(false);
    setShowSuccess(false);
  }, [currentContent]);

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
    setAttempts(0);
    // Defer callback
    setTimeout(() => onScoreUpdate(0), 0);
  }, [onScoreUpdate]);

  // Get active command info for drag overlay
  const activeCommand = useMemo(() => {
    if (!activeId) return null;
    const type = activeId.split("-")[1] as CommandType;
    if (type && COMMAND_INFO[type]) {
      return COMMAND_INFO[type];
    }
    return null;
  }, [activeId]);

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4" dir="rtl">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <Skeleton variant="rectangular" className="h-64 rounded-xl" />
            </div>
            <div className="w-full lg:w-80 space-y-4">
              <Skeleton variant="rectangular" className="h-32 rounded-xl" />
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
        icon="code"
        title="אין תוכן זמין"
        description="עדיין לא נוספו חידות תכנות עבור כיתה זו ורמת קושי זו."
        variant="stem"
      />
    );
  }

  const hasMorePuzzles = currentPuzzleIndex < shuffledContent.length - 1;

  return (
    <div className="w-full max-w-4xl mx-auto p-4" dir="rtl">
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-4 sm:p-6">
          {/* Game stats */}
          <div className="flex items-center justify-center gap-4 mb-6 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-cyan-100 text-cyan-700 rounded-lg">
              <span className="text-sm font-medium">
                ניקוד: <span className="font-bold">{score}</span>
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg">
              <Timer size={14} />
              <span className="text-sm font-medium">{formatTime(elapsedTime)}</span>
            </div>
            {attempts > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg">
                <span className="text-sm font-medium">
                  ניסיונות: <span className="font-bold">{attempts}</span>
                </span>
              </div>
            )}
          </div>

          {/* Main game area */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Grid area */}
            <div className="flex-1 flex flex-col items-center">
              <CodingGrid
                gridSize={currentContent.gridSize}
                robotPosition={robotPosition}
                goalPosition={currentContent.goal}
                obstacles={currentContent.obstacles}
                robotDirection={robotDirection}
                isAnimating={isRunning}
                showError={showError}
                showSuccess={showSuccess}
              />

              {/* Reset button */}
              {!gameComplete && (
                <Button
                  onClick={handleReset}
                  variant="ghost"
                  leftIcon={RotateCcw}
                  className="mt-4 text-gray-600"
                  disabled={isRunning}
                >
                  אפס מיקום
                </Button>
              )}
            </div>

            {/* Controls area */}
            <div className="w-full lg:w-80 space-y-4">
              {!gameComplete && (
                <>
                  <CommandPalette
                    allowLoops={currentContent.allowLoops}
                    allowConditionals={currentContent.allowConditionals}
                    disabled={isRunning}
                  />

                  <CommandSequence
                    commands={commands}
                    currentExecutingIndex={currentExecutingIndex}
                    maxMoves={currentContent.maxMoves}
                    onRemoveCommand={handleRemoveCommand}
                    onClearAll={handleClearAll}
                    onRun={executeCommands}
                    isRunning={isRunning}
                    disabled={isRunning}
                  />
                </>
              )}

              {/* Celebration message */}
              {showCelebration && (
                <div className="relative">
                  <Confetti show={score >= 80} />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    {score >= 100 ? (
                      <Trophy size={48} className="text-amber-500 animate-bounce" />
                    ) : (
                      <PartyPopper size={48} className="text-cyan-500 animate-bounce" />
                    )}
                  </div>
                  <div className="bg-cyan-100 text-cyan-800 px-6 py-4 rounded-xl text-center animate-scale-in">
                    <div className="text-xl font-bold mb-1">
                      {score >= 100 ? "מושלם!" : "כל הכבוד!"}
                    </div>
                    <div className="text-sm">
                      הרובוט הגיע ליעד!
                      {attempts === 1 && (
                        <span className="block text-emerald-600 font-medium mt-1">
                          +20 נקודות בונוס - ניסיון ראשון!
                        </span>
                      )}
                    </div>
                    <div className="mt-2 text-cyan-600 font-bold text-lg">
                      ניקוד סופי: {score}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action buttons when game is complete */}
          {gameComplete && (
            <div className="flex flex-wrap justify-center gap-3 mt-6">
              {hasMorePuzzles ? (
                <Button
                  onClick={handleNextPuzzle}
                  variant="primary"
                  rightIcon={ArrowRight}
                  className="bg-cyan-600 hover:bg-cyan-700"
                >
                  חידה הבאה
                </Button>
              ) : (
                <Button
                  onClick={handleRestart}
                  variant="primary"
                  leftIcon={RotateCcw}
                  className="bg-cyan-600 hover:bg-cyan-700"
                >
                  שחק שוב
                </Button>
              )}
            </div>
          )}

          {/* Progress indicator */}
          <div className="mt-6 text-center text-sm text-gray-500">
            חידה {currentPuzzleIndex + 1} מתוך {shuffledContent.length}
          </div>
        </div>

        {/* Drag overlay */}
        <DragOverlay>
          {activeCommand ? (
            <div
              className={`
                flex items-center justify-center gap-2
                px-4 py-3 rounded-xl border-2 shadow-lg scale-110
                ${activeCommand.bgColor} ${activeCommand.borderColor}
              `}
            >
              <activeCommand.icon size={20} className={activeCommand.color} />
              <span className={`text-sm font-medium ${activeCommand.color}`}>
                {activeCommand.nameHe}
              </span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
