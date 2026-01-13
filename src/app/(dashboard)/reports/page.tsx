"use client";

import { useState, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import { useAuth } from "@/contexts/AuthContext";
import { GradeSelector } from "@/components/ui/GradeSelector";
import { Card } from "@/components/ui/Card";
import { SkeletonCard, SkeletonGrid } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { getUnitsByGrade } from "@/lib/services/units";
import { getReport } from "@/lib/services/reports";
import {
  BarChart2,
  ChevronRight,
  FileText,
  AlertCircle,
  BookOpen,
} from "lucide-react";
import { Icon, getStemIconForId } from "@/components/ui/Icon";
import type { Grade, Unit, Report } from "@/types";

export default function ReportsPage() {
  const { session } = useAuth();
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(
    session?.user.grade || null
  );
  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);
  const [unitsLoading, setUnitsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isTeacherOrAdmin =
    session?.user.role === "teacher" || session?.user.role === "admin";
  const isParent = session?.user.role === "parent";

  const loadUnits = useCallback(async () => {
    if (!selectedGrade) return;
    try {
      setError(null);
      setUnitsLoading(true);
      const data = await getUnitsByGrade(selectedGrade);
      setUnits(data);
    } catch (err) {
      setError("שגיאה בטעינת יחידות");
      console.error(err);
    } finally {
      setUnitsLoading(false);
    }
  }, [selectedGrade]);

  useEffect(() => {
    loadUnits();
  }, [loadUnits]);

  async function loadReport(unit: Unit) {
    setSelectedUnit(unit);
    setLoading(true);
    setError(null);
    try {
      const data = await getReport(unit.id, selectedGrade!);
      setReport(data);
    } catch (err) {
      setError("שגיאה בטעינת דוח");
      console.error(err);
    }
    setLoading(false);
  }

  const reportContent = report
    ? isParent
      ? report.parentContent
      : report.teacherContent
    : null;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-secondary/10 rounded-xl">
          <BarChart2 size={24} className="text-secondary" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-rubik font-bold text-foreground">
            דוחות
          </h1>
          <p className="text-sm text-gray-500">צפייה בדוחות לפי יחידות לימוד</p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex items-center gap-3 bg-error/10 text-error p-4 rounded-xl animate-slide-up">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Grade Selector for Teachers/Admins */}
      {isTeacherOrAdmin && (
        <Card>
          <GradeSelector selected={selectedGrade} onSelect={setSelectedGrade} />
        </Card>
      )}

      {/* Unit Selection */}
      {selectedGrade && !selectedUnit && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center gap-2">
            <BookOpen size={18} className="text-primary" />
            <h2 className="text-lg font-rubik font-semibold text-foreground">
              בחר יחידה
            </h2>
          </div>

          {unitsLoading ? (
            <SkeletonGrid count={6} columns={3} />
          ) : units.length === 0 ? (
            <EmptyState
              icon="book-open"
              title="אין יחידות"
              description={`לא נמצאו יחידות לכיתה ${selectedGrade}`}
            />
          ) : (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {units.map((unit, index) => {
                const stemIcon = getStemIconForId(unit.id);
                return (
                  <button
                    key={unit.id}
                    onClick={() => loadReport(unit)}
                    className={`group text-right p-4 bg-surface-0 rounded-xl border-2 border-surface-2 hover:border-secondary hover:shadow-lg transition-all duration-200 cursor-pointer animate-slide-up stagger-${Math.min(index + 1, 6)}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-secondary/10 rounded-lg group-hover:bg-secondary/20 group-hover:scale-110 transition-all duration-200">
                        <Icon
                          name={stemIcon}
                          size="md"
                          className="text-secondary"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-rubik font-semibold text-foreground group-hover:text-secondary transition-colors">
                          {unit.name}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          לחץ לצפייה בדוח
                        </p>
                      </div>
                      <ChevronRight
                        size={18}
                        className="text-gray-300 group-hover:text-secondary group-hover:-translate-x-1 transition-all duration-200"
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Report View */}
      {selectedUnit && (
        <Card padding="none" className="overflow-hidden animate-slide-up">
          {/* Report Header */}
          <div className="bg-gradient-to-l from-secondary/10 to-primary/10 px-4 md:px-6 py-4 border-b border-surface-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-secondary/20 rounded-lg">
                  <FileText size={20} className="text-secondary" />
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-rubik font-bold text-foreground">
                    {selectedUnit.name}
                  </h2>
                  <p className="text-sm text-gray-500">
                    דוח {isParent ? "להורים" : "למורים"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedUnit(null);
                  setReport(null);
                }}
                className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary font-medium cursor-pointer transition-colors"
              >
                <ChevronRight size={16} />
                חזור
              </button>
            </div>
          </div>

          {/* Report Content */}
          <div className="p-4 md:p-6">
            {loading ? (
              <div className="space-y-4">
                <SkeletonCard />
                <SkeletonCard />
              </div>
            ) : reportContent ? (
              <div
                className="prose prose-lg max-w-none prose-headings:font-rubik prose-headings:text-foreground prose-p:text-gray-600 prose-strong:text-foreground prose-ul:text-gray-600 prose-ol:text-gray-600"
                dir="rtl"
              >
                <ReactMarkdown>{reportContent}</ReactMarkdown>
              </div>
            ) : (
              <EmptyState
                icon="file-text"
                title="אין דוח זמין"
                description="לא נמצא דוח ליחידה זו"
              />
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
