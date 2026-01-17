"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { VisibilityConfig, ConfigurableRole, DashboardConfig, SidebarConfig, PageElementsConfig } from "@/types";
import { getVisibilityConfig, mergeWithDefaults } from "@/lib/services/visibility";
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
  const [config, setConfig] = useState<VisibilityConfig>(DEFAULT_VISIBILITY_CONFIG);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchConfig = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const saved = await getVisibilityConfig();
      const merged = mergeWithDefaults(saved);
      setConfig(merged);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load visibility config"));
      // On error, use defaults
      setConfig(DEFAULT_VISIBILITY_CONFIG);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

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

  return (
    <VisibilityContext.Provider
      value={{
        config,
        isLoading,
        error,
        refetch: fetchConfig,
        getDashboardConfig,
        getSidebarConfig,
        getPageElements,
        canSee,
      }}
    >
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
