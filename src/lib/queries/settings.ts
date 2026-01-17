import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./keys";
import {
  getPedagogicalIntro,
  savePedagogicalIntro,
  getResourceFile,
  saveResourceFile,
  deleteResourceFile,
  getStemLinks,
  saveStemLinks,
  getExperts,
  saveExperts,
  getEmailConfig,
  saveEmailConfig,
  getReportConfig,
  saveReportConfig,
  type ResourceType,
  type ResourceFile,
} from "@/lib/services/settings";
import type { Grade, StemLink, Expert, EmailConfig, ReportConfig } from "@/types";

// Pedagogical Intro
export function usePedagogicalIntro(grade: Grade | null | undefined) {
  return useQuery({
    queryKey: queryKeys.settings.pedagogicalIntro(grade!),
    queryFn: () => getPedagogicalIntro(grade!),
    enabled: !!grade,
  });
}

export function useSavePedagogicalIntro() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ grade, text }: { grade: Grade; text: string }) =>
      savePedagogicalIntro(grade, text),
    onSuccess: (_, { grade }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.settings.pedagogicalIntro(grade),
      });
    },
  });
}

// Resource Files
export function useResourceFile(
  grade: Grade | null | undefined,
  type: ResourceType | null | undefined
) {
  return useQuery({
    queryKey: queryKeys.settings.resourceFile(grade!, type!),
    queryFn: () => getResourceFile(grade!, type!),
    enabled: !!grade && !!type,
  });
}

export function useSaveResourceFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      grade,
      type,
      file,
    }: {
      grade: Grade;
      type: ResourceType;
      file: ResourceFile;
    }) => saveResourceFile(grade, type, file),
    onSuccess: (_, { grade, type }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.settings.resourceFile(grade, type),
      });
    },
  });
}

export function useDeleteResourceFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ grade, type }: { grade: Grade; type: ResourceType }) =>
      deleteResourceFile(grade, type),
    onSuccess: (_, { grade, type }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.settings.resourceFile(grade, type),
      });
    },
  });
}

// STEM Links
export function useStemLinks() {
  return useQuery({
    queryKey: queryKeys.settings.stemLinks,
    queryFn: getStemLinks,
  });
}

export function useSaveStemLinks() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveStemLinks,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.stemLinks });
    },
  });
}

// Experts
export function useExperts() {
  return useQuery({
    queryKey: queryKeys.settings.experts,
    queryFn: getExperts,
  });
}

export function useSaveExperts() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveExperts,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.experts });
    },
  });
}

// Email Config
export function useEmailConfig() {
  return useQuery({
    queryKey: queryKeys.settings.emailConfig,
    queryFn: getEmailConfig,
  });
}

export function useSaveEmailConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveEmailConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.emailConfig });
    },
  });
}

// Report Config
export function useReportConfig() {
  return useQuery({
    queryKey: queryKeys.settings.reportConfig,
    queryFn: getReportConfig,
  });
}

export function useSaveReportConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveReportConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.reportConfig });
    },
  });
}
