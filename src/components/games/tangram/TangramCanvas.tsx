"use client";

import { useDroppable } from "@dnd-kit/core";
import { TangramPiece } from "./TangramPiece";

/** Target shape definitions (SVG paths for silhouettes) */
export const TARGET_SHAPES: Record<string, { path: string; viewBox: string; name: string }> = {
  // Simple shapes for young grades
  "square": {
    path: "M50,10 L150,10 L150,110 L50,110 Z",
    viewBox: "0 0 200 120",
    name: "ריבוע",
  },
  "house": {
    path: "M100,10 L170,60 L170,140 L30,140 L30,60 Z",
    viewBox: "0 0 200 150",
    name: "בית",
  },
  "boat": {
    path: "M20,80 L100,80 L180,80 L150,120 L50,120 Z M100,80 L100,30 L130,80 Z",
    viewBox: "0 0 200 130",
    name: "סירה",
  },
  "arrow": {
    path: "M100,10 L170,80 L130,80 L130,140 L70,140 L70,80 L30,80 Z",
    viewBox: "0 0 200 150",
    name: "חץ",
  },
  "tree": {
    path: "M100,10 L150,60 L130,60 L160,100 L140,100 L170,140 L30,140 L60,100 L40,100 L70,60 L50,60 Z",
    viewBox: "0 0 200 150",
    name: "עץ",
  },
  // Medium complexity shapes
  "cat": {
    path: "M40,120 L40,60 L20,20 L50,40 L80,40 L60,20 L100,60 L100,120 L80,140 L60,140 Z M50,80 L50,90 M80,80 L80,90",
    viewBox: "0 0 120 150",
    name: "חתול",
  },
  "bird": {
    path: "M20,60 L60,40 L100,40 L140,20 L160,40 L180,40 L140,70 L120,70 L120,100 L80,100 L80,70 L40,70 Z",
    viewBox: "0 0 200 110",
    name: "ציפור",
  },
  "fish": {
    path: "M30,60 L80,30 L150,30 L180,60 L150,90 L80,90 L30,60 Z M10,60 L30,40 L30,80 Z",
    viewBox: "0 0 190 100",
    name: "דג",
  },
  "rabbit": {
    path: "M60,140 L60,80 L40,80 L40,20 L55,20 L55,50 L65,50 L65,20 L80,20 L80,80 L100,80 L100,140 Z",
    viewBox: "0 0 140 150",
    name: "ארנב",
  },
  "heart": {
    path: "M100,140 L30,80 L30,50 Q30,20 60,20 Q90,20 100,50 Q110,20 140,20 Q170,20 170,50 L170,80 Z",
    viewBox: "0 0 200 150",
    name: "לב",
  },
  // Complex shapes
  "person": {
    path: "M70,30 Q70,10 90,10 Q110,10 110,30 Q110,50 90,50 Q70,50 70,30 Z M90,50 L90,80 L60,120 M90,80 L120,120 M90,80 L70,140 M90,80 L110,140",
    viewBox: "0 0 180 150",
    name: "אדם",
  },
  "rocket": {
    path: "M90,10 L110,10 L130,50 L130,100 L150,130 L110,130 L110,150 L90,150 L90,130 L50,130 L70,100 L70,50 Z",
    viewBox: "0 0 200 160",
    name: "רקטה",
  },
  "swan": {
    path: "M40,100 L40,60 Q40,30 70,30 Q90,30 90,50 L90,70 L130,70 L150,50 L170,70 L150,90 L90,90 L90,120 L70,140 L50,140 Z",
    viewBox: "0 0 180 150",
    name: "ברבור",
  },
  "runner": {
    path: "M80,20 Q80,10 90,10 Q100,10 100,20 Q100,30 90,30 Q80,30 80,20 Z M90,30 L80,60 L50,50 M90,30 L100,60 L130,50 M80,60 L70,100 L40,120 M80,60 L100,100 L130,120",
    viewBox: "0 0 170 130",
    name: "רץ",
  },
  "dinosaur": {
    path: "M30,100 L30,60 L50,60 L50,40 L70,40 L90,20 L110,40 L130,40 L150,60 L170,60 L170,80 L150,80 L150,100 L130,100 L130,120 L110,140 L90,140 L90,120 L70,120 L70,100 Z",
    viewBox: "0 0 200 150",
    name: "דינוזאור",
  },
};

interface PieceState {
  id: string;
  type: string;
  color: string;
  position: { x: number; y: number };
  rotation: number;
  isCorrect: boolean;
}

interface TangramCanvasProps {
  targetShape: string;
  pieces: PieceState[];
  onPieceRotate: (id: string) => void;
  hintedPieceId: string | null;
  gameComplete: boolean;
}

/**
 * Canvas component for the Tangram game.
 * Displays the target silhouette and the draggable pieces.
 */
export function TangramCanvas({
  targetShape,
  pieces,
  onPieceRotate,
  hintedPieceId,
  gameComplete,
}: TangramCanvasProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: "tangram-canvas",
  });

  const target = TARGET_SHAPES[targetShape];
  if (!target) return null;

  return (
    <div
      ref={setNodeRef}
      className={`
        relative w-full aspect-[4/3] max-w-2xl mx-auto
        bg-gradient-to-br from-gray-100 to-gray-200
        rounded-2xl border-4
        ${isOver ? "border-orange-400 bg-orange-50/30" : "border-gray-300"}
        transition-all duration-200
        overflow-hidden
      `}
    >
      {/* Target shape silhouette */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
        <svg
          viewBox={target.viewBox}
          className="w-3/4 h-3/4"
          preserveAspectRatio="xMidYMid meet"
        >
          <path
            d={target.path}
            fill="#9CA3AF"
            stroke="#6B7280"
            strokeWidth={2}
          />
        </svg>
      </div>

      {/* Target shape name */}
      <div className="absolute top-3 right-3 px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm">
        <span className="text-sm font-medium text-gray-700">
          צורה: {target.name}
        </span>
      </div>

      {/* Pieces */}
      {pieces.map((piece) => (
        <TangramPiece
          key={piece.id}
          id={piece.id}
          type={piece.type}
          color={piece.color}
          rotation={piece.rotation}
          position={piece.position}
          onRotate={onPieceRotate}
          disabled={gameComplete}
          isCorrect={piece.isCorrect}
          isHinted={hintedPieceId === piece.id}
        />
      ))}

      {/* Instructions overlay for empty state */}
      {!gameComplete && pieces.length > 0 && (
        <div className="absolute bottom-3 left-3 right-3 text-center">
          <div className="inline-block px-4 py-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm">
            <span className="text-sm text-gray-600">
              גרור את החלקים וסדר אותם לצורה. לחץ על חלק כדי לסובב.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
