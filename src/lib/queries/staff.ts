import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./keys";
import {
  getAllStaff,
  getStaffMember,
  createStaffMember,
  updateStaffMember,
  deleteStaffMember,
} from "@/lib/services/staff";
import type { StaffMember } from "@/types";

export function useAllStaff() {
  return useQuery({
    queryKey: queryKeys.staff.all,
    queryFn: getAllStaff,
  });
}

export function useStaffMember(id: string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.staff.single(id!),
    queryFn: () => getStaffMember(id!),
    enabled: !!id,
  });
}

export function useCreateStaffMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createStaffMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.staff.all });
    },
  });
}

export function useUpdateStaffMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Omit<StaffMember, "id" | "createdAt">>;
    }) => updateStaffMember(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.staff.all });
    },
  });
}

export function useDeleteStaffMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteStaffMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.staff.all });
    },
  });
}
