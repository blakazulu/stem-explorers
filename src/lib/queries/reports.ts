import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "./keys";
import { getReportsByGrade, getReportById } from "@/lib/services/reports";
import type { Grade } from "@/types";

export function useReportsByGrade(gradeId: Grade | null | undefined) {
  return useQuery({
    queryKey: queryKeys.reports.byGrade(gradeId!),
    queryFn: () => getReportsByGrade(gradeId!),
    enabled: !!gradeId,
  });
}

export function useReport(reportId: string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.reports.single(reportId!),
    queryFn: () => getReportById(reportId!),
    enabled: !!reportId,
  });
}
