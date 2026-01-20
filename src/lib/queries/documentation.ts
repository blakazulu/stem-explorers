import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./keys";
import {
  getDocumentationByUnit,
  createDocumentation,
  deleteDocumentation,
  getDocumentationCountsByGrade,
  getDocumentationCountsByUnit,
} from "@/lib/services/documentation";
import type { Documentation, Grade } from "@/types";

export function useDocumentationByUnit(
  unitId: string | null | undefined,
  gradeId: Grade | null | undefined
) {
  return useQuery({
    queryKey: queryKeys.documentation.byUnit(unitId!, gradeId!),
    queryFn: () => getDocumentationByUnit(unitId!, gradeId!),
    enabled: !!unitId && !!gradeId,
  });
}

export function useCreateDocumentation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Documentation, "id" | "createdAt">) =>
      createDocumentation(data),
    onSuccess: (_, { unitId, gradeId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.documentation.byUnit(unitId, gradeId),
      });
      // Also invalidate counts
      queryClient.invalidateQueries({
        queryKey: queryKeys.documentation.countsByGrade,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.documentation.countsByUnit(gradeId),
      });
    },
  });
}

export function useDeleteDocumentation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      imageUrls,
      unitId,
      gradeId,
    }: {
      id: string;
      imageUrls: string[];
      unitId: string;
      gradeId: Grade;
    }) => deleteDocumentation(id, imageUrls),
    onSuccess: (_, { unitId, gradeId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.documentation.byUnit(unitId, gradeId),
      });
      // Also invalidate counts
      queryClient.invalidateQueries({
        queryKey: queryKeys.documentation.countsByGrade,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.documentation.countsByUnit(gradeId),
      });
    },
  });
}

// Count hooks for gallery
export function useDocumentationCountsByGrade() {
  return useQuery({
    queryKey: queryKeys.documentation.countsByGrade,
    queryFn: getDocumentationCountsByGrade,
  });
}

export function useDocumentationCountsByUnit(gradeId: Grade | null | undefined) {
  return useQuery({
    queryKey: queryKeys.documentation.countsByUnit(gradeId!),
    queryFn: () => getDocumentationCountsByUnit(gradeId!),
    enabled: !!gradeId,
  });
}
