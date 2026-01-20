"use client";

import { Icon, IconName } from "@/components/ui/Icon";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { GAME_INFO, DIFFICULTY_LABELS } from "@/lib/constants/games";
import type { GameContent, GameType, Difficulty } from "@/types/games";
import type { Grade } from "@/types";
import { Edit, Trash2, ChevronDown } from "lucide-react";

// Grade labels for display
const GRADE_LABELS: Grade[] = ["א", "ב", "ג", "ד", "ה", "ו"];

interface GameContentTableProps {
  content: GameContent[];
  isLoading: boolean;
  onEdit: (item: GameContent) => void;
  onDelete: (id: string) => void;
  filters: {
    gameType: GameType | "";
    grade: Grade | "";
    difficulty: Difficulty | "";
  };
  onFilterChange: (key: string, value: string) => void;
}

export function GameContentTable({
  content,
  isLoading,
  onEdit,
  onDelete,
  filters,
  onFilterChange,
}: GameContentTableProps) {
  // Filter content based on current filters
  const filteredContent = content.filter((item) => {
    if (filters.gameType && item.gameType !== filters.gameType) return false;
    if (filters.grade && item.grade !== filters.grade) return false;
    if (filters.difficulty && item.difficulty !== filters.difficulty) return false;
    return true;
  });

  // Format date for display
  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat("he-IL", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date instanceof Date ? date : new Date(date));
  };

  return (
    <div className="bg-surface-0 rounded-xl shadow-sm overflow-hidden">
      {/* Filters */}
      <div className="p-4 border-b border-surface-2 flex flex-wrap gap-4">
        {/* Game Type Filter */}
        <div className="relative">
          <select
            value={filters.gameType}
            onChange={(e) => onFilterChange("gameType", e.target.value)}
            className="appearance-none px-4 py-2 pr-10 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent cursor-pointer min-w-[160px]"
          >
            <option value="">כל המשחקים</option>
            {(Object.keys(GAME_INFO) as GameType[]).map((type) => (
              <option key={type} value={type}>
                {GAME_INFO[type].nameHe}
              </option>
            ))}
          </select>
          <ChevronDown
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>

        {/* Grade Filter */}
        <div className="relative">
          <select
            value={filters.grade}
            onChange={(e) => onFilterChange("grade", e.target.value)}
            className="appearance-none px-4 py-2 pr-10 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent cursor-pointer min-w-[120px]"
          >
            <option value="">כל הכיתות</option>
            {GRADE_LABELS.map((grade) => (
              <option key={grade} value={grade}>
                כיתה {grade}
              </option>
            ))}
          </select>
          <ChevronDown
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>

        {/* Difficulty Filter */}
        <div className="relative">
          <select
            value={filters.difficulty}
            onChange={(e) => onFilterChange("difficulty", e.target.value)}
            className="appearance-none px-4 py-2 pr-10 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent cursor-pointer min-w-[120px]"
          >
            <option value="">כל הרמות</option>
            {(Object.keys(DIFFICULTY_LABELS) as Difficulty[]).map((diff) => (
              <option key={diff} value={diff}>
                {DIFFICULTY_LABELS[diff]}
              </option>
            ))}
          </select>
          <ChevronDown
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="p-4">
          <SkeletonTable rows={5} columns={5} />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredContent.length === 0 && (
        <div className="p-8">
          <EmptyState
            icon="gamepad-2"
            title="אין תוכן להצגה"
            description={
              content.length === 0
                ? "עדיין לא נוסף תוכן למשחקים. לחץ על 'הוסף תוכן' להוספת תוכן ראשון."
                : "לא נמצא תוכן התואם לסינון שנבחר. נסה לשנות את הסינון."
            }
          />
        </div>
      )}

      {/* Table */}
      {!isLoading && filteredContent.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-surface-1 text-right">
                <th className="px-4 py-3 text-sm font-semibold text-gray-700">
                  משחק
                </th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-700">
                  כיתה
                </th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-700">
                  רמה
                </th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-700">
                  תאריך
                </th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-700">
                  פעולות
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredContent.map((item) => {
                const gameInfo = GAME_INFO[item.gameType];
                return (
                  <tr
                    key={item.id}
                    className="border-t border-surface-2 hover:bg-surface-1/50 transition-colors"
                  >
                    {/* Game */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 rounded-lg">
                          <Icon
                            name={gameInfo.icon as IconName}
                            size="sm"
                            className="text-emerald-600"
                          />
                        </div>
                        <span className="font-medium text-gray-900">
                          {gameInfo.nameHe}
                        </span>
                      </div>
                    </td>

                    {/* Grade */}
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2.5 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">
                        כיתה {item.grade}
                      </span>
                    </td>

                    {/* Difficulty */}
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-lg text-sm font-medium ${
                          item.difficulty === "easy"
                            ? "bg-green-100 text-green-700"
                            : item.difficulty === "medium"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {DIFFICULTY_LABELS[item.difficulty]}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3 text-gray-600 text-sm">
                      {formatDate(item.createdAt)}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onEdit(item)}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="ערוך"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => onDelete(item.id)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="מחק"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
