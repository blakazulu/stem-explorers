"use client";

import { DraggableCardList } from "./DraggableCardList";
import type { DashboardConfig } from "@/types";
import { ALL_DASHBOARD_CARDS } from "@/lib/constants/visibility-defaults";

interface DashboardSectionProps {
  config: DashboardConfig;
  onChange: (config: DashboardConfig) => void;
}

export function DashboardSection({ config, onChange }: DashboardSectionProps) {
  const cardLabels = Object.fromEntries(
    Object.entries(ALL_DASHBOARD_CARDS).map(([id, meta]) => [id, meta.label])
  );

  return (
    <div className="space-y-6">
      {/* Dashboard Intro */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          תיאור לוח הבקרה
        </label>
        <textarea
          value={config.intro}
          onChange={(e) => onChange({ ...config, intro: e.target.value })}
          placeholder="טקסט פתיחה שיוצג בראש לוח הבקרה..."
          rows={3}
          className="w-full px-3 py-2 border border-surface-2 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
          dir="rtl"
        />
        <p className="mt-1 text-xs text-gray-400">
          הטקסט יוצג מעל הכרטיסים בלוח הבקרה
        </p>
      </div>

      {/* Dashboard Cards */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          כרטיסי לוח בקרה
        </label>
        <p className="text-xs text-gray-400 mb-3">
          גרור לשינוי סדר, סמן/בטל סימון להצגה/הסתרה
        </p>
        <DraggableCardList
          cards={config.cards}
          cardLabels={cardLabels}
          onChange={(cards) => onChange({ ...config, cards })}
        />
      </div>
    </div>
  );
}
