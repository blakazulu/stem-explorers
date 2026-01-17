import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./keys";
import { getReport, generateReport } from "@/lib/services/reports";
import type { Grade, ResearchJournal } from "@/types";

export function useReport(
  unitId: string | null | undefined,
  gradeId: Grade | null | undefined
) {
  return useQuery({
    queryKey: queryKeys.reports.single(unitId!, gradeId!),
    queryFn: () => getReport(unitId!, gradeId!),
    enabled: !!unitId && !!gradeId,
  });
}

export function useGenerateReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      unitId,
      unitName,
      gradeId,
      journals,
    }: {
      unitId: string;
      unitName: string;
      gradeId: Grade;
      journals: ResearchJournal[];
    }) => generateReport(unitId, unitName, gradeId, journals),
    onSuccess: (_, { unitId, gradeId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.reports.single(unitId, gradeId),
      });
    },
  });
}
