"use client";

import { Icon, type IconName } from "@/components/ui/Icon";
import { GAME_INFO } from "@/lib/constants/games";
import type { CategoryInfo, GameType } from "@/types/games";

// Games that are currently implemented
const IMPLEMENTED_GAMES: GameType[] = ["hangman", "wordSearch", "memory"];

interface CategoryCardProps {
  category: CategoryInfo;
  onClick: () => void;
}

// Color styles mapping for categories
const colorStyles: Record<
  string,
  {
    gradient: string;
    border: string;
    text: string;
    glow: string;
  }
> = {
  amber: {
    gradient: "from-amber-400/20 to-yellow-500/20",
    border: "border-amber-400/30",
    text: "text-amber-600",
    glow: "hover:shadow-amber-400/30",
  },
  violet: {
    gradient: "from-violet-400/20 to-purple-500/20",
    border: "border-violet-400/30",
    text: "text-violet-600",
    glow: "hover:shadow-violet-400/30",
  },
  cyan: {
    gradient: "from-cyan-400/20 to-teal-500/20",
    border: "border-cyan-400/30",
    text: "text-cyan-600",
    glow: "hover:shadow-cyan-400/30",
  },
  orange: {
    gradient: "from-orange-400/20 to-red-500/20",
    border: "border-orange-400/30",
    text: "text-orange-600",
    glow: "hover:shadow-orange-400/30",
  },
  pink: {
    gradient: "from-pink-400/20 to-rose-500/20",
    border: "border-pink-400/30",
    text: "text-pink-600",
    glow: "hover:shadow-pink-400/30",
  },
  indigo: {
    gradient: "from-indigo-400/20 to-blue-500/20",
    border: "border-indigo-400/30",
    text: "text-indigo-600",
    glow: "hover:shadow-indigo-400/30",
  },
};

export function CategoryCard({ category, onClick }: CategoryCardProps) {
  const colors = colorStyles[category.color] || colorStyles.amber;
  const gameCount = category.games.length;

  // Check if category has any implemented games
  const hasImplementedGames = category.games.some((game) =>
    IMPLEMENTED_GAMES.includes(game as GameType)
  );

  return (
    <button
      onClick={hasImplementedGames ? onClick : undefined}
      disabled={!hasImplementedGames}
      aria-label={`פתח קטגוריית ${category.nameHe}`}
      className={`
        relative w-full p-5 rounded-2xl border-2
        bg-gradient-to-br ${colors.gradient} ${colors.border}
        transition-all duration-300 ease-out
        text-right
        ${hasImplementedGames
          ? "hover:scale-105 hover:shadow-xl cursor-pointer group " + colors.glow
          : "opacity-60 cursor-not-allowed"
        }
      `}
    >
      {/* Coming Soon badge */}
      {!hasImplementedGames && (
        <div className="absolute top-3 left-3 px-2 py-1 bg-gray-500 text-white text-xs font-medium rounded-full z-10">
          בקרוב
        </div>
      )}
      {/* Main icon */}
      <div
        className={`
          w-14 h-14 rounded-xl
          bg-white/60 backdrop-blur-sm
          flex items-center justify-center
          mb-4 transition-transform duration-300
          ${hasImplementedGames ? "group-hover:scale-110 group-hover:rotate-3" : ""}
        `}
      >
        <Icon
          name={category.icon as IconName}
          size="lg"
          className={hasImplementedGames ? colors.text : "text-gray-400"}
        />
      </div>

      {/* Category name */}
      <h3 className={`text-lg font-rubik font-bold mb-2 ${hasImplementedGames ? colors.text : "text-gray-500"}`}>
        {category.nameHe}
      </h3>

      {/* Game count */}
      <p className="text-sm text-gray-500 mb-3">
        {gameCount} {gameCount === 1 ? "משחק" : "משחקים"}
      </p>

      {/* Mini game icons */}
      <div className="flex gap-2 flex-wrap">
        {category.games.slice(0, 4).map((gameType) => {
          const gameInfo = GAME_INFO[gameType as GameType];
          return (
            <div
              key={gameType}
              className="w-8 h-8 rounded-lg bg-white/50 flex items-center justify-center"
              title={gameInfo.nameHe}
            >
              <Icon
                name={gameInfo.icon as IconName}
                size="sm"
                className="text-gray-600"
              />
            </div>
          );
        })}
      </div>

      {/* Decorative pattern overlay */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none rounded-2xl overflow-hidden"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='10' cy='10' r='2' fill='currentColor'/%3E%3C/svg%3E")`,
          backgroundSize: "20px 20px",
        }}
      />
    </button>
  );
}
