"use client";

import { Coins, AlertTriangle } from "lucide-react";

interface BudgetDisplayProps {
  budget: number;
  spent: number;
}

/**
 * Displays the remaining budget and spending status.
 */
export function BudgetDisplay({ budget, spent }: BudgetDisplayProps) {
  const remaining = budget - spent;
  const percentUsed = (spent / budget) * 100;
  const isLow = remaining < budget * 0.2;
  const isOver = remaining < 0;

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-md border-2 border-orange-200">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Coins className="text-orange-500" size={20} />
          <span className="font-rubik font-bold text-gray-700">תקציב</span>
        </div>
        {isOver && (
          <div className="flex items-center gap-1 text-red-600">
            <AlertTriangle size={16} />
            <span className="text-xs font-medium">חריגה!</span>
          </div>
        )}
        {isLow && !isOver && (
          <div className="flex items-center gap-1 text-amber-600">
            <AlertTriangle size={16} />
            <span className="text-xs font-medium">תקציב נמוך</span>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="h-3 bg-gray-200 rounded-full overflow-hidden mb-2">
        <div
          className={`h-full transition-all duration-300 ${
            isOver
              ? "bg-red-500"
              : isLow
              ? "bg-amber-500"
              : "bg-emerald-500"
          }`}
          style={{ width: `${Math.min(percentUsed, 100)}%` }}
        />
      </div>

      {/* Numbers */}
      <div className="flex items-center justify-between text-sm">
        <div className="text-gray-500">
          שימוש: <span className="font-bold text-gray-700">{spent}</span>
        </div>
        <div className={`font-bold ${isOver ? "text-red-600" : isLow ? "text-amber-600" : "text-emerald-600"}`}>
          נותר: {remaining}
        </div>
      </div>
    </div>
  );
}
