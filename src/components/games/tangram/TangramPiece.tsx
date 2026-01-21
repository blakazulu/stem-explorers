"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

/** Standard tangram piece types with their SVG paths */
export const TANGRAM_PIECE_SHAPES: Record<string, { path: string; width: number; height: number }> = {
  "triangle-large-1": {
    path: "M0,0 L100,0 L50,50 Z",
    width: 100,
    height: 50,
  },
  "triangle-large-2": {
    path: "M0,0 L100,0 L50,50 Z",
    width: 100,
    height: 50,
  },
  "triangle-medium": {
    path: "M0,0 L70,0 L35,35 Z",
    width: 70,
    height: 35,
  },
  "triangle-small-1": {
    path: "M0,0 L50,0 L25,25 Z",
    width: 50,
    height: 25,
  },
  "triangle-small-2": {
    path: "M0,0 L50,0 L25,25 Z",
    width: 50,
    height: 25,
  },
  "square": {
    path: "M0,0 L35,0 L35,35 L0,35 Z",
    width: 35,
    height: 35,
  },
  "parallelogram": {
    path: "M15,0 L65,0 L50,35 L0,35 Z",
    width: 65,
    height: 35,
  },
};

/** Default colors for tangram pieces */
export const TANGRAM_COLORS = [
  "#F87171", // red-400
  "#FB923C", // orange-400
  "#FBBF24", // amber-400
  "#4ADE80", // green-400
  "#22D3EE", // cyan-400
  "#818CF8", // indigo-400
  "#E879F9", // fuchsia-400
];

interface TangramPieceProps {
  id: string;
  type: string;
  color: string;
  rotation: number;
  position: { x: number; y: number };
  onRotate: (id: string) => void;
  disabled?: boolean;
  isCorrect?: boolean;
  isHinted?: boolean;
}

/**
 * Draggable and rotatable tangram piece component.
 * Uses @dnd-kit/core for drag functionality.
 * Click to rotate 45 degrees.
 */
export function TangramPiece({
  id,
  type,
  color,
  rotation,
  position,
  onRotate,
  disabled = false,
  isCorrect = false,
  isHinted = false,
}: TangramPieceProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id,
      disabled,
    });

  const shape = TANGRAM_PIECE_SHAPES[type];
  if (!shape) return null;

  const handleClick = (e: React.MouseEvent) => {
    // Only rotate on click, not on drag
    if (!isDragging && !disabled) {
      e.stopPropagation();
      onRotate(id);
    }
  };

  const style: React.CSSProperties = {
    position: "absolute",
    left: position.x,
    top: position.y,
    transform: transform
      ? `${CSS.Translate.toString(transform)} rotate(${rotation}deg)`
      : `rotate(${rotation}deg)`,
    transformOrigin: "center center",
    cursor: disabled ? "not-allowed" : isDragging ? "grabbing" : "grab",
    zIndex: isDragging ? 100 : isCorrect ? 5 : 10,
    transition: isDragging ? "none" : "box-shadow 0.2s ease",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={handleClick}
      className={`
        select-none touch-none
        ${isDragging ? "drop-shadow-lg" : ""}
        ${isCorrect ? "opacity-90" : ""}
        ${isHinted ? "animate-pulse" : ""}
      `}
    >
      <svg
        width={shape.width}
        height={shape.height}
        viewBox={`0 0 ${shape.width} ${shape.height}`}
        className="overflow-visible"
      >
        <path
          d={shape.path}
          fill={color}
          stroke={isCorrect ? "#22C55E" : isHinted ? "#3B82F6" : "#374151"}
          strokeWidth={isCorrect ? 3 : isHinted ? 3 : 2}
          className={`
            transition-all duration-200
            ${!disabled && !isDragging ? "hover:brightness-110" : ""}
          `}
        />
      </svg>
    </div>
  );
}
