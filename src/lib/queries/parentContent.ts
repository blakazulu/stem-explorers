import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./keys";
import {
  getParentContent,
  updateParentContentIntro,
  updateParentContentEvents,
  deleteParentContentImage,
} from "@/lib/services/parentContent";
import type { ParentContentPageId, ParentContentEvent } from "@/types";

export function useParentContent(pageId: ParentContentPageId) {
  return useQuery({
    queryKey: queryKeys.parentContent.page(pageId),
    queryFn: () => getParentContent(pageId),
  });
}

export function useUpdateParentContentIntro() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      pageId,
      intro,
    }: {
      pageId: ParentContentPageId;
      intro: string;
    }) => updateParentContentIntro(pageId, intro),
    onSuccess: (_, { pageId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.parentContent.page(pageId),
      });
    },
  });
}

export function useUpdateParentContentEvents() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      pageId,
      events,
    }: {
      pageId: ParentContentPageId;
      events: ParentContentEvent[];
    }) => updateParentContentEvents(pageId, events),
    onSuccess: (_, { pageId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.parentContent.page(pageId),
      });
    },
  });
}

export function useDeleteParentContentImage() {
  return useMutation({
    mutationFn: (imageUrl: string) => deleteParentContentImage(imageUrl),
  });
}
