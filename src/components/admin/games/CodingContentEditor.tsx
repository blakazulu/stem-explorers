"use client";

import { useCallback, useMemo } from "react";
import { Trash2, Plus, X, Bot, Flag } from "lucide-react";
import type { CodingContent, CodingObstacle } from "@/types/games";

interface CodingContentEditorProps {
  content: CodingContent;
  onEdit: (updates: Partial<CodingContent>) => void;
  onDelete: () => void;
  isNew: boolean;
}

export function CodingContentEditor({
  content,
  onEdit,
  onDelete,
  isNew,
}: CodingContentEditorProps) {
  // Generate grid cells
  const cells = useMemo(() => {
    const result: { x: number; y: number }[] = [];
    for (let y = 0; y < content.gridSize; y++) {
      for (let x = 0; x < content.gridSize; x++) {
        result.push({ x, y });
      }
    }
    return result;
  }, [content.gridSize]);

  // Check cell state
  const isStart = (x: number, y: number) =>
    content.start.x === x && content.start.y === y;
  const isGoal = (x: number, y: number) =>
    content.goal.x === x && content.goal.y === y;
  const isObstacle = (x: number, y: number) =>
    content.obstacles.some((obs) => obs.x === x && obs.y === y);

  // Handle cell click
  const handleCellClick = useCallback(
    (x: number, y: number, mode: "start" | "goal" | "obstacle") => {
      if (mode === "start") {
        // Don't allow setting start on goal or obstacle
        if (isGoal(x, y)) return;
        if (isObstacle(x, y)) {
          // Remove obstacle if setting start there
          onEdit({
            start: { x, y },
            obstacles: content.obstacles.filter(
              (obs) => !(obs.x === x && obs.y === y)
            ),
          });
        } else {
          onEdit({ start: { x, y } });
        }
      } else if (mode === "goal") {
        // Don't allow setting goal on start or obstacle
        if (isStart(x, y)) return;
        if (isObstacle(x, y)) {
          // Remove obstacle if setting goal there
          onEdit({
            goal: { x, y },
            obstacles: content.obstacles.filter(
              (obs) => !(obs.x === x && obs.y === y)
            ),
          });
        } else {
          onEdit({ goal: { x, y } });
        }
      } else if (mode === "obstacle") {
        // Don't allow obstacle on start or goal
        if (isStart(x, y) || isGoal(x, y)) return;

        // Toggle obstacle
        if (isObstacle(x, y)) {
          onEdit({
            obstacles: content.obstacles.filter(
              (obs) => !(obs.x === x && obs.y === y)
            ),
          });
        } else {
          onEdit({
            obstacles: [...content.obstacles, { x, y }],
          });
        }
      }
    },
    [content.start, content.goal, content.obstacles, onEdit, isGoal, isStart, isObstacle]
  );

  // Handle grid size change
  const handleGridSizeChange = (newSize: number) => {
    // Filter out obstacles that are outside the new grid
    const validObstacles = content.obstacles.filter(
      (obs) => obs.x < newSize && obs.y < newSize
    );

    // Ensure start and goal are within bounds
    const newStart = {
      x: Math.min(content.start.x, newSize - 1),
      y: Math.min(content.start.y, newSize - 1),
    };
    const newGoal = {
      x: Math.min(content.goal.x, newSize - 1),
      y: Math.min(content.goal.y, newSize - 1),
    };

    onEdit({
      gridSize: newSize,
      obstacles: validObstacles,
      start: newStart,
      goal: newGoal,
    });
  };

  // Get cell size based on grid size
  const getCellSize = () => {
    if (content.gridSize <= 3) return "w-10 h-10";
    if (content.gridSize <= 4) return "w-8 h-8";
    return "w-7 h-7";
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
          {/* Grid Size and Max Moves Row */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Grid Size */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-600">
                גודל רשת:
              </label>
              <select
                value={content.gridSize}
                onChange={(e) => handleGridSizeChange(parseInt(e.target.value))}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                dir="rtl"
              >
                <option value={3}>3x3</option>
                <option value={4}>4x4</option>
                <option value={5}>5x5</option>
              </select>
            </div>

            {/* Max Moves */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-600">
                מקסימום צעדים:
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={content.maxMoves}
                onChange={(e) =>
                  onEdit({ maxMoves: parseInt(e.target.value) || 1 })
                }
                className="w-16 px-2 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-800 text-center focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Feature toggles */}
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={content.allowLoops}
                onChange={(e) => onEdit({ allowLoops: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700">אפשר לולאות</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={content.allowConditionals}
                onChange={(e) => onEdit({ allowConditionals: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700">אפשר תנאים</span>
            </label>
          </div>

          {/* Grid Editor */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-600">
              עריכת מפה (לחץ להגדרת התחלה/יעד/מכשולים):
            </label>

            {/* Mode selector buttons */}
            <div className="flex gap-2 mb-2" dir="ltr">
              <button
                type="button"
                onClick={() =>
                  document
                    .querySelectorAll("[data-mode]")
                    .forEach((el) =>
                      el.setAttribute("data-active-mode", "start")
                    )
                }
                className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-100 text-cyan-700 rounded-lg text-xs font-medium hover:bg-cyan-200 transition-colors"
              >
                <Bot size={14} />
                התחלה
              </button>
              <button
                type="button"
                onClick={() =>
                  document
                    .querySelectorAll("[data-mode]")
                    .forEach((el) =>
                      el.setAttribute("data-active-mode", "goal")
                    )
                }
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg text-xs font-medium hover:bg-amber-200 transition-colors"
              >
                <Flag size={14} />
                יעד
              </button>
              <button
                type="button"
                onClick={() =>
                  document
                    .querySelectorAll("[data-mode]")
                    .forEach((el) =>
                      el.setAttribute("data-active-mode", "obstacle")
                    )
                }
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-300 transition-colors"
              >
                <div className="w-3 h-3 bg-gray-500 rounded-sm" />
                מכשול
              </button>
            </div>

            {/* Grid */}
            <div
              className="inline-grid gap-1 p-2 bg-gray-100 rounded-lg"
              style={{
                gridTemplateColumns: `repeat(${content.gridSize}, minmax(0, 1fr))`,
              }}
              dir="ltr"
            >
              {cells.map(({ x, y }) => {
                const isSt = isStart(x, y);
                const isGo = isGoal(x, y);
                const isObs = isObstacle(x, y);

                return (
                  <div
                    key={`${x}-${y}`}
                    data-mode
                    data-active-mode="obstacle"
                    onClick={(e) => {
                      const mode =
                        (e.currentTarget.getAttribute("data-active-mode") as
                          | "start"
                          | "goal"
                          | "obstacle") || "obstacle";
                      handleCellClick(x, y, mode);
                    }}
                    className={`
                      ${getCellSize()}
                      rounded flex items-center justify-center
                      cursor-pointer transition-all duration-150
                      ${
                        isSt
                          ? "bg-cyan-200 border-2 border-cyan-400"
                          : isGo
                          ? "bg-amber-200 border-2 border-amber-400"
                          : isObs
                          ? "bg-gray-400 border-2 border-gray-500"
                          : "bg-white border border-gray-300 hover:bg-gray-50"
                      }
                    `}
                  >
                    {isSt && <Bot size={16} className="text-cyan-600" />}
                    {isGo && <Flag size={14} className="text-amber-600" />}
                    {isObs && (
                      <div className="w-2/3 h-2/3 bg-gray-500 rounded-sm" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Instructions */}
            <p className="text-xs text-gray-500">
              בחר סוג (התחלה/יעד/מכשול) ולחץ על משבצת. לחץ שוב על מכשול כדי להסיר.
            </p>
          </div>

          {/* Obstacles list */}
          {content.obstacles.length > 0 && (
            <div className="flex flex-wrap gap-1">
              <span className="text-xs text-gray-500">מכשולים:</span>
              {content.obstacles.map((obs, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
                >
                  ({obs.x},{obs.y})
                  <button
                    onClick={() =>
                      onEdit({
                        obstacles: content.obstacles.filter((_, j) => j !== i),
                      })
                    }
                    className="text-gray-400 hover:text-red-500"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Delete button */}
        <button
          onClick={onDelete}
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          title="מחק חידה"
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
