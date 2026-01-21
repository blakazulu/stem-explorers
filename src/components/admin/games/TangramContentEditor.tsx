"use client";

import { Trash2, Plus, X } from "lucide-react";
import type { TangramContent, TangramPiece } from "@/types/games";
import { TARGET_SHAPES } from "@/components/games/tangram/TangramCanvas";
import { TANGRAM_PIECE_SHAPES, TANGRAM_COLORS } from "@/components/games/tangram/TangramPiece";

interface TangramContentEditorProps {
  content: TangramContent;
  onEdit: (updates: Partial<TangramContent>) => void;
  onDelete: () => void;
  isNew: boolean;
}

const PIECE_TYPES = Object.keys(TANGRAM_PIECE_SHAPES);
const SHAPE_OPTIONS = Object.entries(TARGET_SHAPES).map(([key, value]) => ({
  value: key,
  label: value.name,
}));

export function TangramContentEditor({
  content,
  onEdit,
  onDelete,
  isNew,
}: TangramContentEditorProps) {
  // Handle target shape change
  const handleTargetShapeChange = (value: string) => {
    onEdit({ targetShape: value });
  };

  // Handle piece type change
  const handlePieceTypeChange = (index: number, value: string) => {
    const newPieces = content.pieces.map((piece, i) =>
      i === index ? { ...piece, type: value } : piece
    );
    onEdit({ pieces: newPieces });
  };

  // Handle piece color change
  const handlePieceColorChange = (index: number, value: string) => {
    const newPieces = content.pieces.map((piece, i) =>
      i === index ? { ...piece, color: value } : piece
    );
    onEdit({ pieces: newPieces });
  };

  // Handle piece initial position change
  const handlePiecePositionChange = (
    index: number,
    axis: "x" | "y",
    value: number
  ) => {
    const newPieces = content.pieces.map((piece, i) =>
      i === index
        ? {
            ...piece,
            initialPosition: {
              ...piece.initialPosition,
              [axis]: value,
            },
          }
        : piece
    );
    onEdit({ pieces: newPieces });
  };

  // Handle piece initial rotation change
  const handlePieceRotationChange = (index: number, value: number) => {
    const newPieces = content.pieces.map((piece, i) =>
      i === index ? { ...piece, initialRotation: value } : piece
    );
    onEdit({ pieces: newPieces });
  };

  // Handle adding a new piece
  const handleAddPiece = () => {
    const newPiece: TangramPiece = {
      type: PIECE_TYPES[0],
      color: TANGRAM_COLORS[content.pieces.length % TANGRAM_COLORS.length],
      initialPosition: { x: 50, y: 50 },
      initialRotation: 0,
    };
    onEdit({ pieces: [...content.pieces, newPiece] });
  };

  // Handle removing a piece
  const handleRemovePiece = (index: number) => {
    if (content.pieces.length <= 1) return; // Minimum 1 piece
    const newPieces = content.pieces.filter((_, i) => i !== index);
    onEdit({ pieces: newPieces });
  };

  return (
    <div
      className={`
        p-4 rounded-xl border-2
        ${isNew ? "border-indigo-300 bg-indigo-50/30" : "border-gray-200 bg-white"}
      `}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-4">
          {/* Target shape selector */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              צורת יעד:
            </label>
            <select
              value={content.targetShape}
              onChange={(e) => handleTargetShapeChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
              dir="rtl"
            >
              {SHAPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Pieces section */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              חלקים ({content.pieces.length}):
            </label>
            <div className="space-y-3">
              {content.pieces.map((piece, index) => (
                <div
                  key={index}
                  className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      חלק {index + 1}
                    </span>
                    {content.pieces.length > 1 && (
                      <button
                        onClick={() => handleRemovePiece(index)}
                        className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                        title="הסר חלק"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {/* Piece type */}
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        סוג:
                      </label>
                      <select
                        value={piece.type}
                        onChange={(e) =>
                          handlePieceTypeChange(index, e.target.value)
                        }
                        className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                        dir="rtl"
                      >
                        {PIECE_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Piece color */}
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        צבע:
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={piece.color}
                          onChange={(e) =>
                            handlePieceColorChange(index, e.target.value)
                          }
                          className="w-8 h-8 rounded border border-gray-200 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={piece.color}
                          onChange={(e) =>
                            handlePieceColorChange(index, e.target.value)
                          }
                          className="flex-1 px-2 py-1.5 border border-gray-200 rounded text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          dir="ltr"
                        />
                      </div>
                    </div>

                    {/* Initial position X */}
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        מיקום X:
                      </label>
                      <input
                        type="number"
                        value={piece.initialPosition.x}
                        onChange={(e) =>
                          handlePiecePositionChange(
                            index,
                            "x",
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        min={0}
                        max={500}
                      />
                    </div>

                    {/* Initial position Y */}
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        מיקום Y:
                      </label>
                      <input
                        type="number"
                        value={piece.initialPosition.y}
                        onChange={(e) =>
                          handlePiecePositionChange(
                            index,
                            "y",
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        min={0}
                        max={400}
                      />
                    </div>

                    {/* Initial rotation */}
                    <div className="col-span-2">
                      <label className="block text-xs text-gray-500 mb-1">
                        סיבוב התחלתי (מעלות):
                      </label>
                      <input
                        type="number"
                        value={piece.initialRotation}
                        onChange={(e) =>
                          handlePieceRotationChange(
                            index,
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        min={0}
                        max={360}
                        step={45}
                      />
                    </div>
                  </div>
                </div>
              ))}

              {content.pieces.length < 7 && (
                <button
                  onClick={handleAddPiece}
                  className="w-full py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all duration-150 flex items-center justify-center gap-1"
                >
                  <Plus size={14} />
                  הוסף חלק
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Delete button */}
        <button
          onClick={onDelete}
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          title="מחק פאזל"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {isNew && (
        <div className="mt-3 text-xs text-indigo-600 font-medium">
          פריט חדש - יישמר כשתלחץ על &quot;שמור שינויים&quot;
        </div>
      )}
    </div>
  );
}
