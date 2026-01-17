"use client";

import { createContext, useContext, useCallback, useMemo, type ReactNode } from "react";
import type { VisibilityConfig, ConfigurableRole, DashboardConfig, SidebarConfig, PageElementsConfig } from "@/types";
import { useVisibilityConfig } from "@/lib/queries";
import { DEFAULT_VISIBILITY_CONFIG } from "@/lib/constants/visibility-defaults";

interface VisibilityContextValue {
  config: VisibilityConfig;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  getDashboardConfig: (role: ConfigurableRole) => DashboardConfig;
  getSidebarConfig: (role: ConfigurableRole) => SidebarConfig;
  getPageElements: <K extends keyof PageElementsConfig>(role: ConfigurableRole, page: K) => PageElementsConfig[K];
  canSee: (role: ConfigurableRole, page: keyof PageElementsConfig, element: string) => boolean;
}

const VisibilityContext = createContext<VisibilityContextValue | null>(null);

export function VisibilityProvider({ children }: { children: ReactNode }) {
  const { data: config = DEFAULT_VISIBILITY_CONFIG, isLoading, error, refetch } = useVisibilityConfig();

  const getDashboardConfig = useCallback(
    (role: ConfigurableRole): DashboardConfig => {
      return config.dashboards[role] || DEFAULT_VISIBILITY_CONFIG.dashboards[role];
    },
    [config]
  );

  const getSidebarConfig = useCallback(
    (role: ConfigurableRole): SidebarConfig => {
      return config.sidebars[role] || DEFAULT_VISIBILITY_CONFIG.sidebars[role];
    },
    [config]
  );

  const getPageElements = useCallback(
    <K extends keyof PageElementsConfig>(role: ConfigurableRole, page: K): PageElementsConfig[K] => {
      return config.pageElements[role]?.[page] || DEFAULT_VISIBILITY_CONFIG.pageElements[role][page];
    },
    [config]
  );

  const canSee = useCallback(
    (role: ConfigurableRole, page: keyof PageElementsConfig, element: string): boolean => {
      const pageConfig = config.pageElements[role]?.[page];
      if (!pageConfig) return true; // Default to visible if no config
      return (pageConfig as Record<string, boolean>)[element] ?? true;
    },
    [config]
  );

  const refetchConfig = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const value = useMemo(
    () => ({
      config,
      isLoading,
      error: error instanceof Error ? error : error ? new Error("Failed to load visibility config") : null,
      refetch: refetchConfig,
      getDashboardConfig,
      getSidebarConfig,
      getPageElements,
      canSee,
    }),
    [config, isLoading, error, refetchConfig, getDashboardConfig, getSidebarConfig, getPageElements, canSee]
  );

  return (
    <VisibilityContext.Provider value={value}>
      {children}
    </VisibilityContext.Provider>
  );
}

export function useVisibility(): VisibilityContextValue {
  const context = useContext(VisibilityContext);
  if (!context) {
    throw new Error("useVisibility must be used within a VisibilityProvider");
  }
  return context;
}
