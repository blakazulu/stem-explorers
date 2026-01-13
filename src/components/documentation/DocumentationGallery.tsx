"use client";

import { useState, useEffect } from "react";
import { getDocumentationByUnit, deleteDocumentation } from "@/lib/services/documentation";
import { DocumentationCard } from "./DocumentationCard";
import { useAuth } from "@/contexts/AuthContext";
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

  const isAdmin = session?.user.role === "admin";
  const isTeacher = session?.user.role === "teacher";

  useEffect(() => {
    loadDocs();
  }, [unitId, gradeId]);

  async function loadDocs() {
    setLoading(true);
    const data = await getDocumentationByUnit(unitId, gradeId);
    setDocs(data);
    setLoading(false);
  }

  async function handleDelete(doc: Documentation) {
    if (!confirm("האם למחוק תיעוד זה?")) return;
    await deleteDocumentation(doc.id, doc.images);
    await loadDocs();
  }

  if (loading) {
    return <div className="text-gray-500">טוען תיעודים...</div>;
  }

  return (
    <div className="space-y-4">
      {(isTeacher || isAdmin) && onAddNew && (
        <button
          onClick={onAddNew}
          className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-primary hover:text-primary transition-colors"
        >
          + הוסף תיעוד חדש
        </button>
      )}

      {docs.length === 0 ? (
        <p className="text-gray-500 text-center py-8">אין תיעודים עדיין</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {docs.map((doc) => (
            <DocumentationCard
              key={doc.id}
              doc={doc}
              canDelete={isAdmin || (isTeacher && doc.teacherName === session?.user.name)}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
