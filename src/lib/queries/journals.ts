import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./keys";
import {
  getJournalsByUnit,
  submitJournal,
  deleteJournal,
} from "@/lib/services/journals";
import type { Grade, JournalAnswer } from "@/types";

export function useJournalsByUnit(
  unitId: string | null | undefined,
  gradeId: Grade | null | undefined
) {
  return useQuery({
    queryKey: queryKeys.journals.byUnit(unitId!, gradeId!),
    queryFn: () => getJournalsByUnit(unitId!, gradeId!),
    enabled: !!unitId && !!gradeId,
  });
}

export function useSubmitJournal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      unitId: string;
      gradeId: Grade;
      studentName: string;
      answers: JournalAnswer[];
    }) => submitJournal(data),
    onSuccess: (_, { unitId, gradeId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.journals.byUnit(unitId, gradeId),
      });
    },
  });
}

export function useDeleteJournal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      unitId,
      gradeId,
    }: {
      id: string;
      unitId: string;
      gradeId: Grade;
    }) => deleteJournal(id),
    onSuccess: (_, { unitId, gradeId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.journals.byUnit(unitId, gradeId),
      });
    },
  });
}
