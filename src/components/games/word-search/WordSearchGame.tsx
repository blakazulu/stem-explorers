"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useGameContent } from "@/lib/queries/games";
import { HEBREW_ALPHABET, FINAL_LETTERS } from "@/lib/constants/games";
import { WordSearchGrid } from "./WordSearchGrid";
import { WordList } from "./WordList";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { ArrowRight, RotateCcw, PartyPopper } from "lucide-react";
import type { Grade } from "@/types";
import type { Difficulty, WordSearchContent } from "@/types/games";

interface WordSearchGameProps {
  grade: Grade;
  difficulty: Difficulty;
  onScoreUpdate: (score: number) => void;
  onGameComplete: (won: boolean) => void;
}

interface Cell {
  row: number;
  col: number;
}

interface WordPosition {
  word: string;
  start: Cell;
  end: Cell;
  cells: Cell[];
}

type Direction = "horizontal" | "vertical" | "diagonal";

// All Hebrew letters including final forms for filling empty cells
const ALL_HEBREW_LETTERS = [
  ...HEBREW_ALPHABET,
  ...Object.values(FINAL_LETTERS),
];

// Create equivalents map for final letters
const FINAL_TO_REGULAR: Record<string, string> = {};
for (const [regular, final] of Object.entries(FINAL_LETTERS)) {
  FINAL_TO_REGULAR[final] = regular;
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
 * Convert cell position to string key
 */
function cellKey(row: number, col: number): string {
  return `${row},${col}`;
}

/**
 * Get direction deltas for word placement
 */
function getDirectionDeltas(
  direction: Direction
): { dRow: number; dCol: number }[] {
  switch (direction) {
    case "horizontal":
      return [
        { dRow: 0, dCol: 1 }, // Left to right
        { dRow: 0, dCol: -1 }, // Right to left
      ];
    case "vertical":
      return [
        { dRow: 1, dCol: 0 }, // Top to bottom
        { dRow: -1, dCol: 0 }, // Bottom to top
      ];
    case "diagonal":
      return [
        { dRow: 1, dCol: 1 }, // Top-left to bottom-right
        { dRow: 1, dCol: -1 }, // Top-right to bottom-left
        { dRow: -1, dCol: 1 }, // Bottom-left to top-right
        { dRow: -1, dCol: -1 }, // Bottom-right to top-left
      ];
    default:
      return [];
  }
}

/**
 * Check if a word can be placed at a position with given direction
 */
function canPlaceWord(
  grid: (string | null)[][],
  word: string,
  startRow: number,
  startCol: number,
  dRow: number,
  dCol: number,
  gridSize: number
): boolean {
  const letters = word.split("");

  for (let i = 0; i < letters.length; i++) {
    const row = startRow + i * dRow;
    const col = startCol + i * dCol;

    // Check bounds
    if (row < 0 || row >= gridSize || col < 0 || col >= gridSize) {
      return false;
    }

    // Check if cell is empty or has the same letter (overlap allowed)
    const existing = grid[row][col];
    if (existing !== null && existing !== letters[i]) {
      // Check if letters are equivalent (regular and final forms)
      const existingRegular = FINAL_TO_REGULAR[existing] || existing;
      const newRegular = FINAL_TO_REGULAR[letters[i]] || letters[i];
      if (existingRegular !== newRegular) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Place a word on the grid and return the positions
 */
function placeWord(
  grid: (string | null)[][],
  word: string,
  startRow: number,
  startCol: number,
  dRow: number,
  dCol: number
): WordPosition {
  const letters = word.split("");
  const cells: Cell[] = [];

  for (let i = 0; i < letters.length; i++) {
    const row = startRow + i * dRow;
    const col = startCol + i * dCol;
    grid[row][col] = letters[i];
    cells.push({ row, col });
  }

  return {
    word,
    start: { row: startRow, col: startCol },
    end: { row: startRow + (letters.length - 1) * dRow, col: startCol + (letters.length - 1) * dCol },
    cells,
  };
}

/**
 * Generate a word search grid with words placed
 */
function generateGrid(
  words: string[],
  gridSize: number,
  allowedDirections: Direction[]
): { grid: string[][]; wordPositions: WordPosition[] } {
  // Initialize empty grid
  const grid: (string | null)[][] = Array(gridSize)
    .fill(null)
    .map(() => Array(gridSize).fill(null));

  const wordPositions: WordPosition[] = [];
  const maxAttempts = 100;

  // Get all possible direction deltas
  const allDeltas = allowedDirections.flatMap(getDirectionDeltas);

  // Try to place each word
  for (const word of words) {
    let placed = false;

    for (let attempt = 0; attempt < maxAttempts && !placed; attempt++) {
      // Random starting position
      const startRow = Math.floor(Math.random() * gridSize);
      const startCol = Math.floor(Math.random() * gridSize);

      // Shuffle direction order for variety
      const shuffledDeltas = shuffleArray(allDeltas);

      for (const { dRow, dCol } of shuffledDeltas) {
        if (canPlaceWord(grid, word, startRow, startCol, dRow, dCol, gridSize)) {
          const position = placeWord(grid, word, startRow, startCol, dRow, dCol);
          wordPositions.push(position);
          placed = true;
          break;
        }
      }
    }

    // If word couldn't be placed after max attempts, try a systematic search
    if (!placed) {
      outer: for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
          for (const { dRow, dCol } of allDeltas) {
            if (canPlaceWord(grid, word, row, col, dRow, dCol, gridSize)) {
              const position = placeWord(grid, word, row, col, dRow, dCol);
              wordPositions.push(position);
              placed = true;
              break outer;
            }
          }
        }
      }
    }
  }

  // Fill remaining empty cells with random Hebrew letters
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      if (grid[row][col] === null) {
        grid[row][col] =
          ALL_HEBREW_LETTERS[Math.floor(Math.random() * ALL_HEBREW_LETTERS.length)];
      }
    }
  }

  return { grid: grid as string[][], wordPositions };
}

