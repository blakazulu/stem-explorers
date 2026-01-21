"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useGameContent } from "@/lib/queries/games";
import { MemoryCard } from "./MemoryCard";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { ArrowRight, RotateCcw, PartyPopper, Move } from "lucide-react";
import type { Grade } from "@/types";
import type { Difficulty, MemoryContent, MemoryPair } from "@/types/games";

interface MemoryGameProps {
  grade: Grade;
  difficulty: Difficulty;
  onScoreUpdate: (score: number) => void;
  onGameComplete: (won: boolean) => void;
}

/** Represents a card in the memory game */
interface Card {
  id: string;
  pairId: number;
  content: string;
  type: "term" | "match";
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
 * Create cards from memory pairs
 * For each pair, creates two cards: one for term, one for match
 * Uses timestamp to ensure unique IDs across game restarts
 */
function createCardsFromPairs(pairs: MemoryPair[]): Card[] {
  const cards: Card[] = [];
  const timestamp = Date.now(); // Ensure unique IDs across restarts

  pairs.forEach((pair, index) => {
    // Card for the term
    cards.push({
      id: `term-${index}-${timestamp}`,
      pairId: index,
      content: pair.term,
      type: "term",
    });

    // Card for the match
    cards.push({
      id: `match-${index}-${timestamp}`,
      pairId: index,
      content: pair.match,
      type: "match",
    });
  });

  return shuffleArray(cards);
}

/**
 * Main Memory game component.
 * Fetches content, manages game state, and orchestrates the matching game flow.
 */
export function MemoryGame({
  grade,
  difficulty,
  onScoreUpdate,
  onGameComplete,
}: MemoryGameProps) {
  // Fetch game content
  const {
    data: contentList = [],
    isLoading,
    error,
    refetch,
  } = useGameContent("memory", grade, difficulty);

  // Shuffle content once when loaded
  const shuffledContent = useMemo(() => {
    if (contentList.length === 0) return [];
    return shuffleArray(contentList);
  }, [contentList]);

  // Game state
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<string[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<Set<number>>(new Set());
  const [moves, setMoves] = useState(0);
  const [score, setScore] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  // Ref to track if we've notified completion
  const hasNotifiedCompletion = useRef(false);

  // Ref for timeout cleanup to prevent memory leaks
  const matchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (matchTimeoutRef.current) {
        clearTimeout(matchTimeoutRef.current);
      }
    };
  }, []);

  // Get current puzzle content
  const currentContent = useMemo(() => {
    if (shuffledContent.length === 0) return null;
    return shuffledContent[currentPuzzleIndex] as MemoryContent;
  }, [shuffledContent, currentPuzzleIndex]);

  // Initialize cards when content changes
  useEffect(() => {
    if (currentContent?.pairs) {
      setCards(createCardsFromPairs(currentContent.pairs));
      setFlippedCards([]);
      setMatchedPairs(new Set());
      setMoves(0);
      setShowCelebration(false);
      setGameComplete(false);
      hasNotifiedCompletion.current = false;
    }
  }, [currentContent?.id, currentContent?.pairs]);

  // Calculate grid layout based on number of pairs
  const gridCols = useMemo(() => {
    const numCards = cards.length;
    if (numCards <= 12) return 4; // 4x3 for 6 pairs (12 cards)
    return 4; // 4x4 for 8 pairs (16 cards)
  }, [cards.length]);

  // Check for game completion
  useEffect(() => {
    if (
      currentContent?.pairs &&
      matchedPairs.size === currentContent.pairs.length &&
      matchedPairs.size > 0 &&
      !gameComplete &&
      !hasNotifiedCompletion.current
    ) {
      hasNotifiedCompletion.current = true;

      // Calculate final score: 1000 - (moves * 10), minimum 100
      // Add bonus for completing and per-match points already accumulated
      const baseScore = Math.max(100, 1000 - moves * 10);
      const bonus = 50;
      const finalScore = baseScore + bonus;

      setScore(finalScore);
      onScoreUpdate(finalScore);
      setShowCelebration(true);
      setGameComplete(true);
      onGameComplete(true);
    }
  }, [
    matchedPairs.size,
    currentContent?.pairs,
    gameComplete,
    moves,
    score,
    onScoreUpdate,
    onGameComplete,
  ]);

  // Handle card click
  const handleCardClick = useCallback(
    (cardId: string) => {
      // Don't allow clicks while checking or if card is already flipped/matched
      if (isChecking) return;
      if (flippedCards.includes(cardId)) return;
      if (flippedCards.length >= 2) return;

      const card = cards.find((c) => c.id === cardId);
      if (!card || matchedPairs.has(card.pairId)) return;

      const newFlipped = [...flippedCards, cardId];
      setFlippedCards(newFlipped);

      // If this is the second card
      if (newFlipped.length === 2) {
        setMoves((prev) => prev + 1);
        setIsChecking(true);

        const [firstId, secondId] = newFlipped;
        const firstCard = cards.find((c) => c.id === firstId);
        const secondCard = cards.find((c) => c.id === secondId);

        if (
          firstCard &&
          secondCard &&
          firstCard.pairId === secondCard.pairId &&
          firstCard.type !== secondCard.type
        ) {
          // Match found!
          matchTimeoutRef.current = setTimeout(() => {
            setMatchedPairs((prev) => new Set([...prev, firstCard.pairId]));
            setFlippedCards([]);
            setIsChecking(false);

            // Award points for match
            setScore((prev) => {
              const newScore = prev + 10;
              onScoreUpdate(newScore);
              return newScore;
            });
          }, 500);
        } else {
          // No match - flip back after delay
          matchTimeoutRef.current = setTimeout(() => {
            setFlippedCards([]);
            setIsChecking(false);
          }, 1000);
        }
      }
    },
    [cards, flippedCards, isChecking, matchedPairs, onScoreUpdate]
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
    setScore(0);
    onScoreUpdate(0);
    // The useEffect will handle resetting the cards when content changes
  }, [onScoreUpdate]);

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full max-w-xl mx-auto p-4" dir="rtl">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6">
          <div className="flex flex-col items-center gap-6">
            <Skeleton variant="text" width={150} height={24} />
            <div className="grid grid-cols-4 gap-3 w-full max-w-md">
              {Array.from({ length: 12 }).map((_, i) => (
                <Skeleton
                  key={i}
                  variant="rectangular"
                  className="aspect-square rounded-xl"
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
        icon="grid-3x3"
        title="אין תוכן זמין"
        description="עדיין לא נוספו זוגות למשחק הזיכרון עבור כיתה זו ורמת קושי זו."
        variant="stem"
      />
    );
  }

  const hasMorePuzzles = currentPuzzleIndex < shuffledContent.length - 1;

  return (
    <div className="w-full max-w-xl mx-auto p-4" dir="rtl">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-4 sm:p-6">
        {/* Game stats */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-violet-100 text-violet-700 rounded-lg">
            <Move size={16} />
            <span className="text-sm font-medium">
              מהלכים: <span className="font-bold">{moves}</span>
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
            <span className="text-sm font-medium">
              זוגות: <span className="font-bold">{matchedPairs.size}</span>/
              {currentContent.pairs.length}
            </span>
          </div>
        </div>

        {/* Card grid */}
        <div
          className={`
            grid gap-2 sm:gap-3 mx-auto
            ${gridCols === 4 ? "grid-cols-4" : "grid-cols-4"}
          `}
          style={{
            maxWidth: gridCols === 4 ? "400px" : "400px",
          }}
        >
          {cards.map((card, index) => (
            <MemoryCard
              key={card.id}
              content={card.content}
              isFlipped={flippedCards.includes(card.id)}
              isMatched={matchedPairs.has(card.pairId)}
              onClick={() => handleCardClick(card.id)}
              disabled={isChecking || gameComplete}
              index={index}
            />
          ))}
        </div>

        {/* Celebration message */}
        {showCelebration && (
          <div className="mt-6 relative">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <PartyPopper
                size={48}
                className="text-amber-500 animate-bounce"
              />
            </div>
            <div className="bg-emerald-100 text-emerald-800 px-6 py-3 rounded-xl text-center animate-scale-in">
              <div className="text-xl font-bold mb-1">מזל טוב!</div>
              <div className="text-sm">
                מצאת את כל הזוגות ב-{moves} מהלכים!
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
    </div>
  );
}
