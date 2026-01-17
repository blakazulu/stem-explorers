"use client";

import type { SidebarConfig } from "@/types";

interface SidebarSectionProps {
  config: SidebarConfig;
  onChange: (config: SidebarConfig) => void;
}

export function SidebarSection({ config, onChange }: SidebarSectionProps) {
  const handleToggle = (id: string) => {
    const newLinks = config.links.map((link) =>
      link.id === id ? { ...link, visible: !link.visible } : link
    );
    onChange({ ...config, links: newLinks });
  };

  const handleLabelChange = (id: string, label: string) => {
    const newLinks = config.links.map((link) =>
      link.id === id ? { ...link, label } : link
    );
    onChange({ ...config, links: newLinks });
  };

  return (
    <div>
      <p className="text-xs text-gray-400 mb-3">
        סמן/בטל סימון להצגה/הסתרה, ערוך את שם הקישור
      </p>

      <div className="space-y-2">
        {config.links.map((link) => (
          <div
            key={link.id}
            className={`
              flex items-center gap-3 p-3 bg-white border rounded-lg
              ${!link.visible ? "opacity-50 border-surface-2" : "border-surface-2"}
            `}
          >
            <input
              type="checkbox"
              checked={link.visible}
              onChange={() => handleToggle(link.id)}
              className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
            />

            <input
              type="text"
              value={link.label}
              onChange={(e) => handleLabelChange(link.id, e.target.value)}
              className={`
                flex-1 px-2 py-1 border rounded focus:ring-2 focus:ring-primary/20 focus:border-primary
                ${link.visible ? "border-surface-2" : "border-transparent bg-surface-1"}
              `}
              dir="rtl"
            />

            {!link.visible && (
              <span className="text-xs text-gray-400">(מוסתר)</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
