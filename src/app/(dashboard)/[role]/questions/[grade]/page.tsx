"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { getQuestionnairesByGrade, deleteQuestionnaire, activateQuestionnaire, deactivateQuestionnaire } from "@/lib/services/questionnaires";
import { getUnitsByGrade } from "@/lib/services/units";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SkeletonGrid } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToastActions } from "@/components/ui/Toast";
import {
  ClipboardList,
  Plus,
  ArrowRight,
  Edit2,
  Trash2,
  CheckCircle,
  Circle,
  HelpCircle,
  BookOpen,
} from "lucide-react";
import type { Questionnaire, Unit, Grade, UserRole } from "@/types";

const VALID_GRADES: Grade[] = ["א", "ב", "ג", "ד", "ה", "ו"];

export default function QuestionnairesListPage() {
  const { session } = useAuth();
  const params = useParams();
  const router = useRouter();

  const role = params.role as UserRole;
  const grade = decodeURIComponent(params.grade as string) as Grade;

  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const toast = useToastActions();

  const isAdmin = session?.user.role === "admin";
  const newUrl = `/${role}/questions/${encodeURIComponent(grade)}/new`;

  useEffect(() => {
    if (!isAdmin) {
      router.replace(`/${role}`);
      return;
    }
    if (!VALID_GRADES.includes(grade)) {
      router.replace(`/${role}/questions`);
    }
  }, [isAdmin, grade, role, router]);

  const loadData = useCallback(async () => {
    if (!VALID_GRADES.includes(grade)) return;
    setLoading(true);
    try {
      const [qData, uData] = await Promise.all([
        getQuestionnairesByGrade(grade),
        getUnitsByGrade(grade),
      ]);
      setQuestionnaires(qData);
      setUnits(uData);
    } catch {
      toast.error("שגיאה", "שגיאה בטעינת הנתונים");
    }
    setLoading(false);
  }, [grade, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await deleteQuestionnaire(deleteId);
      toast.success("שאלונים", "השאלון נמחק בהצלחה");
      setDeleteId(null);
      await loadData();
    } catch {
      toast.error("שגיאה", "לא הצלחנו למחוק את השאלון");
      setDeleteId(null);
    }
  }

  async function handleToggleActive(q: Questionnaire) {
    try {
      if (q.isActive) {
        await deactivateQuestionnaire(q.id);
        toast.success("שאלונים", "השאלון הושבת");
      } else {
        await activateQuestionnaire(q.id, q.gradeId, q.unitId);
        toast.success("שאלונים", "השאלון הופעל");
      }
      await loadData();
    } catch {
      toast.error("שגיאה", "לא הצלחנו לעדכן את סטטוס השאלון");
    }
  }

  function getUnitName(unitId: string): string {
    const unit = units.find((u) => u.id === unitId);
    return unit?.name || "יחידה לא ידועה";
  }

  if (!isAdmin || !VALID_GRADES.includes(grade)) {
    return null;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={`/${role}/questions`}
            className="p-2 hover:bg-surface-2 rounded-lg transition-colors cursor-pointer"
            title="חזרה לבחירת כיתה"
          >
            <ArrowRight size={20} className="text-gray-500" />
          </Link>
          <div className="p-3 bg-role-admin/10 rounded-xl">
            <ClipboardList size={24} className="text-role-admin" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-rubik font-bold text-foreground">
              שאלונים - כיתה {grade}
            </h1>
            <p className="text-sm text-gray-500">
              ניהול שאלוני יומן החוקר
            </p>
          </div>
        </div>
        <Link href={newUrl}>
          <Button rightIcon={Plus}>שאלון חדש</Button>
        </Link>
      </div>

      {/* Questionnaires List */}
      {loading ? (
        <SkeletonGrid count={4} columns={2} />
      ) : questionnaires.length === 0 ? (
        <EmptyState
          icon="help-circle"
          title={`אין שאלונים לכיתה ${grade}`}
          description="צור שאלון חדש להתחלת העבודה"
          action={
            <Link href={newUrl}>
              <Button rightIcon={Plus}>שאלון חדש</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          {questionnaires.map((q, index) => (
            <Card
              key={q.id}
              className={`relative animate-slide-up stagger-${Math.min(index + 1, 6)}`}
            >
              {/* Active Badge */}
              {q.isActive && (
                <div className="absolute top-3 left-3 px-2 py-1 bg-success/10 text-success text-xs font-medium rounded-full flex items-center gap-1">
                  <CheckCircle size={12} />
                  פעיל
                </div>
              )}

              <div className="space-y-3">
                {/* Questionnaire Name */}
                <h3 className="font-rubik font-semibold text-lg text-foreground pl-16">
                  {q.name}
                </h3>

                {/* Unit */}
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <BookOpen size={14} />
                  <span>{getUnitName(q.unitId)}</span>
                </div>

                {/* Question Count */}
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <HelpCircle size={14} />
                  <span>{q.questions.length} שאלות</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-surface-2">
                  <Link href={`/${role}/questions/${encodeURIComponent(grade)}/${q.id}`}>
                    <Button variant="ghost" size="sm" rightIcon={Edit2}>
                      עריכה
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleActive(q)}
                    rightIcon={q.isActive ? Circle : CheckCircle}
                  >
                    {q.isActive ? "השבת" : "הפעל"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteId(q.id)}
                    rightIcon={Trash2}
                    className="text-error hover:bg-error/10"
                  >
                    מחק
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteId !== null}
        title="מחיקת שאלון"
        message="האם אתה בטוח שברצונך למחוק שאלון זה? פעולה זו אינה ניתנת לביטול."
        confirmLabel="מחק"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
