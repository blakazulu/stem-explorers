"use client";

import { DocumentationCard } from "./DocumentationCard";
import { SkeletonGrid } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import { useVisibility } from "@/contexts/VisibilityContext";
import { useToastActions } from "@/components/ui/Toast";
import { useDocumentationByUnit, useDeleteDocumentation } from "@/lib/queries";
import { Plus, RefreshCw } from "lucide-react";
import type { Documentation, Grade, ConfigurableRole } from "@/types";

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
  const { getPageElements } = useVisibility();
  const toast = useToastActions();

  // Use React Query for data fetching
  const {
    data: docs = [],
    isLoading: loading,
    isError: loadError,
    refetch,
  } = useDocumentationByUnit(unitId, gradeId);

  // Use React Query mutation for deletion
  const deleteDocMutation = useDeleteDocumentation();

  const isAdmin = session?.user.role === "admin";
  const isTeacher = session?.user.role === "teacher";
  const isStudent = session?.user.role === "student";

  // Get documentation visibility config for the current role
  const role = session?.user.role;
  const configurableRole = (role === "admin" ? "teacher" : role) as ConfigurableRole;
  const documentationVisibility = role ? getPageElements(configurableRole, "documentation") : { images: true, text: true, teacherName: true };

  async function handleDelete(doc: Documentation) {
    if (!confirm("האם למחוק תיעוד זה?")) return;
    try {
      await deleteDocMutation.mutateAsync({
        id: doc.id,
        imageUrls: doc.images,
        unitId,
        gradeId,
      });
    } catch {
      toast.error("שגיאה", "שגיאה במחיקת התיעוד");
    }
  }

  if (loading) {
    return <SkeletonGrid count={6} columns={3} />;
  }

  if (loadError) {
    return (
      <EmptyState
        icon="alert-triangle"
        title="שגיאה בטעינה"
        description="לא הצלחנו לטעון את התיעודים"
        action={
          <Button onClick={() => refetch()} rightIcon={RefreshCw}>
            נסה שוב
          </Button>
        }
      />
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
              visibility={documentationVisibility}
            />
          ))}
        </div>
      )}
    </div>
  );
}
