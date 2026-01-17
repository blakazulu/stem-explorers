import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";

/**
 * Hook to invalidate all cached queries and trigger a refetch.
 * Use this for manual refresh buttons.
 */
export function useRefreshAll() {
  const queryClient = useQueryClient();
  return useCallback(() => {
    queryClient.invalidateQueries();
  }, [queryClient]);
}
