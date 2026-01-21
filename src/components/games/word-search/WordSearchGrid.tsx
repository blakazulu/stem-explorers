"use client";

import { useState, useCallback, useRef, useEffect } from "react";

interface Cell {
  row: number;
  col: number;
}

interface WordSearchGridProps {
  grid: string[][];
  gridSize: number;
  selectedCells: Set<string>;
  foundCells: Set<string>;
  onCellSelect: (row: number, col: number) => void;
  onSelectionComplete: (cells: Cell[]) => void;
}

/**
 * Helper to convert row,col to a string key for Set usage
 */
function cellKey(row: number, col: number): string {
  return `${row},${col}`;
}

/**
 * Helper to parse a cell key back to row,col
 */
function parseKey(key: string): Cell {
  const [row, col] = key.split(",").map(Number);
  return { row, col };
}

/**
 * Get all cells in a line from start to end position
 */
function getCellsInLine(start: Cell, end: Cell): Cell[] {
  const cells: Cell[] = [];
  const dRow = Math.sign(end.row - start.row);
  const dCol = Math.sign(end.col - start.col);

  let row = start.row;
  let col = start.col;

  // Add all cells from start to end
  while (true) {
    cells.push({ row, col });
    if (row === end.row && col === end.col) break;
    row += dRow;
    col += dCol;
  }

  return cells;
}

/**
 * Check if start and end form a valid direction (horizontal, vertical, or diagonal)
 */
function isValidDirection(start: Cell, end: Cell): boolean {
  const dRow = Math.abs(end.row - start.row);
  const dCol = Math.abs(end.col - start.col);

  // Horizontal: same row
  if (dRow === 0 && dCol > 0) return true;
  // Vertical: same column
  if (dCol === 0 && dRow > 0) return true;
  // Diagonal: equal row and column difference
  if (dRow === dCol && dRow > 0) return true;

  return false;
}

/**
 * Snap the end position to the nearest valid direction from start
 */
function snapToValidDirection(start: Cell, end: Cell, gridSize: number): Cell {
  const dRow = end.row - start.row;
  const dCol = end.col - start.col;
  const absDRow = Math.abs(dRow);
  const absDCol = Math.abs(dCol);

  let snappedRow = end.row;
  let snappedCol = end.col;

  // Determine the dominant direction
  if (absDRow === 0 && absDCol === 0) {
    return end; // Same cell
  }

  // Check if closer to horizontal, vertical, or diagonal
  const maxDist = Math.max(absDRow, absDCol);

  if (absDCol > absDRow * 2) {
    // Snap to horizontal
    snappedRow = start.row;
    snappedCol = start.col + Math.sign(dCol) * absDCol;
  } else if (absDRow > absDCol * 2) {
    // Snap to vertical
    snappedCol = start.col;
    snappedRow = start.row + Math.sign(dRow) * absDRow;
  } else {
    // Snap to diagonal
    const dist = Math.min(absDRow, absDCol);
    snappedRow = start.row + Math.sign(dRow) * dist;
    snappedCol = start.col + Math.sign(dCol) * dist;
  }

  // Clamp to grid bounds
  snappedRow = Math.max(0, Math.min(gridSize - 1, snappedRow));
  snappedCol = Math.max(0, Math.min(gridSize - 1, snappedCol));

  return { row: snappedRow, col: snappedCol };
}

/**
 * Word Search Grid component for displaying and interacting with the puzzle.
 * Supports click-and-drag selection with snapping to valid directions.
 * Highlights selected cells during drag and found words permanently.
 */
