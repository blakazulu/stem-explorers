"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { getUnitsByGrade, deleteUnit } from "@/lib/services/units";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { SkeletonList } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToastActions } from "@/components/ui/Toast";
import {
  FileText,
  Plus,
  BookOpen,
  File,
  Download,
  Edit2,
  Trash2,
  ArrowRight,
} from "lucide-react";
import type { Unit, Grade, UserRole } from "@/types";

const VALID_GRADES: Grade[] = ["א", "ב", "ג", "ד", "ה", "ו"];

export default function WorkPlansGradePage() {
  const { session } = useAuth();
  const params = useParams();
  const router = useRouter();

  const role = params.role as UserRole;
  const grade = decodeURIComponent(params.grade as string) as Grade;

  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const toast = useToastActions();

  const isAdmin = session?.user.role === "admin";
  const canManage = isAdmin; // Only admins can create/edit/delete units
  const newUnitUrl = `/${role}/work-plans/${encodeURIComponent(grade)}/new`;
  // Only show back button for admins (others are restricted to their grade)
  const showBackButton = isAdmin;

  // Validate grade
  useEffect(() => {
    if (!VALID_GRADES.includes(grade)) {
      router.replace(`/${role}/work-plans`);
    }
  }, [grade, role, router]);

  const loadUnits = useCallback(async () => {
    if (!VALID_GRADES.includes(grade)) return;
    setLoading(true);
    try {
      const data = await getUnitsByGrade(grade);
      setUnits(data);
    } catch {
      toast.error("שגיאה", "שגיאה בטעינת יחידות הלימוד");
    }
    setLoading(false);
  }, [grade, toast]);

  useEffect(() => {
    loadUnits();
  }, [loadUnits]);

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await deleteUnit(deleteId);
      setDeleteId(null);
      await loadUnits();
    } catch {
      toast.error("שגיאה", "שגיאה במחיקת היחידה");
      setDeleteId(null);
    }
  }

  if (!VALID_GRADES.includes(grade)) {
    return null;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showBackButton && (
            <Link
              href={`/${role}/work-plans`}
              className="p-2 hover:bg-surface-2 rounded-lg transition-colors cursor-pointer"
              title="חזרה לבחירת כיתה"
            >
              <ArrowRight size={20} className="text-gray-500" />
            </Link>
          )}
          <div className="p-3 bg-role-teacher/10 rounded-xl">
            <FileText size={24} className="text-role-teacher" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-rubik font-bold text-foreground">
              תוכניות עבודה - כיתה {grade}
            </h1>
            <p className="text-sm text-gray-500">
              {canManage ? "ניהול יחידות לימוד" : "צפייה והורדת יחידות לימוד"}
            </p>
          </div>
        </div>
        {canManage && (
          <Link href={newUnitUrl}>
            <Button rightIcon={Plus}>יחידה חדשה</Button>
          </Link>
        )}
      </div>

      {/* Units List */}
      {loading ? (
        <SkeletonList count={4} />
      ) : units.length === 0 ? (
        <EmptyState
          icon="book-open"
          title={`אין יחידות לכיתה ${grade}`}
          description={canManage ? "צור יחידה חדשה להתחלת העבודה" : "עדיין לא הועלו יחידות לימוד לכיתה זו"}
          action={
            canManage ? (
              <Link href={newUnitUrl}>
                <Button rightIcon={Plus}>יחידה חדשה</Button>
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-3">
          {units.map((unit, index) => (
            <Card
              key={unit.id}
              interactive={canManage}
              className={`animate-slide-up stagger-${Math.min(index + 1, 6)}`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  {/* Unit Icon */}
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <BookOpen size={24} className="text-primary" />
                  </div>

                  {/* Unit Info */}
                  <div>
                    <h3 className="font-rubik font-semibold text-foreground">
                      {unit.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      כיתה {unit.gradeId}{canManage && ` • סדר: ${unit.order}`}
                    </p>

                    {/* Download Links */}
                    <div className="flex gap-4 mt-3">
                      {unit.introFileUrl && (
                        <a
                          href={unit.introFileUrl}
                          download
                          className="inline-flex items-center gap-1.5 text-sm text-secondary hover:text-secondary/80 transition-colors"
                        >
                          <BookOpen size={14} />
                          קובץ מבוא
                          <Download size={12} />
                        </a>
                      )}
                      {unit.unitFileUrl && (
                        <a
                          href={unit.unitFileUrl}
                          download
                          className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors"
                        >
                          <File size={14} />
                          קובץ יחידה
                          <Download size={12} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions - Admin only */}
                {canManage && (
                  <div className="flex gap-2 shrink-0">
                    <Link
                      href={`/${role}/work-plans/${encodeURIComponent(grade)}/${unit.id}/edit`}
                      className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all duration-200 cursor-pointer"
                      title="ערוך"
                    >
                      <Edit2 size={18} />
                    </Link>
                    <button
                      onClick={() => setDeleteId(unit.id)}
                      className="p-2 text-gray-400 hover:text-error hover:bg-error/10 rounded-lg transition-all duration-200 cursor-pointer"
                      title="מחק"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteId !== null}
        title="מחיקת יחידה"
        message="האם אתה בטוח שברצונך למחוק יחידה זו? כל התוכן המשויך ימחק גם כן."
        confirmLabel="מחק"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
