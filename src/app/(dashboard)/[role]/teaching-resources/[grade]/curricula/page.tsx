"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { getUnitsByGrade } from "@/lib/services/units";
import { Button } from "@/components/ui/Button";
import { SkeletonGrid } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToastActions } from "@/components/ui/Toast";
import { Icon, getStemIconForId } from "@/components/ui/Icon";
import {
  FileText,
  Plus,
  BookOpen,
  ArrowRight,
  ChevronLeft,
} from "lucide-react";
import type { Unit, Grade, UserRole } from "@/types";

const VALID_GRADES: Grade[] = ["א", "ב", "ג", "ד", "ה", "ו"];

export default function CurriculaPage() {
  const { session } = useAuth();
  const params = useParams();
  const router = useRouter();

  const role = params.role as UserRole;
  const grade = decodeURIComponent(params.grade as string) as Grade;

  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToastActions();

  const isAdmin = session?.user.role === "admin";
  const canManage = isAdmin;
  const baseUrl = `/${role}/teaching-resources/${encodeURIComponent(grade)}`;
  const newUnitUrl = `${baseUrl}/curricula/new`;

  useEffect(() => {
    if (!VALID_GRADES.includes(grade)) {
      router.replace(`/${role}/teaching-resources`);
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

  if (!VALID_GRADES.includes(grade)) {
    return null;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={baseUrl}
            className="p-2 hover:bg-surface-2 rounded-lg transition-colors cursor-pointer"
            title="חזרה למשאבי הוראה"
          >
            <ArrowRight size={20} className="text-gray-500" />
          </Link>
          <div className="p-3 bg-role-teacher/10 rounded-xl">
            <FileText size={24} className="text-role-teacher" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-rubik font-bold text-foreground">
              תוכניות לימודים - כיתה {grade}
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

      {/* Units Grid */}
      {loading ? (
        <SkeletonGrid count={6} columns={3} />
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
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {units.map((unit, index) => {
            const stemIcon = getStemIconForId(unit.id);
            return (
              <Link
                key={unit.id}
                href={`${baseUrl}/curricula/${unit.id}`}
                className={`group block w-full text-right p-4 md:p-5 bg-surface-0 rounded-xl border-2 border-surface-2 hover:border-primary hover:shadow-lg transition-all duration-200 cursor-pointer animate-slide-up stagger-${Math.min(index + 1, 6)}`}
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
                      לחץ לצפייה בקבצים
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
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
