"use client";

import { useState } from "react";
import { GripVertical, ChevronUp, ChevronDown } from "lucide-react";
import type { SidebarConfig } from "@/types";

interface SidebarSectionProps {
  config: SidebarConfig;
  onChange: (config: SidebarConfig) => void;
}

export function SidebarSection({ config, onChange }: SidebarSectionProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

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

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newLinks = [...config.links];
    [newLinks[index - 1], newLinks[index]] = [newLinks[index], newLinks[index - 1]];
    onChange({ ...config, links: newLinks });
  };

  const handleMoveDown = (index: number) => {
    if (index === config.links.length - 1) return;
    const newLinks = [...config.links];
    [newLinks[index], newLinks[index + 1]] = [newLinks[index + 1], newLinks[index]];
    onChange({ ...config, links: newLinks });
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    // Required for Firefox
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    // Reorder the links array
    const newLinks = [...config.links];
    const [draggedItem] = newLinks.splice(draggedIndex, 1);
    newLinks.splice(dropIndex, 0, draggedItem);

    onChange({ ...config, links: newLinks });
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div>
      <p className="text-xs text-gray-400 mb-3">
        גרור או השתמש בחצים כדי לשנות סדר, סמן/בטל להצגה/הסתרה, ערוך את שם הקישור
      </p>

      <div className="space-y-2">
        {config.links.map((link, index) => (
          <div
            key={link.id}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            className={`
              flex items-center gap-2 p-3 bg-white border rounded-lg transition-all duration-200
              ${!link.visible ? "opacity-50 border-surface-2" : "border-surface-2"}
              ${draggedIndex === index ? "opacity-50 scale-[0.98]" : ""}
              ${dragOverIndex === index && draggedIndex !== index ? "border-primary border-2 bg-primary/5" : ""}
            `}
          >
            {/* Drag Handle */}
            <div
              className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 transition-colors"
              title="גרור לשינוי סדר"
              role="button"
              aria-label={`גרור את ${link.label}`}
            >
              <GripVertical size={18} />
            </div>

            {/* Move Up/Down Buttons */}
            <div className="flex flex-col gap-0.5">
              <button
                type="button"
                onClick={() => handleMoveUp(index)}
                disabled={index === 0}
                className={`p-0.5 rounded transition-colors ${
                  index === 0
                    ? "text-gray-200 cursor-not-allowed"
                    : "text-gray-400 hover:text-gray-600 hover:bg-surface-2 cursor-pointer"
                }`}
                title="הזז למעלה"
                aria-label={`הזז את ${link.label} למעלה`}
              >
                <ChevronUp size={14} />
              </button>
              <button
                type="button"
                onClick={() => handleMoveDown(index)}
                disabled={index === config.links.length - 1}
                className={`p-0.5 rounded transition-colors ${
                  index === config.links.length - 1
                    ? "text-gray-200 cursor-not-allowed"
                    : "text-gray-400 hover:text-gray-600 hover:bg-surface-2 cursor-pointer"
                }`}
                title="הזז למטה"
                aria-label={`הזז את ${link.label} למטה`}
              >
                <ChevronDown size={14} />
              </button>
            </div>

            <input
              type="checkbox"
              checked={link.visible}
              onChange={() => handleToggle(link.id)}
              className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
              aria-label={`${link.visible ? "הסתר" : "הצג"} ${link.label}`}
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
              aria-label={`שם הקישור ${link.label}`}
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
