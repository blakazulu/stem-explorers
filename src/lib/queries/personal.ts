import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./keys";
import {
  getPersonalPageConfig,
  savePersonalPageConfig,
  getAllPersonalMedia,
  getPersonalMediaByGrade,
  createPersonalMedia,
  updatePersonalMedia,
  deletePersonalMedia,
  reorderPersonalMedia,
} from "@/lib/services/personal";
import type { PersonalPageConfig, PersonalMedia, Grade } from "@/types";

// ============ Config Hooks ============

export function usePersonalPageConfig() {
  return useQuery({
    queryKey: queryKeys.personal.config,
    queryFn: getPersonalPageConfig,
  });
}

export function useSavePersonalPageConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Omit<PersonalPageConfig, "id" | "updatedAt">> & { updatedBy: string }) =>
      savePersonalPageConfig(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.personal.config,
      });
    },
  });
}

// ============ Media Hooks ============

export function useAllPersonalMedia(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.personal.allMedia,
    queryFn: getAllPersonalMedia,
    enabled: options?.enabled ?? true,
  });
}

export function usePersonalMediaByGrade(
  grade: Grade | null | undefined,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: queryKeys.personal.media(grade!),
    queryFn: () => getPersonalMediaByGrade(grade!),
    enabled: !!grade && (options?.enabled ?? true),
  });
}

export function useCreatePersonalMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<PersonalMedia, "id" | "createdAt">) =>
      createPersonalMedia(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.personal.allMedia,
      });
      // Also invalidate all grade-specific queries
      queryClient.invalidateQueries({
        predicate: (query) =>
          Array.isArray(query.queryKey) &&
          query.queryKey[0] === "personal" &&
          query.queryKey[1] === "media",
      });
    },
  });
}

export function useUpdatePersonalMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Omit<PersonalMedia, "id" | "createdAt">>;
    }) => updatePersonalMedia(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.personal.allMedia,
      });
      queryClient.invalidateQueries({
        predicate: (query) =>
          Array.isArray(query.queryKey) &&
          query.queryKey[0] === "personal" &&
          query.queryKey[1] === "media",
      });
    },
  });
}

export function useDeletePersonalMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      url,
      thumbnailUrl,
    }: {
      id: string;
      url: string;
      thumbnailUrl?: string;
    }) => deletePersonalMedia(id, url, thumbnailUrl),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.personal.allMedia,
      });
      queryClient.invalidateQueries({
        predicate: (query) =>
          Array.isArray(query.queryKey) &&
          query.queryKey[0] === "personal" &&
          query.queryKey[1] === "media",
      });
    },
  });
}

export function useReorderPersonalMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (mediaItems: { id: string; order: number }[]) =>
      reorderPersonalMedia(mediaItems),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.personal.allMedia,
      });
      queryClient.invalidateQueries({
        predicate: (query) =>
          Array.isArray(query.queryKey) &&
          query.queryKey[0] === "personal" &&
          query.queryKey[1] === "media",
      });
    },
  });
}
