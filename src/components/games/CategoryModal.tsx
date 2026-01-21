"use client";

import { useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { X, Swords, Timer } from "lucide-react";
import { Icon, type IconName } from "@/components/ui/Icon";
import { GAME_INFO } from "@/lib/constants/games";
import type { CategoryInfo, GameType } from "@/types/games";

// Games that are currently implemented
const IMPLEMENTED_GAMES: GameType[] = ["hangman", "wordSearch", "memory"];

interface CategoryModalProps {
  isOpen: boolean;
  category: CategoryInfo | null;
  onClose: () => void;
}

// Color styles mapping for categories
const colorStyles: Record<
  string,
  {
    gradient: string;
    headerBg: string;
    text: string;
    badgeBg: string;
  }
> = {
  amber: {
    gradient: "from-amber-400/20 to-yellow-500/20",
    headerBg: "bg-amber-500",
    text: "text-amber-600",
    badgeBg: "bg-amber-100 text-amber-700",
  },
  violet: {
    gradient: "from-violet-400/20 to-purple-500/20",
    headerBg: "bg-violet-500",
    text: "text-violet-600",
    badgeBg: "bg-violet-100 text-violet-700",
  },
  cyan: {
    gradient: "from-cyan-400/20 to-teal-500/20",
    headerBg: "bg-cyan-500",
    text: "text-cyan-600",
    badgeBg: "bg-cyan-100 text-cyan-700",
  },
  orange: {
    gradient: "from-orange-400/20 to-red-500/20",
    headerBg: "bg-orange-500",
    text: "text-orange-600",
    badgeBg: "bg-orange-100 text-orange-700",
  },
  pink: {
    gradient: "from-pink-400/20 to-rose-500/20",
    headerBg: "bg-pink-500",
    text: "text-pink-600",
    badgeBg: "bg-pink-100 text-pink-700",
  },
  indigo: {
    gradient: "from-indigo-400/20 to-blue-500/20",
    headerBg: "bg-indigo-500",
    text: "text-indigo-600",
    badgeBg: "bg-indigo-100 text-indigo-700",
  },
};

export function CategoryModal({ isOpen, category, onClose }: CategoryModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const params = useParams();
  const role = params.role as string;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [isOpen]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    dialog.addEventListener("keydown", handleKeyDown);
    return () => dialog.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleGameClick = (gameType: GameType) => {
    router.push(`/${role}/games/${gameType}`);
    onClose();
  };

  if (!category) return null;

  const colors = colorStyles[category.color] || colorStyles.amber;

  return (
    <dialog
      ref={dialogRef}
      className="fixed inset-0 m-auto h-fit z-50 rounded-2xl p-0 backdrop:bg-black/50 backdrop:animate-fade-in max-w-lg w-full shadow-2xl animate-scale-in border-0 bg-transparent"
      onClose={onClose}
    >
      <div className="bg-white rounded-2xl overflow-hidden" dir="rtl">
        {/* Header */}
        <div className={`${colors.headerBg} p-4 relative`}>
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 left-3 p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all duration-200 cursor-pointer"
            aria-label="סגור"
          >
            <X size={20} />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <Icon
                name={category.icon as IconName}
                size="lg"
                className="text-white"
              />
            </div>
            <div>
              <h2 className="text-xl font-rubik font-bold text-white">
                {category.nameHe}
              </h2>
              <p className="text-sm text-white/80">
                {category.games.length} משחקים
              </p>
            </div>
          </div>
        </div>

        {/* Games grid */}
        <div className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {category.games.map((gameType) => {
              const gameInfo = GAME_INFO[gameType as GameType];
              const isImplemented = IMPLEMENTED_GAMES.includes(gameType as GameType);
              return (
                <button
                  key={gameType}
                  onClick={() => isImplemented && handleGameClick(gameType as GameType)}
                  disabled={!isImplemented}
                  className={`
                    p-4 rounded-xl border-2 border-surface-2
                    bg-gradient-to-br ${colors.gradient}
                    transition-all duration-200
                    text-right group relative
                    ${isImplemented
                      ? "hover:border-opacity-50 hover:shadow-md cursor-pointer"
                      : "opacity-60 cursor-not-allowed"
                    }
                  `}
                >
                  {/* Coming Soon badge */}
                  {!isImplemented && (
                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-gray-500 text-white text-xs font-medium rounded-full">
                      בקרוב
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <div
                      className={`
                        w-10 h-10 rounded-lg bg-white/60
                        flex items-center justify-center
                        transition-transform duration-200
                        ${isImplemented ? "group-hover:scale-110" : ""}
                      `}
                    >
                      <Icon
                        name={gameInfo.icon as IconName}
                        size="md"
                        className={isImplemented ? colors.text : "text-gray-400"}
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-rubik font-semibold mb-1 ${isImplemented ? "text-foreground" : "text-gray-500"}`}>
                        {gameInfo.nameHe}
                      </h3>
                      {/* Badges */}
                      <div className="flex gap-2 flex-wrap">
                        {gameInfo.hasHeadToHead && (
                          <span
                            className={`
                              inline-flex items-center gap-1 px-2 py-0.5
                              text-xs font-medium rounded-full
                              ${isImplemented ? colors.badgeBg : "bg-gray-100 text-gray-500"}
                            `}
                          >
                            <Swords size={12} />
                            ראש בראש
                          </span>
                        )}
                        {gameInfo.defaultTimer && (
                          <span
                            className={`
                              inline-flex items-center gap-1 px-2 py-0.5
                              text-xs font-medium rounded-full
                              bg-gray-100 text-gray-700
                            `}
                          >
                            <Timer size={12} />
                            עם טיימר
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </dialog>
  );
}
