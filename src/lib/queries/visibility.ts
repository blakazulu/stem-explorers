import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./keys";
import {
  getVisibilityConfig,
  saveVisibilityConfig,
  mergeWithDefaults,
} from "@/lib/services/visibility";
import type { VisibilityConfig } from "@/types";

export function useVisibilityConfig() {
  return useQuery({
    queryKey: queryKeys.visibility,
    queryFn: async () => {
      const saved = await getVisibilityConfig();
      return mergeWithDefaults(saved);
    },
  });
}

export function useSaveVisibilityConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveVisibilityConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.visibility });
    },
  });
}
