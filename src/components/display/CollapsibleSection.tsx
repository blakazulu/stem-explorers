"use client";

import { useState, useEffect, ReactNode } from "react";
import { ChevronDown } from "lucide-react";

const STORAGE_KEY = "stem-display-sections";

interface CollapsibleSectionProps {
  id: string;
  title: string;
  description?: string;
  children: ReactNode;
  defaultExpanded?: boolean;
}

function getStoredStates(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function setStoredState(id: string, expanded: boolean) {
  if (typeof window === "undefined") return;
  try {
    const states = getStoredStates();
    states[id] = expanded;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(states));
  } catch {
    // localStorage may be unavailable
  }
}

export function CollapsibleSection({
  id,
  title,
  description,
  children,
  defaultExpanded = true,
}: CollapsibleSectionProps) {
  const [isExpanded, setIsExpanded] = useState<boolean | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const storedStates = getStoredStates();
    const storedValue = storedStates[id];
    setIsExpanded(storedValue !== undefined ? storedValue : defaultExpanded);
  }, [id, defaultExpanded]);

  const handleToggle = () => {
    const newValue = !isExpanded;
    setIsExpanded(newValue);
    setStoredState(id, newValue);
  };

  // Don't render until we know the state (prevents flash)
  if (isExpanded === null) {
    return (
      <div className="animate-pulse">
        <div className="h-12 bg-surface-2 rounded-lg" />
      </div>
    );
  }

  return (
    <div>
      {/* Header - clickable to toggle */}
      <button
        onClick={handleToggle}
        className="w-full flex items-center justify-between p-3 -m-3 mb-0 rounded-lg hover:bg-surface-1 transition-colors cursor-pointer"
      >
        <div className="text-right">
          <h3 className="text-sm font-medium text-foreground">{title}</h3>
          {description && (
            <p className="text-xs text-gray-400 mt-0.5">{description}</p>
          )}
        </div>
        <ChevronDown
          size={20}
          className={`text-gray-400 transition-transform duration-200 ${
            isExpanded ? "rotate-0" : "-rotate-90"
          }`}
        />
      </button>

      {/* Content - collapsible */}
      <div
        className={`overflow-hidden transition-all duration-200 ease-in-out ${
          isExpanded ? "max-h-[2000px] opacity-100 mt-4" : "max-h-0 opacity-0 mt-0"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
