"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { getUnit, deleteUnit } from "@/lib/services/units";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { useToastActions } from "@/components/ui/Toast";
import {
  FileText,
  BookOpen,
  Edit2,
  Trash2,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import type { Unit, Grade, UserRole } from "@/types";

const VALID_GRADES: Grade[] = ["א", "ב", "ג", "ד", "ה", "ו"];

export default function UnitDetailPage() {
  const { session } = useAuth();
  const params = useParams();
  const router = useRouter();
  const toast = useToastActions();

  const role = params.role as UserRole;
  const grade = decodeURIComponent(params.grade as string) as Grade;
  const unitId = params.unitId as string;

  const [unit, setUnit] = useState<Unit | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isAdmin = session?.user.role === "admin";
  const canManage = isAdmin;
  const backUrl = `/${role}/work-plans/${encodeURIComponent(grade)}`;

  useEffect(() => {
    if (!VALID_GRADES.includes(grade)) {
      router.replace(`/${role}/work-plans`);
      return;
    }

    async function loadUnit() {
      setLoading(true);
      try {
        const data = await getUnit(unitId);
        if (!data) {
          toast.error("שגיאה", "היחידה לא נמצאה");
          router.replace(backUrl);
          return;
        }
        setUnit(data);
      } catch {
        toast.error("שגיאה", "שגיאה בטעינת היחידה");
        router.replace(backUrl);
      }
      setLoading(false);
    }

    loadUnit();
  }, [grade, unitId, role, router, backUrl, toast]);

  async function handleDelete() {
    if (!unit) return;
    try {
      await deleteUnit(unit.id);
      toast.success("נמחק", "היחידה נמחקה בהצלחה");
      router.replace(backUrl);
    } catch {
      toast.error("שגיאה", "שגיאה במחיקת היחידה");
    }
    setShowDeleteConfirm(false);
  }

  if (!VALID_GRADES.includes(grade)) {
    return null;
  }

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-surface-2 rounded-lg animate-pulse" />
          <div className="space-y-2">
            <div className="h-7 w-48 bg-surface-2 rounded animate-pulse" />
            <div className="h-5 w-32 bg-surface-2 rounded animate-pulse" />
          </div>
        </div>
        <SkeletonCard />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  if (!unit) {
    return null;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={backUrl}
            className="p-2 hover:bg-surface-2 rounded-lg transition-colors cursor-pointer"
            title="חזרה לרשימת היחידות"
          >
            <ArrowRight size={20} className="text-gray-500" />
          </Link>
          <div className="p-3 bg-primary/10 rounded-xl">
            <BookOpen size={24} className="text-primary" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-rubik font-bold text-foreground">
              {unit.name}
            </h1>
            <p className="text-sm text-gray-500">
              כיתה {grade}
              {canManage && ` • סדר: ${unit.order}`}
            </p>
          </div>
        </div>
      </div>

      {/* Unit Files */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {unit.introFileUrl && (
          <a
            href={unit.introFileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <Card interactive className="h-full">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-secondary/10 rounded-xl">
                  <BookOpen size={24} className="text-secondary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-rubik font-semibold text-foreground">
                    מבוא ליחידה
                  </h3>
                  <p className="text-sm text-gray-500">רקע והקדמה לנושא</p>
                </div>
                <ExternalLink size={18} className="text-gray-400" />
              </div>
            </Card>
          </a>
        )}
        {unit.unitFileUrl && (
          <a
            href={unit.unitFileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <Card interactive className="h-full">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <FileText size={24} className="text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-rubik font-semibold text-foreground">
                    תוכן היחידה
                  </h3>
                  <p className="text-sm text-gray-500">חומר הלימוד המלא</p>
                </div>
                <ExternalLink size={18} className="text-gray-400" />
              </div>
            </Card>
          </a>
        )}
      </div>

      {/* No files available */}
      {!unit.introFileUrl && !unit.unitFileUrl && (
        <Card variant="outlined" className="bg-surface-1/50 text-center py-8">
          <div className="p-3 bg-gray-100 rounded-xl w-fit mx-auto mb-3">
            <FileText size={24} className="text-gray-400" />
          </div>
          <p className="text-gray-500">אין קבצים זמינים ליחידה זו</p>
        </Card>
      )}

      {/* Admin Actions */}
      {canManage && (
        <div className="flex gap-3 pt-2">
          <Link
            href={`/${role}/work-plans/${encodeURIComponent(grade)}/${unit.id}/edit`}
            className="flex-1"
          >
            <Button variant="outline" className="w-full" rightIcon={Edit2}>
              עריכת יחידה
            </Button>
          </Link>
          <Button
            variant="destructive"
            onClick={() => setShowDeleteConfirm(true)}
            rightIcon={Trash2}
          >
            מחיקה
          </Button>
        </div>
      )}

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="מחיקת יחידה"
        message="האם אתה בטוח שברצונך למחוק יחידה זו? כל התוכן המשויך ימחק גם כן."
        confirmLabel="מחק"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}
