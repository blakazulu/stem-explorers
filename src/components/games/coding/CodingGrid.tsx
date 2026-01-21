"use client";

import { memo, useMemo } from "react";
import { Bot, Flag, XCircle } from "lucide-react";

export interface GridPosition {
  x: number;
  y: number;
}

interface CodingGridProps {
  gridSize: number;
  robotPosition: GridPosition;
  goalPosition: GridPosition;
  obstacles: GridPosition[];
  robotDirection: "up" | "down" | "left" | "right";
  isAnimating?: boolean;
  showError?: boolean;
  showSuccess?: boolean;
}

/**
 * Visual grid component for the coding puzzle game.
 * Displays the robot, goal, and obstacles on a grid.
 */
export const CodingGrid = memo(function CodingGrid({
  gridSize,
  robotPosition,
  goalPosition,
  obstacles,
  robotDirection,
  isAnimating = false,
  showError = false,
  showSuccess = false,
}: CodingGridProps) {
  // Create grid cells
  const cells = useMemo(() => {
    const result: { x: number; y: number }[] = [];
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        result.push({ x, y });
      }
    }
    return result;
  }, [gridSize]);

  // Check if a position is an obstacle
  const isObstacle = (x: number, y: number) => {
    return obstacles.some((obs) => obs.x === x && obs.y === y);
  };

  // Check if a position is the goal
  const isGoal = (x: number, y: number) => {
    return goalPosition.x === x && goalPosition.y === y;
  };

  // Check if a position has the robot
  const isRobot = (x: number, y: number) => {
    return robotPosition.x === x && robotPosition.y === y;
  };

  // Get rotation for robot direction
  const getRotation = () => {
    switch (robotDirection) {
      case "up":
        return "rotate-0";
      case "right":
        return "-rotate-90";
      case "down":
        return "rotate-180";
      case "left":
        return "rotate-90";
      default:
        return "rotate-0";
    }
  };

  // Calculate cell size based on grid size
  const getCellSize = () => {
    if (gridSize <= 3) return "w-20 h-20 sm:w-24 sm:h-24";
    if (gridSize <= 4) return "w-16 h-16 sm:w-20 sm:h-20";
    return "w-12 h-12 sm:w-16 sm:h-16";
  };

  return (
    <div className="flex flex-col items-center" dir="ltr">
      {/* Grid container */}
      <div
        className={`
          inline-grid gap-1 p-3 rounded-xl
          bg-gradient-to-br from-cyan-100 to-teal-100
          border-4 border-cyan-300
          shadow-lg
          ${showError ? "animate-shake border-red-400" : ""}
          ${showSuccess ? "border-emerald-400 shadow-emerald-200" : ""}
        `}
        style={{
          gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
        }}
      >
        {cells.map(({ x, y }) => (
          <div
            key={`${x}-${y}`}
            className={`
              ${getCellSize()}
              rounded-lg
              flex items-center justify-center
              transition-all duration-300
              ${
                isObstacle(x, y)
                  ? "bg-gray-400 border-2 border-gray-500 shadow-inner"
                  : isGoal(x, y)
                  ? "bg-amber-200 border-2 border-amber-400"
                  : "bg-white/80 border-2 border-cyan-200 hover:border-cyan-300"
              }
              ${isRobot(x, y) && showError ? "bg-red-200" : ""}
              ${isRobot(x, y) && showSuccess ? "bg-emerald-200" : ""}
            `}
          >
            {/* Robot */}
            {isRobot(x, y) && (
              <div
                className={`
                  ${getRotation()}
                  transition-transform duration-300
                  ${isAnimating ? "scale-110" : "scale-100"}
                `}
              >
                {showError ? (
                  <XCircle
                    className="text-red-500 animate-pulse"
                    size={gridSize <= 3 ? 40 : gridSize <= 4 ? 32 : 24}
                  />
                ) : (
                  <Bot
                    className={`
                      ${showSuccess ? "text-emerald-600" : "text-cyan-600"}
                      ${isAnimating ? "animate-bounce" : ""}
                    `}
                    size={gridSize <= 3 ? 40 : gridSize <= 4 ? 32 : 24}
                  />
                )}
              </div>
            )}

            {/* Goal */}
            {isGoal(x, y) && !isRobot(x, y) && (
              <Flag
                className={`
                  text-amber-500
                  ${showSuccess ? "text-emerald-500" : ""}
                  animate-pulse
                `}
                size={gridSize <= 3 ? 36 : gridSize <= 4 ? 28 : 20}
              />
            )}

            {/* Obstacle */}
            {isObstacle(x, y) && (
              <div className="w-3/4 h-3/4 bg-gray-500 rounded-md shadow-inner" />
            )}
          </div>
        ))}
      </div>

      {/* Grid legend */}
      <div className="flex items-center gap-6 mt-4 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <Bot size={18} className="text-cyan-600" />
          <span>רובוט</span>
        </div>
        <div className="flex items-center gap-2">
          <Flag size={18} className="text-amber-500" />
          <span>יעד</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-400 rounded-sm" />
          <span>מכשול</span>
        </div>
      </div>
    </div>
  );
});
