import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./keys";
import {
  getChallenges,
  getChallengesByGrade,
  createChallenge,
  updateChallenge,
  deleteChallenge,
  setActiveChallenge,
  addChallengeComment,
  deleteChallengeComment,
} from "@/lib/services/challenges";
import type { Challenge, ChallengeComment, Grade } from "@/types";

// Get all challenges (admin)
export function useChallenges() {
  return useQuery({
    queryKey: queryKeys.challenges.all,
    queryFn: getChallenges,
  });
}

// Get challenges by grade (parent)
export function useChallengesByGrade(grade: Grade | null) {
  return useQuery({
    queryKey: queryKeys.challenges.byGrade(grade!),
    queryFn: () => getChallengesByGrade(grade!),
    enabled: !!grade,
  });
}

// Create challenge (admin)
export function useCreateChallenge() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Challenge, "id" | "createdAt" | "updatedAt" | "comments">) =>
      createChallenge(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["challenges"] });
    },
  });
}

// Update challenge (admin)
export function useUpdateChallenge() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Omit<Challenge, "id" | "createdAt" | "comments">>;
    }) => updateChallenge(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["challenges"] });
    },
  });
}

// Delete challenge (admin)
export function useDeleteChallenge() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteChallenge,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["challenges"] });
    },
  });
}

// Set active challenge (admin)
export function useSetActiveChallenge() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: setActiveChallenge,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["challenges"] });
    },
  });
}

// Add comment (parent)
export function useAddChallengeComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      challengeId,
      comment,
    }: {
      challengeId: string;
      comment: Omit<ChallengeComment, "id" | "createdAt">;
    }) => addChallengeComment(challengeId, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["challenges"] });
    },
  });
}

// Delete comment (admin)
export function useDeleteChallengeComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      challengeId,
      commentId,
    }: {
      challengeId: string;
      commentId: string;
    }) => deleteChallengeComment(challengeId, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["challenges"] });
    },
  });
}
