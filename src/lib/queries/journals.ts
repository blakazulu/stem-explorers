import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./keys";
import {
  getJournalsByGrade,
  getJournalsByQuestionnaire,
  getTodaysJournals,
  submitJournal,
  deleteJournal,
} from "@/lib/services/journals";
import type { Grade, JournalAnswer } from "@/types";

export function useJournalsByGrade(gradeId: Grade | null | undefined) {
  return useQuery({
    queryKey: queryKeys.journals.byGrade(gradeId!),
    queryFn: () => getJournalsByGrade(gradeId!),
    enabled: !!gradeId,
  });
}

export function useJournalsByQuestionnaire(
  questionnaireId: string | null | undefined
) {
  return useQuery({
    queryKey: queryKeys.journals.byQuestionnaire(questionnaireId!),
    queryFn: () => getJournalsByQuestionnaire(questionnaireId!),
    enabled: !!questionnaireId,
  });
}

export function useTodaysJournals() {
  return useQuery({
    queryKey: queryKeys.journals.today,
    queryFn: getTodaysJournals,
  });
}

export function useSubmitJournal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      gradeId: Grade;
      studentName: string;
      questionnaireId: string;
      answers: JournalAnswer[];
    }) => submitJournal(data),
    onSuccess: (_, { gradeId, questionnaireId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.journals.byGrade(gradeId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.journals.byQuestionnaire(questionnaireId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.journals.today,
      });
    },
  });
}

export function useDeleteJournal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      gradeId,
      questionnaireId,
    }: {
      id: string;
      gradeId: Grade;
      questionnaireId?: string;
    }) => deleteJournal(id),
    onSuccess: (_, { gradeId, questionnaireId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.journals.byGrade(gradeId),
      });
      if (questionnaireId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.journals.byQuestionnaire(questionnaireId),
        });
      }
      queryClient.invalidateQueries({
        queryKey: queryKeys.journals.today,
      });
    },
  });
}
