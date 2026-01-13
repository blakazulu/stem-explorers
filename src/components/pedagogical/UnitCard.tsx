import { getStemIconForId, Icon, IconName } from "@/components/ui/Icon";
import { ChevronLeft, BookOpen, FileText } from "lucide-react";
import type { Unit } from "@/types";

interface UnitCardProps {
  unit: Unit;
  onSelect: (unit: Unit) => void;
  index?: number;
}

export function UnitCard({ unit, onSelect, index = 0 }: UnitCardProps) {
  // Get a deterministic STEM icon based on unit ID
  const stemIcon = getStemIconForId(unit.id);

  return (
    <button
      onClick={() => onSelect(unit)}
      className={`group w-full text-right p-4 md:p-5 bg-surface-0 rounded-xl border-2 border-surface-2 hover:border-primary hover:shadow-lg transition-all duration-200 cursor-pointer animate-slide-up stagger-${Math.min(index + 1, 6)}`}
    >
      <div className="flex items-start gap-4">
        {/* STEM Icon */}
        <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-200">
          <Icon name={stemIcon} size="lg" className="text-primary" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-rubik font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
            {unit.name}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            לחץ לצפייה במבוא ובתוכן היחידה
          </p>

          {/* File indicators */}
          <div className="flex items-center gap-3 mt-3">
            {unit.introFileUrl && (
              <span className="inline-flex items-center gap-1 text-xs text-secondary">
                <BookOpen size={12} />
                מבוא
              </span>
            )}
            {unit.unitFileUrl && (
              <span className="inline-flex items-center gap-1 text-xs text-primary">
                <FileText size={12} />
                תוכן
              </span>
            )}
          </div>
        </div>

        {/* Arrow indicator */}
        <div className="self-center opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-200">
          <ChevronLeft size={20} className="text-primary" />
        </div>
      </div>
    </button>
  );
}
