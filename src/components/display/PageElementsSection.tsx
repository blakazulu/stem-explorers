"use client";

import type { PageElementsConfig } from "@/types";
import { PAGE_ELEMENT_LABELS } from "@/lib/constants/visibility-defaults";

interface PageElementsSectionProps {
  config: PageElementsConfig;
  onChange: (config: PageElementsConfig) => void;
}

type PageKey = keyof PageElementsConfig;

export function PageElementsSection({ config, onChange }: PageElementsSectionProps) {
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

          return (
            <div key={pageKey} className="p-4 bg-white border border-surface-2 rounded-lg">
              <h4 className="font-medium text-foreground mb-3">
                {labels._title}
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
