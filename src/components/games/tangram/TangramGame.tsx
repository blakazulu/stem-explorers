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
import { TangramCanvas, TARGET_SHAPES } from "./TangramCanvas";
import { TANGRAM_PIECE_SHAPES, TANGRAM_COLORS } from "./TangramPiece";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Confetti } from "@/components/ui/Progress";
import { RotateCcw, PartyPopper, Trophy, ArrowRight, Timer, Lightbulb, Eye } from "lucide-react";
import type { Grade } from "@/types";
import type { Difficulty, TangramContent, TangramPiece as TangramPieceType } from "@/types/games";

interface TangramGameProps {
  grade: Grade;
  difficulty: Difficulty;
  onScoreUpdate: (score: number) => void;
  onGameComplete: (won: boolean) => void;
}

/** Piece state for tracking position and rotation */
interface PieceState {
  id: string;
  type: string;
  color: string;
  position: { x: number; y: number };
  rotation: number;
  initialPosition: { x: number; y: number };
  initialRotation: number;
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
 * Create piece states from tangram content
 */
function createPieceStates(pieces: TangramPieceType[], canvasWidth: number): PieceState[] {
  const timestamp = Date.now();
  // Position pieces at the bottom area
  const startY = 280;
  const startX = 20;
  const spacing = 80;

  return pieces.map((piece, index) => {
    const x = startX + (index % 4) * spacing;
    const y = startY + Math.floor(index / 4) * 60;
    return {
      id: `piece-${index}-${timestamp}`,
      type: piece.type,
      color: piece.color || TANGRAM_COLORS[index % TANGRAM_COLORS.length],
      position: { x, y },
      rotation: 0, // Start with no rotation
      initialPosition: piece.initialPosition,
      initialRotation: piece.initialRotation,
      isCorrect: false,
    };
  });
}

/**
 * Main Tangram game component.
 * Arrange geometric pieces to match a target shape.
 */
export function TangramGame({
  grade,
  difficulty,
  onScoreUpdate,
  onGameComplete,
}: TangramGameProps) {
  // Fetch game content
  const {
    data: contentList = [],
    isLoading,
    error,
    refetch,
  } = useGameContent("tangram", grade, difficulty);

  // Shuffle content once when loaded
  const shuffledContent = useMemo(() => {
    if (contentList.length === 0) return [];
    return shuffleArray(contentList) as TangramContent[];
  }, [contentList]);

  // Game state
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [pieceStates, setPieceStates] = useState<PieceState[]>([]);
  const [score, setScore] = useState(100);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [hintedPieceId, setHintedPieceId] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);

  // Refs
  const hasNotifiedCompletion = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Get current puzzle content
  const currentContent = useMemo(() => {
    if (shuffledContent.length === 0) return null;
    return shuffledContent[currentPuzzleIndex];
  }, [shuffledContent, currentPuzzleIndex]);

