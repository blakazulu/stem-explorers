import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./keys";
import {
  getUnitsByGrade,
  getUnit,
  createUnit,
  updateUnit,
  deleteUnit,
} from "@/lib/services/units";
import type { Unit, Grade } from "@/types";

export function useUnitsByGrade(grade: Grade | null | undefined) {
  return useQuery({
    queryKey: queryKeys.units.byGrade(grade!),
    queryFn: () => getUnitsByGrade(grade!),
    enabled: !!grade,
  });
}

export function useUnit(id: string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.units.single(id!),
    queryFn: () => getUnit(id!),
    enabled: !!id,
  });
}

export function useCreateUnit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createUnit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.units.all });
    },
  });
}

export function useUpdateUnit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<Unit, "id" | "createdAt">> }) =>
      updateUnit(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.units.all });
    },
  });
}

export function useDeleteUnit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteUnit,
    onSuccess: () => {
      // Invalidate all related caches when a unit is deleted
      queryClient.invalidateQueries({ queryKey: queryKeys.units.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.questionnaires.all });
      // Also invalidate journals and documentation (unit-specific data)
      queryClient.invalidateQueries({ queryKey: ["journals"] });
      queryClient.invalidateQueries({ queryKey: ["documentation"] });
    },
  });
}
