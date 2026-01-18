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
import type { StemLink, Expert, EmailConfig, ReportConfig, Grade } from "@/types";

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

// Resource Files (global - not per grade)
export function useResourceFile(type: ResourceType | null | undefined) {
  return useQuery({
    queryKey: queryKeys.settings.resourceFile(type!),
    queryFn: () => getResourceFile(type!),
    enabled: !!type,
  });
}

export function useSaveResourceFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      type,
      file,
    }: {
      type: ResourceType;
      file: ResourceFile;
    }) => saveResourceFile(type, file),
    onSuccess: (_, { type }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.settings.resourceFile(type),
      });
    },
  });
}

export function useDeleteResourceFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ type }: { type: ResourceType }) => deleteResourceFile(type),
    onSuccess: (_, { type }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.settings.resourceFile(type),
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
