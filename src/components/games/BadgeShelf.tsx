"use client";

import { useState, useRef, useEffect } from "react";
import { Trophy, Lock, X } from "lucide-react";
import { Icon, type IconName } from "@/components/ui/Icon";
import { BADGE_DEFINITIONS } from "@/lib/constants/games";
import type { EarnedBadge } from "@/types/games";

interface BadgeShelfProps {
  earnedBadges: EarnedBadge[];
  isLoading?: boolean;
}

// Badge category colors
const categoryColors: Record<string, string> = {
  general: "bg-emerald-500",
  quiz: "bg-amber-500",
  memory: "bg-violet-500",
  logic: "bg-cyan-500",
  math: "bg-orange-500",
  words: "bg-pink-500",
  build: "bg-indigo-500",
};

export function BadgeShelf({ earnedBadges, isLoading = false }: BadgeShelfProps) {
  const [showAllModal, setShowAllModal] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const totalBadges = BADGE_DEFINITIONS.length;
  const earnedBadgeIds = new Set(earnedBadges.map((b) => b.badgeId));
  const earnedCount = earnedBadges.length;

  // Get first 5 badges to display (prioritize earned ones)
  const displayBadges = [...BADGE_DEFINITIONS]
    .sort((a, b) => {
      const aEarned = earnedBadgeIds.has(a.id) ? 0 : 1;
      const bEarned = earnedBadgeIds.has(b.id) ? 0 : 1;
      return aEarned - bEarned;
    })
    .slice(0, 5);

  // Handle modal open/close
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (showAllModal) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [showAllModal]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowAllModal(false);
      }
    };

    dialog.addEventListener("keydown", handleKeyDown);
    return () => dialog.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (isLoading) {
    return (
      <div className="bg-surface-0 rounded-xl p-4 shadow-sm animate-pulse">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-surface-2 rounded-lg" />
            <div className="h-5 w-24 bg-surface-2 rounded" />
          </div>
          <div className="h-5 w-16 bg-surface-2 rounded" />
        </div>
        <div className="flex gap-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-12 h-12 bg-surface-2 rounded-full"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-surface-0 rounded-xl p-4 shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-100 rounded-lg">
              <Trophy size={20} className="text-amber-600" />
            </div>
            <h3 className="font-rubik font-semibold text-foreground">
              ההישגים שלי
            </h3>
          </div>
          <button
            onClick={() => setShowAllModal(true)}
            className="text-sm text-primary hover:text-primary/80 font-medium cursor-pointer transition-colors"
          >
            {earnedCount}/{totalBadges} הישגים
          </button>
        </div>

        {/* Badge circles */}
        <div className="flex gap-3 flex-wrap">
          {displayBadges.map((badge) => {
            const isEarned = earnedBadgeIds.has(badge.id);
            const bgColor = categoryColors[badge.category] || categoryColors.general;

            return (
              <div
                key={badge.id}
                className="relative group"
                title={isEarned ? badge.nameHe : `${badge.nameHe} (נעול)`}
              >
                <div
                  className={`
                    w-12 h-12 rounded-full
                    flex items-center justify-center
                    transition-transform duration-200
                    ${isEarned
                      ? `${bgColor} group-hover:scale-110`
                      : "bg-gray-200"
                    }
                  `}
                >
                  {isEarned ? (
                    <Icon
                      name={badge.icon as IconName}
                      size="md"
                      className="text-white"
                    />
                  ) : (
                    <Lock size={18} className="text-gray-400" />
                  )}
                </div>
                {/* Tooltip */}
                <div
                  className={`
                    absolute bottom-full left-1/2 -translate-x-1/2 mb-2
                    px-2 py-1 rounded-lg text-xs font-medium
                    whitespace-nowrap opacity-0 pointer-events-none
                    transition-opacity duration-200
                    group-hover:opacity-100
                    ${isEarned ? "bg-gray-800 text-white" : "bg-gray-600 text-gray-200"}
                  `}
                >
                  {badge.nameHe}
                  {!isEarned && " (נעול)"}
                </div>
              </div>
            );
          })}

          {/* Show more indicator if there are more badges */}
          {totalBadges > 5 && (
            <button
              onClick={() => setShowAllModal(true)}
              className="w-12 h-12 rounded-full bg-surface-2 flex items-center justify-center text-sm font-medium text-gray-500 hover:bg-surface-3 transition-colors cursor-pointer"
            >
              +{totalBadges - 5}
            </button>
          )}
        </div>
      </div>

      {/* All Badges Modal */}
      <dialog
        ref={dialogRef}
        className="fixed inset-0 m-auto h-fit z-50 rounded-2xl p-0 backdrop:bg-black/50 backdrop:animate-fade-in max-w-xl w-full max-h-[80vh] shadow-2xl animate-scale-in border-0 bg-transparent"
        onClose={() => setShowAllModal(false)}
      >
        <div className="bg-white rounded-2xl overflow-hidden" dir="rtl">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-500 to-yellow-500 p-4 relative">
            <button
              onClick={() => setShowAllModal(false)}
              className="absolute top-3 left-3 p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all duration-200 cursor-pointer"
              aria-label="סגור"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <Trophy size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-rubik font-bold text-white">
                  כל ההישגים
                </h2>
                <p className="text-sm text-white/80">
                  {earnedCount} מתוך {totalBadges} הושגו
                </p>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="px-4 pt-4">
            <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-yellow-500 transition-all duration-500"
                style={{ width: `${(earnedCount / totalBadges) * 100}%` }}
              />
            </div>
          </div>

          {/* Badges grid */}
          <div className="p-4 max-h-[50vh] overflow-y-auto">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {BADGE_DEFINITIONS.map((badge) => {
                const isEarned = earnedBadgeIds.has(badge.id);
                const bgColor = categoryColors[badge.category] || categoryColors.general;
                const earnedBadge = earnedBadges.find((b) => b.badgeId === badge.id);

                return (
                  <div
                    key={badge.id}
                    className={`
                      p-3 rounded-xl border-2
                      ${isEarned
                        ? "border-amber-200 bg-amber-50/50"
                        : "border-surface-2 bg-surface-1 opacity-60"
                      }
                    `}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className={`
                          w-10 h-10 rounded-full
                          flex items-center justify-center
                          ${isEarned ? bgColor : "bg-gray-200"}
                        `}
                      >
                        {isEarned ? (
                          <Icon
                            name={badge.icon as IconName}
                            size="md"
                            className="text-white"
                          />
                        ) : (
                          <Lock size={16} className="text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-rubik font-semibold text-sm text-foreground truncate">
                          {badge.nameHe}
                        </h4>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      {badge.description}
                    </p>
                    {isEarned && earnedBadge && (
                      <p className="text-xs text-amber-600 mt-1">
                        הושג ב-{new Date(earnedBadge.earnedAt).toLocaleDateString("he-IL")}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </dialog>
    </>
  );
}
