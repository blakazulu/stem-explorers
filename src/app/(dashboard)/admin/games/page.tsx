"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Gamepad2, Check } from "lucide-react";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Skeleton } from "@/components/ui/Skeleton";
import { GameContentModal } from "@/components/admin/games/GameContentModal";
import { useAllGameContent } from "@/lib/queries/games";
import { useAuth } from "@/contexts/AuthContext";
import { GAME_CATEGORIES, GAME_INFO } from "@/lib/constants/games";
import type { GameType } from "@/types/games";

// Games that have content management implemented
const MANAGEABLE_GAMES: GameType[] = ["hangman", "wordSearch", "memory"];

export default function AdminGamesPage() {
  const router = useRouter();
  const { session } = useAuth();
  const [selectedGame, setSelectedGame] = useState<GameType | null>(null);

  // Fetch all game content to show which games have content
  const { data: allContent = [], isLoading } = useAllGameContent();

  // Redirect non-admins
  useEffect(() => {
    if (session && session.user.role !== "admin") {
      router.replace(`/${session.user.role}`);
    }
  }, [session, router]);

  if (!session || session.user.role !== "admin") {
    return null;
  }

  // Count content per game type
  const contentCounts = allContent.reduce((acc, item) => {
    acc[item.gameType] = (acc[item.gameType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Category color styles
  const categoryColors: Record<string, { bg: string; border: string; text: string }> = {
    amber: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700" },
    violet: { bg: "bg-violet-50", border: "border-violet-200", text: "text-violet-700" },
    cyan: { bg: "bg-cyan-50", border: "border-cyan-200", text: "text-cyan-700" },
    orange: { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700" },
    pink: { bg: "bg-pink-50", border: "border-pink-200", text: "text-pink-700" },
    indigo: { bg: "bg-indigo-50", border: "border-indigo-200", text: "text-indigo-700" },
  };

  return (
    <div className="p-6 max-w-6xl mx-auto" dir="rtl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Gamepad2 className="w-6 h-6 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-rubik font-bold text-gray-900">
            ניהול תוכן משחקים
          </h1>
        </div>
        <p className="text-gray-600">
          צפייה ועריכה של תוכן המשחקים לפי קטגוריה, כיתה ורמת קושי
        </p>
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} variant="card" className="h-48" />
          ))}
        </div>
      ) : (
        /* Category cards */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {GAME_CATEGORIES.map((category) => {
            const colors = categoryColors[category.color] || categoryColors.indigo;

            return (
              <div
                key={category.id}
                className={`
                  ${colors.bg} ${colors.border}
                  border-2 rounded-xl p-5
                `}
              >
                {/* Category header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-lg bg-white/60`}>
                    <Icon
                      name={category.icon as IconName}
                      size="md"
                      className={colors.text}
                    />
                  </div>
                  <h2 className={`text-lg font-rubik font-bold ${colors.text}`}>
                    {category.nameHe}
                  </h2>
                </div>

                {/* Games list */}
                <div className="space-y-2">
                  {category.games.map((gameType) => {
                    const gameInfo = GAME_INFO[gameType];
                    const count = contentCounts[gameType] || 0;
                    const isManageable = MANAGEABLE_GAMES.includes(gameType);
                    const hasContent = count > 0;

                    return (
                      <button
                        key={gameType}
                        onClick={() => isManageable && setSelectedGame(gameType)}
                        disabled={!isManageable}
                        className={`
                          w-full flex items-center justify-between
                          px-3 py-2.5 rounded-lg
                          transition-all duration-150
                          ${isManageable
                            ? "bg-white/80 hover:bg-white hover:shadow-sm cursor-pointer"
                            : "bg-white/40 cursor-not-allowed opacity-60"
                          }
                        `}
                      >
                        <div className="flex items-center gap-2">
                          <Icon
                            name={gameInfo.icon as IconName}
                            size="sm"
                            className={isManageable ? "text-gray-600" : "text-gray-400"}
                          />
                          <span className={`font-medium ${isManageable ? "text-gray-800" : "text-gray-500"}`}>
                            {gameInfo.nameHe}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {hasContent && (
                            <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full flex items-center gap-1">
                              <Check size={12} />
                              {count}
                            </span>
                          )}
                          {!isManageable && (
                            <span className="text-xs text-gray-400">בקרוב</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Game content modal */}
      <GameContentModal
        gameType={selectedGame}
        isOpen={selectedGame !== null}
        onClose={() => setSelectedGame(null)}
      />
    </div>
  );
}