  // Initialize pieces when content changes
  useEffect(() => {
    if (currentContent?.pieces && currentContent.pieces.length > 0) {
      const canvasWidth = canvasRef.current?.clientWidth || 600;
      setPieceStates(createPieceStates(currentContent.pieces, canvasWidth));
      setScore(100);
      setHintsUsed(0);
      setShowCelebration(false);
      setGameComplete(false);
      hasNotifiedCompletion.current = false;
      setHintedPieceId(null);
      setStartTime(Date.now());
      setElapsedTime(0);
    }
  }, [currentContent?.id, currentContent?.pieces]);

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
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 5,
      },
    })
  );

  // Check if puzzle is complete (simplified: check if pieces are reasonably positioned)
  const checkCompletion = useCallback(() => {
    // For now, we'll use a simplified completion check
    // In a real implementation, we'd check piece positions against target
    const allPiecesPositioned = pieceStates.every((piece) => {
      // Check if piece has been moved from initial position
      return (
        piece.position.x !== 20 + (pieceStates.indexOf(piece) % 4) * 80 ||
        piece.position.y !== 280 + Math.floor(pieceStates.indexOf(piece) / 4) * 60
      );
    });

    // For demo purposes, mark as complete when all pieces are moved
    // In production, you'd compare against target positions
    return allPiecesPositioned && pieceStates.length > 0;
  }, [pieceStates]);

  // Handle drag start
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    setHintedPieceId(null); // Clear hint when dragging
  }, []);

  // Handle drag end
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, delta } = event;
      setActiveId(null);

      if (!currentContent) return;

      const pieceId = active.id as string;

      // Update piece position
      setPieceStates((prev) =>
        prev.map((piece) =>
          piece.id === pieceId
            ? {
                ...piece,
                position: {
                  x: piece.position.x + delta.x,
                  y: piece.position.y + delta.y,
                },
              }
            : piece
        )
      );
    },
    [currentContent]
  );

  // Handle piece rotation
  const handlePieceRotate = useCallback((pieceId: string) => {
    setPieceStates((prev) =>
      prev.map((piece) =>
        piece.id === pieceId
          ? { ...piece, rotation: (piece.rotation + 45) % 360 }
          : piece
      )
    );
  }, []);

  // Handle hint request
  const handleHint = useCallback(() => {
    if (gameComplete || hintsUsed >= 3) return;

    // Find a piece that hasn't been hinted recently
    const unhintedPieces = pieceStates.filter((p) => !p.isCorrect);
    if (unhintedPieces.length === 0) return;

    const randomPiece = unhintedPieces[Math.floor(Math.random() * unhintedPieces.length)];
    setHintedPieceId(randomPiece.id);
    setHintsUsed((prev) => prev + 1);
    setScore((prev) => Math.max(0, prev - 15)); // Deduct points for hint

    // Clear hint after 3 seconds
    setTimeout(() => {
      setHintedPieceId(null);
    }, 3000);
  }, [gameComplete, hintsUsed, pieceStates]);

  // Handle manual completion (for demo/testing)
  const handleMarkComplete = useCallback(() => {
    if (gameComplete || hasNotifiedCompletion.current) return;

    hasNotifiedCompletion.current = true;

    // Calculate final score with time bonus
    let finalScore = score;
    if (elapsedTime < 120) {
      finalScore += 20; // Speed bonus for under 2 minutes
    } else if (elapsedTime < 180) {
      finalScore += 10; // Smaller bonus for under 3 minutes
    }
    finalScore = Math.max(0, Math.min(100, finalScore));

    setScore(finalScore);
    setShowCelebration(true);
    setGameComplete(true);

    // Mark all pieces as correct
    setPieceStates((prev) =>
      prev.map((piece) => ({ ...piece, isCorrect: true }))
    );

    // Stop timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Defer parent callbacks to avoid setState during render
    setTimeout(() => {
      onScoreUpdate(finalScore);
      onGameComplete(true);
    }, 0);
  }, [score, elapsedTime, gameComplete, onScoreUpdate, onGameComplete]);

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
    setHintsUsed(0);
    // Defer callback
    setTimeout(() => onScoreUpdate(0), 0);
  }, [onScoreUpdate]);

  // Get active piece for drag overlay
  const activePiece = useMemo(() => {
    if (!activeId) return null;
    return pieceStates.find((piece) => piece.id === activeId);
  }, [activeId, pieceStates]);

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
            <Skeleton variant="rectangular" className="w-full aspect-[4/3] rounded-xl" />
            <div className="flex gap-3">
              <Skeleton variant="rectangular" width={100} height={40} className="rounded-lg" />
              <Skeleton variant="rectangular" width={100} height={40} className="rounded-lg" />
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
        icon="shapes"
        title="אין תוכן זמין"
        description="עדיין לא נוספו פאזלי טנגרם עבור כיתה זו ורמת קושי זו."
        variant="stem"
      />
    );
  }

  const hasMorePuzzles = currentPuzzleIndex < shuffledContent.length - 1;
  const targetShapeName = TARGET_SHAPES[currentContent.targetShape]?.name || currentContent.targetShape;

  return (
    <div className="w-full max-w-3xl mx-auto p-4" dir="rtl" ref={canvasRef}>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-4 sm:p-6">
          {/* Game stats */}
          <div className="flex items-center justify-center gap-4 mb-4 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg">
              <span className="text-sm font-medium">
                ניקוד: <span className="font-bold">{score}</span>
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-cyan-100 text-cyan-700 rounded-lg">
              <span className="text-sm font-medium">
                חלקים: <span className="font-bold">{pieceStates.length}</span>
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg">
              <Timer size={14} />
              <span className="text-sm font-medium">{formatTime(elapsedTime)}</span>
            </div>
            {hintsUsed > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg">
                <Lightbulb size={14} />
                <span className="text-sm font-medium">
                  רמזים: <span className="font-bold">{hintsUsed}/3</span>
                </span>
              </div>
            )}
          </div>

          {/* Canvas with pieces */}
          <TangramCanvas
            targetShape={currentContent.targetShape}
            pieces={pieceStates}
            onPieceRotate={handlePieceRotate}
            hintedPieceId={hintedPieceId}
            gameComplete={gameComplete}
          />

          {/* Action buttons */}
          {!gameComplete && (
            <div className="flex flex-wrap justify-center gap-3 mt-4">
              <Button
                onClick={handleHint}
                disabled={hintsUsed >= 3}
                variant="outline"
                leftIcon={Lightbulb}
                className="border-amber-400 text-amber-600 hover:bg-amber-50"
              >
                רמז ({3 - hintsUsed})
              </Button>
              <Button
                onClick={handleMarkComplete}
                variant="primary"
                leftIcon={Eye}
                className="bg-orange-600 hover:bg-orange-700"
              >
                סיימתי!
              </Button>
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
                    className="text-orange-500 animate-bounce"
                  />
                )}
              </div>
              <div className="bg-orange-100 text-orange-800 px-6 py-4 rounded-xl text-center animate-scale-in">
                <div className="text-xl font-bold mb-1">
                  {score >= 80 ? "מושלם!" : "כל הכבוד!"}
                </div>
                <div className="text-sm">
                  יצרת את צורת ה{targetShapeName} בהצלחה!
                  {elapsedTime < 120 && (
                    <span className="block text-emerald-600 font-medium mt-1">
                      +20 נקודות בונוס על מהירות!
                    </span>
                  )}
                </div>
                <div className="mt-2 text-orange-600 font-bold text-lg">
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
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  פאזל הבא
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
            </div>
          )}

          {/* Progress indicator */}
          <div className="mt-6 text-center text-sm text-gray-500">
            פאזל {currentPuzzleIndex + 1} מתוך {shuffledContent.length}
          </div>
        </div>

        {/* Drag overlay */}
        <DragOverlay>
          {activePiece ? (
            <div
              style={{
                transform: `rotate(${activePiece.rotation}deg)`,
                opacity: 0.8,
              }}
            >
              <svg
                width={TANGRAM_PIECE_SHAPES[activePiece.type]?.width || 50}
                height={TANGRAM_PIECE_SHAPES[activePiece.type]?.height || 50}
                viewBox={`0 0 ${TANGRAM_PIECE_SHAPES[activePiece.type]?.width || 50} ${TANGRAM_PIECE_SHAPES[activePiece.type]?.height || 50}`}
              >
                <path
                  d={TANGRAM_PIECE_SHAPES[activePiece.type]?.path || ""}
                  fill={activePiece.color}
                  stroke="#374151"
                  strokeWidth={2}
                />
              </svg>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
