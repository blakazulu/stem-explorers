"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowRight,
  Star,
  Timer,
  TimerOff,
  Users,
  ChevronDown,
} from "lucide-react";
import { Icon, IconName } from "@/components/ui/Icon";
import { GAME_INFO, DIFFICULTY_LABELS } from "@/lib/constants/games";
import type { GameType, Difficulty, GameSession } from "@/types/games";

interface GameLayoutProps {
  gameType: GameType;
  children: ReactNode;
  session: GameSession;
  difficulty: Difficulty;
  onDifficultyChange: (diff: Difficulty) => void;
  timerEnabled: boolean;
  onTimerToggle: () => void;
  onHeadToHead?: () => void;
  timeRemaining?: number; // in seconds
}

export function GameLayout({
  gameType,
  children,
  session,
  difficulty,
  onDifficultyChange,
  timerEnabled,
  onTimerToggle,
  onHeadToHead,
  timeRemaining,
}: GameLayoutProps) {
  const params = useParams();
  const role = params.role as string;
  const gameInfo = GAME_INFO[gameType];

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Check if this is a racing game (timer enabled by default)
  const isRacingGame = gameInfo.defaultTimer;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-gradient-to-br from-emerald-50 to-teal-50"
      dir="rtl"
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        {/* Left section: Back button + Game title */}
        <div className="flex items-center gap-4">
          <Link
            href={`/${role}/games`}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowRight size={20} />
            <span className="text-sm font-medium">חזרה</span>
          </Link>

          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Icon
                name={gameInfo.icon as IconName}
                size="md"
                className="text-emerald-600"
              />
            </div>
            <h1 className="text-lg font-rubik font-bold text-gray-900">
              {gameInfo.nameHe}
            </h1>
          </div>
        </div>

        {/* Center section: Score + Progress + Timer */}
        <div className="flex items-center gap-6">
          {/* Score */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-100 rounded-lg">
            <Star size={18} className="text-amber-500 fill-amber-500" />
            <span className="font-medium text-amber-700">{session.score}</span>
          </div>

          {/* Progress */}
          {session.totalQuestions > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 rounded-lg">
              <span className="text-sm font-medium text-blue-700">
                {session.currentQuestion}/{session.totalQuestions}
              </span>
            </div>
          )}

          {/* Timer */}
          {timerEnabled && timeRemaining !== undefined && (
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                timeRemaining <= 10
                  ? "bg-red-100 text-red-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              <Timer size={18} />
              <span className="font-mono font-medium">
                {formatTime(timeRemaining)}
              </span>
            </div>
          )}
        </div>

        {/* Right section: Difficulty + Timer toggle + Head-to-head */}
        <div className="flex items-center gap-3">
          {/* Difficulty selector */}
          <div className="relative">
            <select
              value={difficulty}
              onChange={(e) => onDifficultyChange(e.target.value as Difficulty)}
              className="appearance-none px-4 py-2 pr-8 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent cursor-pointer"
            >
              {(Object.keys(DIFFICULTY_LABELS) as Difficulty[]).map((diff) => (
                <option key={diff} value={diff}>
                  {DIFFICULTY_LABELS[diff]}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>

          {/* Timer toggle (only for non-racing games) */}
          {!isRacingGame && (
            <button
              onClick={onTimerToggle}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                timerEnabled
                  ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
              title={timerEnabled ? "השבת טיימר" : "הפעל טיימר"}
            >
              {timerEnabled ? <Timer size={18} /> : <TimerOff size={18} />}
            </button>
          )}

          {/* Head-to-head button */}
          {gameInfo.hasHeadToHead && onHeadToHead && (
            <button
              onClick={onHeadToHead}
              className="flex items-center gap-2 px-4 py-2 bg-violet-100 text-violet-700 hover:bg-violet-200 rounded-lg transition-colors"
            >
              <Users size={18} />
              <span className="text-sm font-medium">ראש בראש</span>
            </button>
          )}
        </div>
      </div>

      {/* Game Area */}
      <div className="flex-1 flex items-center justify-center overflow-auto p-4">
        {children}
      </div>
    </div>
  );
}
