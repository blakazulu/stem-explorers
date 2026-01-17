"use client";

import Link from "next/link";
import { useUnitsByGrade } from "@/lib/queries";
import { Icon, getStemIconForId } from "@/components/ui/Icon";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import {
  BookOpen,
  FileText,
  ChevronLeft,
  Sparkles,
  RefreshCw,
  Plus,
  Atom,
} from "lucide-react";
import type { Grade, UserRole } from "@/types";

interface UnitTreeViewProps {
  grade: Grade;
  role: UserRole;
  onAddUnit?: () => void;
  showDetails?: boolean;
}

export function UnitTreeView({ grade, role, onAddUnit, showDetails = true }: UnitTreeViewProps) {
  const { data: units = [], isLoading, isError, refetch } = useUnitsByGrade(grade);

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-6">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-surface-2 animate-pulse" />
              {i < 3 && <div className="w-1 h-24 bg-surface-2 animate-pulse" />}
            </div>
            <div className="flex-1 pt-2">
              <SkeletonCard />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <EmptyState
        icon="alert-triangle"
        title="שגיאה בטעינה"
        description="לא הצלחנו לטעון את יחידות הלימוד"
        action={
          <Button onClick={() => refetch()} rightIcon={RefreshCw}>
            נסה שוב
          </Button>
        }
      />
    );
  }

  if (units.length === 0) {
    return (
      <EmptyState
        icon="book-open"
        title="אין יחידות לימוד"
        description={`עדיין לא נוספו יחידות לימוד לכיתה ${grade}`}
        variant="stem"
        action={
          onAddUnit ? (
            <Button onClick={onAddUnit} rightIcon={Plus}>
              הוסף יחידה
            </Button>
          ) : undefined
        }
      />
    );
  }

  return (
    <div className="relative">
      {/* Header decoration */}
      <div className="flex items-center justify-center gap-3 mb-8">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        <div className="flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-full border border-primary/20">
          <Sparkles size={16} className="text-primary animate-pulse" />
          <span className="text-sm font-medium text-primary">מסע הלמידה</span>
          <Sparkles size={16} className="text-primary animate-pulse" />
        </div>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      </div>

      {/* Tree View */}
      <div className="relative">
        {/* Connecting line */}
        <div className="absolute right-8 top-8 bottom-8 w-1 bg-gradient-to-b from-primary via-secondary to-accent rounded-full opacity-20" />

        {/* Units */}
        <div className="space-y-2">
          {units.map((unit, index) => {
            const stemIcon = getStemIconForId(unit.id);
            const isFirst = index === 0;
            const isLast = index === units.length - 1;

            // Alternate colors for visual variety
            const colors = [
              { bg: "bg-primary/10", hover: "hover:bg-primary/20", border: "border-primary/30", text: "text-primary", glow: "shadow-primary/20" },
              { bg: "bg-secondary/10", hover: "hover:bg-secondary/20", border: "border-secondary/30", text: "text-secondary", glow: "shadow-secondary/20" },
              { bg: "bg-accent/10", hover: "hover:bg-accent/20", border: "border-accent/30", text: "text-accent", glow: "shadow-accent/20" },
            ];
            const color = colors[index % colors.length];

            return (
              <div
                key={unit.id}
                className={`relative flex items-start gap-4 md:gap-6 animate-slide-up`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Node */}
                <div className="relative z-10 flex flex-col items-center">
                  {/* Circle node */}
                  <div
                    className={`relative w-14 h-14 md:w-16 md:h-16 rounded-full ${color.bg} border-2 ${color.border} flex items-center justify-center shadow-lg ${color.glow} transition-all duration-300 group-hover:scale-110`}
                  >
                    <Icon name={stemIcon} size="lg" className={color.text} />

                    {/* Pulse animation for first item */}
                    {isFirst && (
                      <div className={`absolute inset-0 rounded-full ${color.bg} animate-ping opacity-30`} />
                    )}
                  </div>

                  {/* Connector line */}
                  {!isLast && (
                    <div className="w-1 h-16 md:h-20 bg-gradient-to-b from-primary/40 to-secondary/40 rounded-full" />
                  )}

                  {/* End decoration */}
                  {isLast && (
                    <div className="mt-4 flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-accent animate-bounce" />
                      <Atom size={20} className="text-accent/50 mt-2 animate-spin-slow" />
                    </div>
                  )}
                </div>

                {/* Content Card */}
                <Link
                  href={`/${role}/teaching-resources/${encodeURIComponent(grade)}/curricula/${unit.id}`}
                  className={`group flex-1 p-4 md:p-5 bg-surface-0 rounded-2xl border-2 border-surface-2 hover:border-primary hover:shadow-xl transition-all duration-300 cursor-pointer mt-1`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Unit number badge */}
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 ${color.bg} rounded-full mb-2`}>
                        <span className={`text-xs font-bold ${color.text}`}>יחידה {index + 1}</span>
                      </div>

                      {/* Unit name */}
                      <h3 className="font-rubik font-bold text-lg md:text-xl text-foreground group-hover:text-primary transition-colors">
                        {unit.name}
                      </h3>

                      {/* Description - controlled by showDetails */}
                      {showDetails && (
                        <p className="text-sm text-gray-500 mt-1">
                          לחץ לצפייה בתכנים ובחומרי הלימוד
                        </p>
                      )}

                      {/* File indicators - controlled by showDetails */}
                      {showDetails && (
                        <div className="flex items-center gap-4 mt-3">
                          {unit.introFileUrl && (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary/10 rounded-lg">
                              <BookOpen size={14} className="text-secondary" />
                              <span className="text-xs font-medium text-secondary">מבוא</span>
                            </div>
                          )}
                          {unit.unitFileUrl && (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 rounded-lg">
                              <FileText size={14} className="text-primary" />
                              <span className="text-xs font-medium text-primary">תוכן</span>
                            </div>
                          )}
                          {!unit.introFileUrl && !unit.unitFileUrl && (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-lg">
                              <span className="text-xs text-gray-400">טרם הועלו קבצים</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Arrow */}
                    <div className="self-center p-2 rounded-full bg-surface-2 group-hover:bg-primary/10 transition-all duration-300">
                      <ChevronLeft
                        size={20}
                        className="text-gray-400 group-hover:text-primary group-hover:-translate-x-1 transition-all duration-300"
                      />
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer decoration */}
      <div className="flex items-center justify-center gap-3 mt-8">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
        <div className="text-xs text-gray-400 px-4">סוף המסע</div>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
      </div>
    </div>
  );
}
