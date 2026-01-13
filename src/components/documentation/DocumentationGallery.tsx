"use client";

import { useState, useEffect, useCallback } from "react";
import { getDocumentationByUnit, deleteDocumentation } from "@/lib/services/documentation";
import { DocumentationCard } from "./DocumentationCard";
import { SkeletonGrid } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, AlertCircle, RefreshCw, X } from "lucide-react";
import type { Documentation, Grade } from "@/types";

interface DocumentationGalleryProps {
  unitId: string;
  gradeId: Grade;
  onAddNew?: () => void;
}

export function DocumentationGallery({
  unitId,
  gradeId,
  onAddNew,
}: DocumentationGalleryProps) {
  const { session } = useAuth();
  const [docs, setDocs] = useState<Documentation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = session?.user.role === "admin";
  const isTeacher = session?.user.role === "teacher";
  const isStudent = session?.user.role === "student";

  const loadDocs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDocumentationByUnit(unitId, gradeId);
      setDocs(data);
    } catch {
      setError("שגיאה בטעינת התיעודים");
    }
    setLoading(false);
  }, [unitId, gradeId]);

  useEffect(() => {
    loadDocs();
  }, [loadDocs]);

  async function handleDelete(doc: Documentation) {
    if (!confirm("האם למחוק תיעוד זה?")) return;
    try {
      await deleteDocumentation(doc.id, doc.images);
      await loadDocs();
    } catch {
      setError("שגיאה במחיקת התיעוד");
    }
  }

  if (loading) {
    return <SkeletonGrid count={6} columns={3} />;
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 bg-error/10 text-error p-4 rounded-xl animate-slide-up">
        <AlertCircle size={20} />
        <span className="text-sm font-medium flex-1">{error}</span>
        <Button
          size="sm"
          variant="ghost"
          onClick={loadDocs}
          rightIcon={RefreshCw}
          className="text-error hover:bg-error/20"
        >
          נסה שוב
        </Button>
        <button
          onClick={() => setError(null)}
          className="p-1 hover:bg-error/20 rounded-lg transition-colors cursor-pointer"
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add new button for teachers/admins */}
      {(isTeacher || isAdmin) && onAddNew && (
        <button
          onClick={onAddNew}
          className="group w-full p-6 border-2 border-dashed border-surface-3 rounded-xl bg-surface-1/50 hover:bg-primary/5 hover:border-primary transition-all duration-300 cursor-pointer"
        >
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-surface-2 group-hover:bg-primary/10 flex items-center justify-center transition-all duration-300 group-hover:scale-110">
              <Plus
                size={24}
                className="text-gray-400 group-hover:text-primary transition-colors"
              />
            </div>
            <span className="text-gray-500 group-hover:text-primary font-medium transition-colors">
              הוסף תיעוד חדש
            </span>
          </div>
        </button>
      )}

      {docs.length === 0 ? (
        <EmptyState
          icon="image"
          title="אין תיעודים עדיין"
          description={
            isTeacher || isAdmin
              ? "התחילו לתעד את הפעילויות בכיתה"
              : "עדיין לא נוספו תיעודים ליחידה זו"
          }
          variant={isStudent ? "stem" : "default"}
        />
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {docs.map((doc, index) => (
            <DocumentationCard
              key={doc.id}
              doc={doc}
              canDelete={isAdmin || (isTeacher && doc.teacherName === session?.user.name)}
              onDelete={handleDelete}
              index={index}
            />
          ))}
        </div>
      )}
    </div>
  );
}
