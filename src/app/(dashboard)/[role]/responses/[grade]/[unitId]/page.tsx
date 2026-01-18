"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useUnit, useJournalsByUnit, useDeleteJournal } from "@/lib/queries";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SkeletonGrid } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToastActions } from "@/components/ui/Toast";
import {
  ClipboardCheck,
  ArrowRight,
  User,
  Calendar,
  ChevronDown,
  ChevronUp,
  Trash2,
  MessageSquare,
} from "lucide-react";
import type { Grade, UserRole } from "@/types";

const VALID_GRADES: Grade[] = ["א", "ב", "ג", "ד", "ה", "ו"];

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("he-IL", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatAnswer(answer: string | number | string[]): string {
  if (Array.isArray(answer)) {
    return answer.join(", ");
  }
  if (typeof answer === "number") {
    return `${"⭐".repeat(answer)} (${answer})`;
  }
  return answer;
}

export default function ResponsesListPage() {
  const { session } = useAuth();
  const params = useParams();
  const router = useRouter();
  const toast = useToastActions();

  const role = params.role as UserRole;
  const grade = decodeURIComponent(params.grade as string) as Grade;
  const unitId = params.unitId as string;

  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const isAdmin = session?.user.role === "admin";
  const isTeacher = session?.user.role === "teacher";
  const backUrl = `/${role}/responses/${encodeURIComponent(grade)}`;
  const isValidGrade = VALID_GRADES.includes(grade);
  const canAccess = isTeacher || isAdmin;

  // React Query hooks
  const { data: unit } = useUnit(canAccess && isValidGrade ? unitId : null);
  const { data: journals = [], isLoading: loading, refetch } = useJournalsByUnit(
    canAccess && isValidGrade ? unitId : null,
    canAccess && isValidGrade ? grade : null
  );
  const deleteJournalMutation = useDeleteJournal();

  // Sort journals by date, newest first
  const sortedJournals = useMemo(() => {
    return [...journals].sort((a, b) =>
      (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
    );
  }, [journals]);

  // Only teachers and admins can access this page
  useEffect(() => {
    if (!canAccess) {
      router.replace(`/${role}`);
    }
  }, [canAccess, role, router]);

  // Validate grade
  useEffect(() => {
    if (!isValidGrade) {
      router.replace(`/${role}/responses`);
    }
  }, [isValidGrade, role, router]);

  // Redirect if unit doesn't belong to grade
  useEffect(() => {
    if (unit && unit.gradeId !== grade) {
      router.replace(backUrl);
    }
  }, [unit, grade, backUrl, router]);

  function toggleExpanded(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  async function handleDelete() {
    if (!deleteId) return;

    deleteJournalMutation.mutate(
      { id: deleteId, unitId, gradeId: grade },
      {
        onSuccess: () => {
          toast.success("תגובות", "התגובה נמחקה בהצלחה");
          setDeleteId(null);
        },
        onError: () => {
          toast.error("שגיאה", "לא הצלחנו למחוק את התגובה");
        },
      }
    );
  }

  if (!VALID_GRADES.includes(grade) || (!isTeacher && !isAdmin)) {
    return null;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <Link
          href={backUrl}
          className="p-2 hover:bg-surface-2 rounded-lg transition-colors cursor-pointer"
          title="חזרה לבחירת יחידה"
        >
          <ArrowRight size={20} className="text-gray-500" />
        </Link>
        <div className="p-3 bg-primary/10 rounded-xl">
          <ClipboardCheck size={24} className="text-primary" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-rubik font-bold text-foreground">
            תגובות תלמידים
          </h1>
          <p className="text-sm text-gray-500">
            {unit?.name || "טוען..."} • כיתה {grade}
          </p>
        </div>
      </div>

      {/* Responses List */}
      {loading ? (
        <SkeletonGrid count={4} columns={2} />
      ) : sortedJournals.length === 0 ? (
        <EmptyState
          icon="help-circle"
          title="אין תגובות"
          description="עדיין לא הוגשו תגובות ליחידה זו"
        />
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            {sortedJournals.length} תגובות
          </p>

          {sortedJournals.map((journal, index) => {
            const isExpanded = expandedIds.has(journal.id);
            return (
              <Card
                key={journal.id}
                className={`overflow-hidden animate-slide-up stagger-${Math.min(index + 1, 6)}`}
              >
                {/* Header - Always visible */}
                <button
                  onClick={() => toggleExpanded(journal.id)}
                  className="w-full flex items-center justify-between p-4 text-right cursor-pointer hover:bg-surface-1 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <User size={18} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="font-rubik font-semibold text-foreground">
                        {journal.studentName}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {journal.createdAt ? formatDate(journal.createdAt) : "לא ידוע"}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare size={12} />
                          {journal.answers.length} תשובות
                        </span>
                      </div>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp size={20} className="text-gray-400" />
                  ) : (
                    <ChevronDown size={20} className="text-gray-400" />
                  )}
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-surface-2 animate-slide-up">
                    <div className="p-4 space-y-4">
                      {journal.answers.map((answer, i) => (
                        <div
                          key={answer.questionId}
                          className="p-3 bg-surface-1 rounded-lg"
                        >
                          <p className="text-sm font-medium text-gray-500 mb-1">
                            ש: {answer.questionText || `שאלה ${i + 1}`}
                          </p>
                          <p className="text-foreground">
                            ת: {formatAnswer(answer.answer)}
                          </p>
                        </div>
                      ))}

                      {/* Delete button - Admin only */}
                      {isAdmin && (
                        <div className="pt-2 border-t border-surface-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteId(journal.id)}
                            rightIcon={Trash2}
                            className="text-error hover:bg-error/10"
                          >
                            מחק תגובה
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteId !== null}
        title="מחיקת תגובה"
        message="האם אתה בטוח שברצונך למחוק תגובה זו? פעולה זו אינה ניתנת לביטול."
        confirmLabel="מחק"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