/**
 * Normalize a Hebrew word by converting final letters to regular
 */
function normalizeWord(word: string): string {
  return word
    .split("")
    .map((letter) => FINAL_TO_REGULAR[letter] || letter)
    .join("");
}

/**
 * Check if selected cells spell out a word (forward or backward)
 */
function checkWordMatch(
  grid: string[][],
  cells: Cell[],
  words: string[]
): string | null {
  if (cells.length < 2) return null;

  // Get letters from selected cells
  const selectedLetters = cells.map((c) => grid[c.row][c.col]).join("");
  const reversedLetters = selectedLetters.split("").reverse().join("");

  // Normalize for comparison
  const normalizedSelected = normalizeWord(selectedLetters);
  const normalizedReversed = normalizeWord(reversedLetters);

  // Check against all words (normalize them too)
  for (const word of words) {
    const normalizedWord = normalizeWord(word);
    if (normalizedWord === normalizedSelected || normalizedWord === normalizedReversed) {
      return word;
    }
  }

  return null;
}

/**
 * Main Word Search game component.
 * Fetches content, generates grid, and manages game state.
 */
export function WordSearchGame({
  grade,
  difficulty,
  onScoreUpdate,
  onGameComplete,
}: WordSearchGameProps) {
  // Fetch game content
  const {
    data: contentList = [],
    isLoading,
    error,
    refetch,
  } = useGameContent("wordSearch", grade, difficulty);

  // Shuffle content once when loaded
  const shuffledContent = useMemo(() => {
    if (contentList.length === 0) return [];
    return shuffleArray(contentList);
  }, [contentList]);

  // Game state
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [foundWords, setFoundWords] = useState<Set<string>>(new Set());
  const [foundCells, setFoundCells] = useState<Set<string>>(new Set());
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
  const [showCelebration, setShowCelebration] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);

  // Get current puzzle content
  const currentContent = useMemo(() => {
    if (shuffledContent.length === 0) return null;
    return shuffledContent[currentPuzzleIndex] as WordSearchContent;
  }, [shuffledContent, currentPuzzleIndex]);

  // Generate grid when puzzle changes
  const { grid, wordPositions, words } = useMemo(() => {
    if (!currentContent) {
      return { grid: [], wordPositions: [], words: [] };
    }

    const { grid, wordPositions } = generateGrid(
      currentContent.words,
      currentContent.gridSize,
      currentContent.directions
    );

    return { grid, wordPositions, words: currentContent.words };
  }, [currentContent]);

  // Reset found words when puzzle changes
  useEffect(() => {
    setFoundWords(new Set());
    setFoundCells(new Set());
    setSelectedCells(new Set());
    setShowCelebration(false);
    setGameComplete(false);
  }, [currentPuzzleIndex, currentContent?.id]);

  // Check for game completion
  useEffect(() => {
    if (words.length > 0 && foundWords.size === words.length && !gameComplete) {
      // All words found - add bonus!
      const bonus = 50;
      const newScore = score + bonus;
      setScore(newScore);
      onScoreUpdate(newScore);
      setShowCelebration(true);
      setGameComplete(true);
      onGameComplete(true);
    }
  }, [foundWords.size, words.length, gameComplete, score, onScoreUpdate, onGameComplete]);

  // Handle cell selection during drag
  const handleCellSelect = useCallback((row: number, col: number) => {
    setSelectedCells(new Set([cellKey(row, col)]));
  }, []);

  // Handle selection complete (drag end)
  const handleSelectionComplete = useCallback(
    (cells: Cell[]) => {
      const matchedWord = checkWordMatch(grid, cells, words);

      if (matchedWord && !foundWords.has(matchedWord)) {
        // Word found!
        const newFoundWords = new Set(foundWords);
        newFoundWords.add(matchedWord);
        setFoundWords(newFoundWords);

        // Mark cells as found
        const newFoundCells = new Set(foundCells);
        for (const cell of cells) {
          newFoundCells.add(cellKey(cell.row, cell.col));
        }
        setFoundCells(newFoundCells);

        // Award points
        const newScore = score + 10;
        setScore(newScore);
        onScoreUpdate(newScore);
      }

      // Clear selection
      setSelectedCells(new Set());
    },
    [grid, words, foundWords, foundCells, score, onScoreUpdate]
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
    setFoundWords(new Set());
    setFoundCells(new Set());
    setSelectedCells(new Set());
    setShowCelebration(false);
    setGameComplete(false);
    onScoreUpdate(0);
  }, [onScoreUpdate]);

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4" dir="rtl">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6">
          <div className="flex flex-col lg:flex-row items-center justify-center gap-6">
            <Skeleton
              variant="rectangular"
              width={320}
              height={320}
              className="rounded-xl"
            />
            <div className="w-full lg:w-64">
              <Skeleton variant="text" width="100%" height={24} />
              <div className="mt-4 flex flex-wrap gap-2 justify-center">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton
                    key={i}
                    variant="rectangular"
                    width={80}
                    height={40}
                    className="rounded-lg"
                  />
                ))}
              </div>
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
  if (!currentContent || grid.length === 0) {
    return (
      <EmptyState
        icon="search"
        title="אין תוכן זמין"
        description="עדיין לא נוספו חידות חיפוש מילים עבור כיתה זו ורמת קושי זו."
        variant="stem"
      />
    );
  }

  const hasMorePuzzles = currentPuzzleIndex < shuffledContent.length - 1;

  return (
    <div className="w-full max-w-4xl mx-auto p-4" dir="rtl">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-4 sm:p-6">
        {/* Game content */}
        <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-6">
          {/* Grid */}
          <div className="flex-shrink-0">
            <WordSearchGrid
              grid={grid}
              gridSize={currentContent.gridSize}
              selectedCells={selectedCells}
              foundCells={foundCells}
              onCellSelect={handleCellSelect}
              onSelectionComplete={handleSelectionComplete}
            />
          </div>

          {/* Word list */}
          <div className="w-full lg:w-64">
            <WordList words={words} foundWords={foundWords} />
          </div>
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
              <div className="text-xl font-bold mb-1">מדהים!</div>
              <div className="text-sm">מצאת את כל המילים!</div>
            </div>
          </div>
        )}

        {/* Action buttons when puzzle is complete */}
        {gameComplete && (
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            {hasMorePuzzles ? (
              <Button
                onClick={handleNextPuzzle}
                variant="primary"
                rightIcon={ArrowRight}
                className="bg-pink-600 hover:bg-pink-700"
              >
                חידה הבאה
              </Button>
            ) : (
              <Button
                onClick={handleRestart}
                variant="primary"
                leftIcon={RotateCcw}
                className="bg-pink-600 hover:bg-pink-700"
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
    </div>
  );
}
