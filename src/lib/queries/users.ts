import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./keys";
import { getAllUsers, updateUserPassword } from "@/lib/services/users";
import type { UserRole, Grade } from "@/types";

export function useAllUsers() {
  return useQuery({
    queryKey: queryKeys.users.all,
    queryFn: getAllUsers,
  });
}

export function useUpdateUserPassword() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      oldPassword,
      newPassword,
      role,
      grade,
    }: {
      oldPassword: string;
      newPassword: string;
      role: UserRole;
      grade: Grade | null;
    }) => updateUserPassword(oldPassword, newPassword, role, grade),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
}
