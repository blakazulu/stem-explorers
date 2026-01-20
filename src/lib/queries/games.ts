import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./keys";
import {
  getGameContent,
  getAllGameContent,
  createGameContent,
  updateGameContent,
  deleteGameContent,
  getGameProgress,
  updateGameProgress,
  getPlayerBadges,
  awardBadge,
  updateStreak,
  getWaitingChallenges,
  createChallenge,
  joinChallenge,
  updateChallengeScore,
  completeChallenge,
} from "@/lib/services/games";
import type { Grade } from "@/types";
import type {
  GameType,
  Difficulty,
  GameContent,
  GameStats,
} from "@/types/games";

// ============================================================
// Game Content Hooks
// ============================================================

/** Get game content for a specific game type and grade */
export function useGameContent(
  gameType: GameType | null,
  grade: Grade | null,
  difficulty?: Difficulty
) {
  return useQuery({
    queryKey: queryKeys.games.content.byTypeAndGrade(gameType!, grade!),
    queryFn: () => getGameContent(gameType!, grade!, difficulty),
    enabled: !!gameType && !!grade,
  });
}

/** Get all game content with optional filters (admin panel) */
export function useAllGameContent(gameType?: GameType, grade?: Grade) {
  return useQuery({
    queryKey: queryKeys.games.content.all,
    queryFn: () => getAllGameContent(gameType, grade),
  });
}

/** Create new game content */
export function useCreateGameContent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<GameContent, "id" | "createdAt" | "updatedAt">) =>
      createGameContent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.games.content.all });
    },
  });
}

/** Update existing game content */
export function useUpdateGameContent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Omit<GameContent, "id" | "createdAt" | "updatedAt">>;
    }) => updateGameContent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.games.content.all });
    },
  });
}

/** Delete game content */
export function useDeleteGameContent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteGameContent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.games.content.all });
    },
  });
}

// ============================================================
// Game Progress Hooks
// ============================================================

/** Get player progress, optionally filtered by game type */
export function useGameProgress(
  visitorId: string | null,
  visitorGrade: Grade | null,
  gameType?: GameType
) {
  return useQuery({
    queryKey: queryKeys.games.progress.byVisitor(visitorId!, visitorGrade!),
    queryFn: () => getGameProgress(visitorId!, visitorGrade!, gameType),
    enabled: !!visitorId && !!visitorGrade,
  });
}

/** Update or create player progress for a game */
export function useUpdateGameProgress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      visitorId,
      visitorName,
      visitorGrade,
      gameType,
      score,
      stats,
    }: {
      visitorId: string;
      visitorName: string;
      visitorGrade: Grade;
      gameType: GameType;
      score: number;
      stats?: Partial<GameStats>;
    }) =>
      updateGameProgress(
        visitorId,
        visitorName,
        visitorGrade,
        gameType,
        score,
        stats
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.games.progress.byVisitor(
          variables.visitorId,
          variables.visitorGrade
        ),
      });
    },
  });
}

// ============================================================
// Badges Hooks
// ============================================================

/** Get player's badges */
export function usePlayerBadges(
  visitorId: string | null,
  visitorGrade: Grade | null
) {
  return useQuery({
    queryKey: queryKeys.games.badges.byVisitor(visitorId!, visitorGrade!),
    queryFn: () => getPlayerBadges(visitorId!, visitorGrade!),
    enabled: !!visitorId && !!visitorGrade,
  });
}

/** Award a badge to a player */
export function useAwardBadge() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      visitorId,
      visitorName,
      visitorGrade,
      badgeId,
    }: {
      visitorId: string;
      visitorName: string;
      visitorGrade: Grade;
      badgeId: string;
    }) => awardBadge(visitorId, visitorName, visitorGrade, badgeId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.games.badges.byVisitor(
          variables.visitorId,
          variables.visitorGrade
        ),
      });
    },
  });
}

/** Update play streak */
export function useUpdateStreak() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      visitorId,
      visitorName,
      visitorGrade,
    }: {
      visitorId: string;
      visitorName: string;
      visitorGrade: Grade;
    }) => updateStreak(visitorId, visitorName, visitorGrade),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.games.badges.byVisitor(
          variables.visitorId,
          variables.visitorGrade
        ),
      });
    },
  });
}

// ============================================================
// Head-to-Head Challenge Hooks
// ============================================================

/** Get available challenges to join */
export function useWaitingChallenges(
  visitorGrade: Grade | null,
  gameType: GameType | null
) {
  return useQuery({
    queryKey: queryKeys.games.headToHead.waiting(visitorGrade!, gameType!),
    queryFn: () => getWaitingChallenges(visitorGrade!, gameType!),
    enabled: !!visitorGrade && !!gameType,
    refetchInterval: 3000,
  });
}

/** Create a new challenge waiting for opponent */
export function useCreateHeadToHeadChallenge() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      visitorGrade,
      gameType,
      player1Id,
      player1Name,
      contentIds,
    }: {
      visitorGrade: Grade;
      gameType: GameType;
      player1Id: string;
      player1Name: string;
      contentIds: string[];
    }) =>
      createChallenge(visitorGrade, gameType, player1Id, player1Name, contentIds),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.games.headToHead.waiting(
          variables.visitorGrade,
          variables.gameType
        ),
      });
    },
  });
}

/** Join an existing challenge */
export function useJoinChallenge() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      challengeId,
      player2Id,
      player2Name,
    }: {
      challengeId: string;
      player2Id: string;
      player2Name: string;
    }) => joinChallenge(challengeId, player2Id, player2Name),
    onSuccess: () => {
      // Invalidate all head-to-head queries since challenge status changed
      queryClient.invalidateQueries({ queryKey: ["games", "headToHead"] });
    },
  });
}

/** Update a player's score in a challenge */
export function useUpdateChallengeScore() {
  // No invalidation needed - real-time handles updates
  return useMutation({
    mutationFn: ({
      challengeId,
      playerId,
      score,
    }: {
      challengeId: string;
      playerId: string;
      score: number;
    }) => updateChallengeScore(challengeId, playerId, score),
  });
}

/** Mark a challenge as complete */
export function useCompleteHeadToHeadChallenge() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: completeChallenge,
    onSuccess: () => {
      // Invalidate all head-to-head queries
      queryClient.invalidateQueries({ queryKey: ["games", "headToHead"] });
    },
  });
}
