"use client";

import { useState, useCallback } from "react";
import { useParams, useRouter, notFound } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { GameLayout } from "@/components/games/GameLayout";
import { HangmanGame } from "@/components/games/hangman";
import { WordSearchGame } from "@/components/games/word-search";
import { MemoryGame } from "@/components/games/memory";
import { QuizGame } from "@/components/games/quiz";
import { SortGame } from "@/components/games/sort";
import { Icon, IconName } from "@/components/ui/Icon";
import { GAME_INFO, DIFFICULTY_LABELS } from "@/lib/constants/games";
import { Skeleton } from "@/components/ui/Skeleton";
import type { Grade } from "@/types";
import type { GameType, Difficulty, GameSession } from "@/types/games";

export default function GamePage() {
  const params = useParams();
  const router = useRouter();
  const { session: authSession, loading: authLoading } = useAuth();
  const role = params.role as string;
  const gameType = params.gameType as string;

  // Validate gameType exists in GAME_INFO
  const isValidGameType = gameType in GAME_INFO;
  const gameInfo = isValidGameType ? GAME_INFO[gameType as GameType] : null;

  // Initialize game state
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [timerEnabled, setTimerEnabled] = useState(
    gameInfo?.defaultTimer ?? false
  );

  // Initialize game session with mutable score
  const [gameSession, setGameSession] = useState<GameSession>(() => ({
    gameType: gameType as GameType,
    difficulty: "easy",
    currentQuestion: 0,
    totalQuestions: 0,
    score: 0,
    startTime: new Date(),
    timerEnabled: gameInfo?.defaultTimer ?? false,
    isHeadToHead: false,
  }));

  // Track if game is complete for showing results
  const [gameComplete, setGameComplete] = useState(false);
  const [gameWon, setGameWon] = useState(false);

  // Get user's grade (students have assigned grade, admins use default)
  const userGrade: Grade = authSession?.user?.grade || "א";

  // Validate role - only admin and student can access
  const allowedRoles = ["admin", "student"];
  const isAuthorized = allowedRoles.includes(role);

  // Show loading while checking auth
  if (authLoading) {
    return <GamePageSkeleton />;
  }

  // Redirect if not authorized
  if (!isAuthorized) {
    router.replace(`/${authSession?.user?.role || "student"}`);
    return null;
  }

  // Show 404 if game type is invalid
  if (!isValidGameType || !gameInfo) {
    notFound();
  }

  const handleDifficultyChange = (newDifficulty: Difficulty) => {
    setDifficulty(newDifficulty);
    // Reset game state when difficulty changes
    setGameComplete(false);
    setGameWon(false);
    setGameSession((prev) => ({
      ...prev,
      difficulty: newDifficulty,
      score: 0,
      startTime: new Date(),
    }));
  };

  const handleTimerToggle = () => {
    setTimerEnabled(!timerEnabled);
  };

  const handleHeadToHead = () => {
    // TODO: Implement head-to-head mode
  };

  // Handle score updates from games
  const handleScoreUpdate = useCallback((newScore: number) => {
    setGameSession((prev) => ({
      ...prev,
      score: newScore,
    }));
  }, []);

  // Handle game completion
  const handleGameComplete = useCallback((won: boolean) => {
    setGameComplete(true);
    setGameWon(won);
  }, []);

  // Render game content based on game type
  const renderGameContent = () => {
    switch (gameType) {
      case "hangman":
        return (
          <HangmanGame
            grade={userGrade}
            difficulty={difficulty}
            onScoreUpdate={handleScoreUpdate}
            onGameComplete={handleGameComplete}
          />
        );
      case "wordSearch":
        return (
          <WordSearchGame
            grade={userGrade}
            difficulty={difficulty}
            onScoreUpdate={handleScoreUpdate}
            onGameComplete={handleGameComplete}
          />
        );
      case "memory":
        return (
          <MemoryGame
            grade={userGrade}
            difficulty={difficulty}
            onScoreUpdate={handleScoreUpdate}
            onGameComplete={handleGameComplete}
          />
        );
      case "quiz":
        return (
          <QuizGame
            grade={userGrade}
            difficulty={difficulty}
            onScoreUpdate={handleScoreUpdate}
            onGameComplete={handleGameComplete}
          />
        );
      case "sort":
        return (
          <SortGame
            grade={userGrade}
            difficulty={difficulty}
            onScoreUpdate={handleScoreUpdate}
            onGameComplete={handleGameComplete}
          />
        );
      default:
        // Placeholder for games not yet implemented
        return (
          <div className="flex flex-col items-center justify-center text-center space-y-6">
            <div className="p-6 bg-white/60 rounded-2xl shadow-lg">
              <Icon
                name={gameInfo.icon as IconName}
                size={80}
                className="text-emerald-500 mx-auto mb-4"
              />
              <h2 className="text-2xl font-rubik font-bold text-gray-800 mb-2">
                {gameInfo.nameHe}
              </h2>
              <p className="text-lg text-gray-600 mb-4">
                המשחק בבנייה - בקרוב!
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg">
                <span className="text-sm font-medium">
                  רמת קושי: {DIFFICULTY_LABELS[difficulty]}
                </span>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <GameLayout
      gameType={gameType as GameType}
      session={gameSession}
      difficulty={difficulty}
      onDifficultyChange={handleDifficultyChange}
      timerEnabled={timerEnabled}
      onTimerToggle={handleTimerToggle}
      onHeadToHead={gameInfo.hasHeadToHead ? handleHeadToHead : undefined}
    >
      {renderGameContent()}
    </GameLayout>
  );
}

// Loading skeleton component
function GamePageSkeleton() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gradient-to-br from-emerald-50 to-teal-50">
      {/* Top bar skeleton */}
      <div className="flex items-center justify-between px-4 py-3 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="flex items-center gap-4">
          <Skeleton variant="rectangular" width={80} height={36} className="rounded-lg" />
          <div className="flex items-center gap-2">
            <Skeleton variant="rectangular" width={40} height={40} className="rounded-lg" />
            <Skeleton variant="text" width={120} height={24} />
          </div>
        </div>
        <div className="flex items-center gap-6">
          <Skeleton variant="rectangular" width={80} height={32} className="rounded-lg" />
          <Skeleton variant="rectangular" width={60} height={32} className="rounded-lg" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton variant="rectangular" width={100} height={36} className="rounded-lg" />
          <Skeleton variant="rectangular" width={40} height={36} className="rounded-lg" />
        </div>
      </div>

      {/* Game area skeleton */}
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Skeleton variant="rectangular" width={120} height={120} className="rounded-2xl" />
          <Skeleton variant="text" width={180} height={28} />
          <Skeleton variant="text" width={140} height={20} />
        </div>
      </div>
    </div>
  );
}
