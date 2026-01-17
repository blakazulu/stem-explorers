"use client";

import type { PageElementsConfig, SidebarConfig } from "@/types";
import { PAGE_ELEMENT_LABELS } from "@/lib/constants/visibility-defaults";

interface PageElementsSectionProps {
  config: PageElementsConfig;
  sidebarConfig: SidebarConfig;
  onChange: (config: PageElementsConfig) => void;
}

type PageKey = keyof PageElementsConfig;

// Map page keys to sidebar link IDs
const PAGE_TO_SIDEBAR_ID: Record<PageKey, string> = {
  teachingResources: "teaching-resources",
  pedagogical: "pedagogical",
  documentation: "documentation",
};

export function PageElementsSection({ config, sidebarConfig, onChange }: PageElementsSectionProps) {
  // Build sidebar labels lookup
  const sidebarLabels = Object.fromEntries(
    sidebarConfig.links.map((link) => [link.id, link.label])
  );

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

  const pages: PageKey[] = ["teachingResources", "pedagogical", "documentation"];

  return (
    <div>
      <div className="space-y-4">
        {pages.map((pageKey) => {
          const labels = PAGE_ELEMENT_LABELS[pageKey];
          const pageConfig = config[pageKey] as Record<string, boolean>;
          const elements = Object.keys(pageConfig);
          // Use sidebar label as title, fallback to default
          const sidebarId = PAGE_TO_SIDEBAR_ID[pageKey];
          const pageTitle = sidebarLabels[sidebarId] || labels._title;

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