export function WordSearchGrid({
  grid,
  gridSize,
  selectedCells,
  foundCells,
  onCellSelect,
  onSelectionComplete,
}: WordSearchGridProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [startCell, setStartCell] = useState<Cell | null>(null);
  const [currentCell, setCurrentCell] = useState<Cell | null>(null);
  const [dragCells, setDragCells] = useState<Set<string>>(new Set());
  const gridRef = useRef<HTMLDivElement>(null);

  // Calculate responsive cell size based on grid size
  const getCellSize = useCallback(() => {
    // Base sizes for different grid sizes
    if (gridSize <= 8) return "w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12";
    if (gridSize <= 10) return "w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10";
    return "w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9"; // 12x12
  }, [gridSize]);

  const getFontSize = useCallback(() => {
    if (gridSize <= 8) return "text-lg sm:text-xl md:text-2xl";
    if (gridSize <= 10) return "text-base sm:text-lg md:text-xl";
    return "text-sm sm:text-base md:text-lg"; // 12x12
  }, [gridSize]);

  // Update drag cells when dragging
  useEffect(() => {
    if (isDragging && startCell && currentCell) {
      const snapped = snapToValidDirection(startCell, currentCell, gridSize);
      if (isValidDirection(startCell, snapped)) {
        const cells = getCellsInLine(startCell, snapped);
        setDragCells(new Set(cells.map((c) => cellKey(c.row, c.col))));
      }
    }
  }, [isDragging, startCell, currentCell, gridSize]);

  // Get cell position from mouse/touch event
  const getCellFromEvent = useCallback(
    (e: MouseEvent | TouchEvent): Cell | null => {
      if (!gridRef.current) return null;

      const rect = gridRef.current.getBoundingClientRect();
      const clientX = "touches" in e ? e.touches[0]?.clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0]?.clientY : e.clientY;

      if (clientX === undefined || clientY === undefined) return null;

      const x = clientX - rect.left;
      const y = clientY - rect.top;

      const cellWidth = rect.width / gridSize;
      const cellHeight = rect.height / gridSize;

      const col = Math.floor(x / cellWidth);
      const row = Math.floor(y / cellHeight);

      if (row >= 0 && row < gridSize && col >= 0 && col < gridSize) {
        return { row, col };
      }
      return null;
    },
    [gridSize]
  );

  // Handle mouse/touch start
  const handleStart = useCallback(
    (row: number, col: number) => {
      setIsDragging(true);
      setStartCell({ row, col });
      setCurrentCell({ row, col });
      setDragCells(new Set([cellKey(row, col)]));
      onCellSelect(row, col);
    },
    [onCellSelect]
  );

  // Handle mouse/touch move
  const handleMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!isDragging || !startCell) return;

      const cell = getCellFromEvent(e);
      if (cell) {
        setCurrentCell(cell);
      }
    },
    [isDragging, startCell, getCellFromEvent]
  );

  // Handle mouse/touch end
  const handleEnd = useCallback(() => {
    if (isDragging && startCell && currentCell) {
      const snapped = snapToValidDirection(startCell, currentCell, gridSize);
      if (isValidDirection(startCell, snapped)) {
        const cells = getCellsInLine(startCell, snapped);
        if (cells.length > 1) {
          onSelectionComplete(cells);
        }
      }
    }
    setIsDragging(false);
    setStartCell(null);
    setCurrentCell(null);
    setDragCells(new Set());
  }, [isDragging, startCell, currentCell, gridSize, onSelectionComplete]);

  // Store callbacks in refs to avoid re-adding event listeners on every render
  const handleMoveRef = useRef(handleMove);
  const handleEndRef = useRef(handleEnd);

  useEffect(() => {
    handleMoveRef.current = handleMove;
    handleEndRef.current = handleEnd;
  }, [handleMove, handleEnd]);

  // Add global event listeners for drag - only re-run when isDragging changes
  useEffect(() => {
    const handleGlobalMove = (e: MouseEvent | TouchEvent) => {
      handleMoveRef.current(e);
    };

    const handleGlobalEnd = () => {
      handleEndRef.current();
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleGlobalMove);
      document.addEventListener("mouseup", handleGlobalEnd);
      document.addEventListener("touchmove", handleGlobalMove, { passive: false });
      document.addEventListener("touchend", handleGlobalEnd);
    }

    return () => {
      document.removeEventListener("mousemove", handleGlobalMove);
      document.removeEventListener("mouseup", handleGlobalEnd);
      document.removeEventListener("touchmove", handleGlobalMove);
      document.removeEventListener("touchend", handleGlobalEnd);
    };
  }, [isDragging]);

  // Get cell styling based on state
  const getCellStyles = useCallback(
    (row: number, col: number) => {
      const key = cellKey(row, col);
      const isFound = foundCells.has(key);
      const isSelected = selectedCells.has(key);
      const isDragSelected = dragCells.has(key);

      let bgClass = "bg-white hover:bg-pink-50";
      let textClass = "text-gray-800";
      let borderClass = "border-pink-200";
      let shadowClass = "";

      if (isFound) {
        bgClass = "bg-emerald-400";
        textClass = "text-white font-bold";
        borderClass = "border-emerald-500";
        shadowClass = "shadow-emerald-200";
      } else if (isDragSelected) {
        bgClass = "bg-pink-400";
        textClass = "text-white font-bold";
        borderClass = "border-pink-500";
        shadowClass = "shadow-pink-200";
      } else if (isSelected) {
        bgClass = "bg-pink-200";
        textClass = "text-pink-800";
        borderClass = "border-pink-400";
      }

      return `${bgClass} ${textClass} ${borderClass} ${shadowClass}`;
    },
    [foundCells, selectedCells, dragCells]
  );

  return (
    <div
      ref={gridRef}
      className="inline-grid gap-0.5 sm:gap-1 p-2 sm:p-3 bg-pink-100 rounded-xl shadow-lg select-none touch-none"
      style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
      dir="rtl"
      role="grid"
      aria-label="לוח חיפוש מילים"
    >
      {grid.map((row, rowIndex) =>
        row.map((letter, colIndex) => (
          <button
            key={`${rowIndex}-${colIndex}`}
            className={`
              ${getCellSize()}
              ${getFontSize()}
              ${getCellStyles(rowIndex, colIndex)}
              border-2 rounded-lg
              flex items-center justify-center
              font-rubik font-bold
              transition-all duration-150
              cursor-pointer
              active:scale-95
              ${foundCells.has(cellKey(rowIndex, colIndex)) ? "animate-scale-in" : ""}
            `}
            onMouseDown={() => handleStart(rowIndex, colIndex)}
            onTouchStart={(e) => {
              e.preventDefault();
              handleStart(rowIndex, colIndex);
            }}
            role="gridcell"
            aria-label={`אות ${letter} בשורה ${rowIndex + 1} עמודה ${colIndex + 1}`}
          >
            {letter}
          </button>
        ))
      )}
    </div>
  );
}
