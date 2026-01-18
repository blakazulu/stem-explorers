import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./keys";
import {
  getGlobeMonitorQuestions,
  getGlobeMonitorQuestion,
  createGlobeMonitorQuestion,
  updateGlobeMonitorQuestion,
  deleteGlobeMonitorQuestion,
  seedDefaultQuestions,
  getGlobeMonitorSubmissionsByMonth,
  getGlobeMonitorSubmission,
} from "@/lib/services/globeMonitor";
import type { GlobeMonitorQuestion } from "@/types";

// ============ QUESTIONS ============

export function useGlobeMonitorQuestions() {
  return useQuery({
    queryKey: queryKeys.globeMonitor.questions,
    queryFn: getGlobeMonitorQuestions,
  });
}

export function useGlobeMonitorQuestion(id: string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.globeMonitor.question(id!),
    queryFn: () => getGlobeMonitorQuestion(id!),
    enabled: !!id,
  });
}

export function useCreateGlobeMonitorQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createGlobeMonitorQuestion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.globeMonitor.questions });
    },
  });
}

export function useUpdateGlobeMonitorQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Omit<GlobeMonitorQuestion, "id" | "createdAt" | "updatedAt">>;
    }) => updateGlobeMonitorQuestion(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.globeMonitor.questions });
    },
  });
}

export function useDeleteGlobeMonitorQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteGlobeMonitorQuestion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.globeMonitor.questions });
    },
  });
}

export function useSeedDefaultQuestions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: seedDefaultQuestions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.globeMonitor.questions });
    },
  });
}

// ============ SUBMISSIONS ============

export function useGlobeMonitorSubmissionsByMonth(year: number, month: number) {
  return useQuery({
    queryKey: queryKeys.globeMonitor.submissionsByMonth(year, month),
    queryFn: () => getGlobeMonitorSubmissionsByMonth(year, month),
  });
}

export function useGlobeMonitorSubmission(id: string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.globeMonitor.submission(id!),
    queryFn: () => getGlobeMonitorSubmission(id!),
    enabled: !!id,
  });
}
