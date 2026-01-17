import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./keys";
import {
  getQuestionnairesByGrade,
  getActiveQuestionnaire,
  getQuestionnaire,
  createQuestionnaire,
  updateQuestionnaire,
  deleteQuestionnaire,
  activateQuestionnaire,
  deactivateQuestionnaire,
} from "@/lib/services/questionnaires";
import type { Questionnaire, Grade } from "@/types";

export function useQuestionnairesByGrade(grade: Grade | null | undefined) {
  return useQuery({
    queryKey: queryKeys.questionnaires.byGrade(grade!),
    queryFn: () => getQuestionnairesByGrade(grade!),
    enabled: !!grade,
  });
}

export function useActiveQuestionnaire(
  gradeId: Grade | null | undefined,
  unitId: string | null | undefined
) {
  return useQuery({
    queryKey: queryKeys.questionnaires.active(gradeId!, unitId!),
    queryFn: () => getActiveQuestionnaire(gradeId!, unitId!),
    enabled: !!gradeId && !!unitId,
  });
}

export function useQuestionnaire(id: string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.questionnaires.single(id!),
    queryFn: () => getQuestionnaire(id!),
    enabled: !!id,
  });
}

export function useCreateQuestionnaire() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createQuestionnaire,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.questionnaires.all });
    },
  });
}

export function useUpdateQuestionnaire() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Omit<Questionnaire, "id" | "createdAt" | "updatedAt">>;
    }) => updateQuestionnaire(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.questionnaires.all });
    },
  });
}

export function useDeleteQuestionnaire() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteQuestionnaire,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.questionnaires.all });
    },
  });
}

export function useActivateQuestionnaire() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      gradeId,
      unitId,
    }: {
      id: string;
      gradeId: Grade;
      unitId: string;
    }) => activateQuestionnaire(id, gradeId, unitId),
    onSuccess: (_, { gradeId, unitId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.questionnaires.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.questionnaires.active(gradeId, unitId),
      });
    },
  });
}

export function useDeactivateQuestionnaire() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deactivateQuestionnaire,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.questionnaires.all });
      // Also invalidate all active questionnaire queries
      queryClient.invalidateQueries({ queryKey: ["questionnaires", "active"] });
    },
  });
}
