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
    // Use ?? true to handle new fields that aren't in stored config yet
    const currentValue = pageConfig[element] ?? true;
    const newPageConfig = {
      ...pageConfig,
      [element]: !currentValue,
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
          // Use sidebar label as title, fallback to default
          const itemId = PAGE_TO_ITEM_ID[pageKey];
          const pageTitle = sidebarLabels[itemId] || labels._title;

          // Get all elements from labels (excluding _title), not from stored config
          // This ensures new fields are always shown even if not in stored config
          const allElements = Object.keys(labels).filter(k => k !== "_title");

          return (
            <div key={pageKey} className="p-4 bg-white border border-surface-2 rounded-lg">
              <h4 className="font-medium text-foreground mb-3">
                {pageTitle}
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {allElements.map((element) => {
                  // Default to true if element not in stored config
                  const isChecked = pageConfig[element] ?? true;
                  return (
                    <label
                      key={element}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggle(pageKey, element)}
                        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                      />
                      <span className={isChecked ? "text-foreground" : "text-gray-400"}>
                        {labels[element as keyof typeof labels] || element}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
