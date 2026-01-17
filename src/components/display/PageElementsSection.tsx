"use client";

import type { PageElementsConfig, SidebarConfig, DashboardConfig } from "@/types";
import { PAGE_ELEMENT_LABELS } from "@/lib/constants/visibility-defaults";

interface PageElementsSectionProps {
  config: PageElementsConfig;
  sidebarConfig: SidebarConfig;
  dashboardConfig: DashboardConfig;
  onChange: (config: PageElementsConfig) => void;
}

type PageKey = keyof PageElementsConfig;

// Map page keys to sidebar/dashboard IDs
const PAGE_TO_ITEM_ID: Record<PageKey, string> = {
  teachingResources: "teaching-resources",
  pedagogical: "pedagogical",
  documentation: "documentation",
};

export function PageElementsSection({ config, sidebarConfig, dashboardConfig, onChange }: PageElementsSectionProps) {
  // Build sidebar labels lookup
  const sidebarLabels = Object.fromEntries(
    sidebarConfig.links.map((link) => [link.id, link.label])
  );

  // Check if a page is enabled (visible in either sidebar OR dashboard)
  const isPageEnabled = (pageKey: PageKey): boolean => {
    const itemId = PAGE_TO_ITEM_ID[pageKey];
    const sidebarVisible = sidebarConfig.links.some(l => l.id === itemId && l.visible);
    const dashboardVisible = dashboardConfig.cards.some(c => c.id === itemId && c.visible);
    return sidebarVisible || dashboardVisible;
  };

  const handleToggle = (page: PageKey, element: string) => {
    const pageConfig = config[page] as Record<string, boolean>;
    const newPageConfig = {
      ...pageConfig,
      [element]: !pageConfig[element],
    };
    onChange({
      ...config,
      [page]: newPageConfig,
    });
  };

  const allPages: PageKey[] = ["teachingResources", "pedagogical", "documentation"];
  // Only show pages that are enabled in sidebar OR dashboard
  const enabledPages = allPages.filter(isPageEnabled);

  if (enabledPages.length === 0) {
    return (
      <div className="text-center text-gray-400 py-4">
        אין דפים פעילים לתפקיד זה
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-4">
        {enabledPages.map((pageKey) => {
          const labels = PAGE_ELEMENT_LABELS[pageKey];
          const pageConfig = config[pageKey] as Record<string, boolean>;
          const elements = Object.keys(pageConfig);
          // Use sidebar label as title, fallback to default
          const itemId = PAGE_TO_ITEM_ID[pageKey];
          const pageTitle = sidebarLabels[itemId] || labels._title;

          return (
            <div key={pageKey} className="p-4 bg-white border border-surface-2 rounded-lg">
              <h4 className="font-medium text-foreground mb-3">
                {pageTitle}
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {elements.map((element) => (
                  <label
                    key={element}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={pageConfig[element]}
                      onChange={() => handleToggle(pageKey, element)}
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                    />
                    <span className={pageConfig[element] ? "text-foreground" : "text-gray-400"}>
                      {labels[element as keyof typeof labels] || element}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
