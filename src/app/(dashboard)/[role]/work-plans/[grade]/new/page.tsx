"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { getUnitsByGrade, createUnit } from "@/lib/services/units";
import { uploadDocument } from "@/lib/utils/fileUpload";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { useToastActions } from "@/components/ui/Toast";
import {
  Plus,
  Upload,
  BookOpen,
  File,
  X,
  Hash,
  ArrowRight,
} from "lucide-react";
import type { Grade, UserRole } from "@/types";

const VALID_GRADES: Grade[] = ["א", "ב", "ג", "ד", "ה", "ו"];

export default function NewUnitPage() {
  const { session } = useAuth();
  const params = useParams();
  const router = useRouter();
  const toast = useToastActions();

  const role = params.role as UserRole;
  const grade = decodeURIComponent(params.grade as string) as Grade;

  const [unitsCount, setUnitsCount] = useState(0);
  const [saving, setSaving] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [order, setOrder] = useState(1);
  const [introFile, setIntroFile] = useState<File | null>(null);
  const [unitFile, setUnitFile] = useState<File | null>(null);

  const isAdmin = session?.user.role === "admin";
  const backUrl = `/${role}/work-plans/${encodeURIComponent(grade)}`;

  // Validate grade and permissions
  useEffect(() => {
    if (!VALID_GRADES.includes(grade)) {
      router.replace(`/${role}/work-plans`);
      return;
    }
    if (!isAdmin) {
      router.replace(`/${role}/work-plans/${encodeURIComponent(grade)}`);
    }
  }, [grade, role, router, isAdmin]);

  // Load units count to set default order
  const loadUnitsCount = useCallback(async () => {
    if (!VALID_GRADES.includes(grade)) return;
    try {
      const units = await getUnitsByGrade(grade);
      setUnitsCount(units.length);
      setOrder(units.length + 1);
    } catch {
      // Ignore error, default order is 1
    }
  }, [grade]);

  useEffect(() => {
    loadUnitsCount();
  }, [loadUnitsCount]);

  async function handleSubmit() {
    if (!name.trim()) return;
    setSaving(true);

    try {
      let introFileUrl = "";
      let unitFileUrl = "";

      if (introFile) {
        introFileUrl = await uploadDocument(introFile, `units/${grade}/intro`);
      }

      if (unitFile) {
        unitFileUrl = await uploadDocument(unitFile, `units/${grade}/unit`);
      }

      await createUnit({
        gradeId: grade,
        name,
        order,
        introFileUrl,
        unitFileUrl,
      });

      toast.success("נוצר בהצלחה", "היחידה נוצרה בהצלחה");
      router.push(backUrl);
    } catch {
      toast.error("שגיאה", "שגיאה בשמירת היחידה");
    } finally {
      setSaving(false);
    }
  }

  if (!VALID_GRADES.includes(grade) || !isAdmin) {
    return null;
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <Link
          href={backUrl}
          className="p-2 hover:bg-surface-2 rounded-lg transition-colors cursor-pointer"
          title="חזרה לרשימת היחידות"
        >
          <ArrowRight size={20} className="text-gray-500" />
        </Link>
        <div className="p-3 bg-role-teacher/10 rounded-xl">
          <Plus size={24} className="text-role-teacher" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-rubik font-bold text-foreground">
            יחידה חדשה
          </h1>
          <p className="text-sm text-gray-500">כיתה {grade}</p>
        </div>
      </div>

      {/* Unit Form */}
      <Card padding="none" className="overflow-hidden animate-slide-up">
        <div className="p-4 md:p-6 space-y-6">
          {/* Unit Name */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              שם היחידה
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="הקלד שם יחידה"
            />
          </div>

          {/* Display Order */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
              <Hash size={16} className="text-gray-500" />
              סדר תצוגה
            </label>
            <Input
              type="number"
              value={order}
              onChange={(e) => {
                const maxOrder = unitsCount + 1;
                const val = parseInt(e.target.value) || 1;
                setOrder(Math.min(maxOrder, Math.max(1, val)));
              }}
              min={1}
              max={unitsCount + 1}
              className="w-24"
            />
          </div>

          {/* Intro File Upload */}
          <div className="p-4 bg-surface-1 rounded-xl space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <BookOpen size={16} className="text-secondary" />
              קובץ מבוא
            </label>
            <div className="relative">
              <input
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={(e) => setIntroFile(e.target.files?.[0] || null)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex items-center gap-3 p-4 border-2 border-dashed border-surface-3 rounded-xl hover:border-secondary hover:bg-secondary/5 transition-all duration-200">
                <div className="p-2 bg-secondary/10 rounded-lg">
                  <Upload size={20} className="text-secondary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {introFile ? introFile.name : "גרור קובץ או לחץ לבחירה"}
                  </p>
                  <p className="text-xs text-gray-500">PDF או Word</p>
                </div>
              </div>
            </div>
          </div>

          {/* Unit File Upload */}
          <div className="p-4 bg-surface-1 rounded-xl space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <File size={16} className="text-primary" />
              קובץ יחידה
            </label>
            <div className="relative">
              <input
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={(e) => setUnitFile(e.target.files?.[0] || null)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex items-center gap-3 p-4 border-2 border-dashed border-surface-3 rounded-xl hover:border-primary hover:bg-primary/5 transition-all duration-200">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Upload size={20} className="text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {unitFile ? unitFile.name : "גרור קובץ או לחץ לבחירה"}
                  </p>
                  <p className="text-xs text-gray-500">PDF או Word</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-surface-2">
            <Link href={backUrl}>
              <Button variant="ghost" leftIcon={X}>
                ביטול
              </Button>
            </Link>
            <Button
              onClick={handleSubmit}
              disabled={saving || !name.trim()}
              loading={saving}
              loadingText="שומר..."
            >
              צור יחידה
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
