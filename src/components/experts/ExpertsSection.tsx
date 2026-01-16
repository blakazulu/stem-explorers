"use client";

import { useState, useEffect, useCallback } from "react";
import { getExperts, saveExperts } from "@/lib/services/settings";
import { ExpertCard } from "./ExpertCard";
import { ExpertDetailsModal } from "./ExpertDetailsModal";
import { AddEditExpertModal } from "./AddEditExpertModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToastActions } from "@/components/ui/Toast";
import { GraduationCap, Plus } from "lucide-react";
import type { Expert, Grade } from "@/types";

interface ExpertsSectionProps {
  grade: Grade;
  isAdmin: boolean;
}

export function ExpertsSection({ grade, isAdmin }: ExpertsSectionProps) {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [allExperts, setAllExperts] = useState<Expert[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingExpert, setEditingExpert] = useState<Expert | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Expert | null>(null);
  const toast = useToastActions();

  const loadExperts = useCallback(async () => {
    try {
      const data = await getExperts();
      setAllExperts(data);
      // Filter to show global experts + grade-specific experts
      const filtered = data.filter(
        (e) => e.grade === null || e.grade === grade
      );
      setExperts(filtered);
    } catch {
      toast.error("שגיאה", "שגיאה בטעינת המומחים");
    }
    setLoading(false);
  }, [grade, toast]);

  useEffect(() => {
    loadExperts();
  }, [loadExperts]);

  const handleViewDetails = (expert: Expert) => {
    setSelectedExpert(expert);
    setDetailsOpen(true);
  };

  const handleEdit = (expert: Expert) => {
    setEditingExpert(expert);
    setEditModalOpen(true);
  };

  const handleAdd = () => {
    setEditingExpert(null);
    setEditModalOpen(true);
  };

  const handleSave = async (data: Omit<Expert, "id" | "order" | "createdAt">) => {
    try {
      let updated: Expert[];

      if (editingExpert) {
        // Update existing
        updated = allExperts.map((e) =>
          e.id === editingExpert.id
            ? { ...e, ...data }
            : e
        );
      } else {
        // Add new
        const newExpert: Expert = {
          ...data,
          id: crypto.randomUUID(),
          order: allExperts.length,
          createdAt: new Date(),
        };
        updated = [...allExperts, newExpert];
      }

      await saveExperts(updated);
      await loadExperts();
      toast.success("נשמר", editingExpert ? "המומחה עודכן" : "המומחה נוסף");
    } catch {
      toast.error("שגיאה", "שגיאה בשמירת המומחה");
      throw new Error("Save failed");
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm || deleting) return;

    setDeleting(true);
    try {
      const updated = allExperts.filter((e) => e.id !== deleteConfirm.id);
      await saveExperts(updated);
      await loadExperts();
      toast.success("נמחק", "המומחה נמחק בהצלחה");
    } catch {
      toast.error("שגיאה", "שגיאה במחיקת המומחה");
    }
    setDeleting(false);
    setDeleteConfirm(null);
  };

  // Don't show section if loading or no experts and not admin
  if (loading) {
    return (
      <div className="mt-10">
        {/* Skeleton section separator */}
        <div className="flex items-center gap-4 mb-6">
          <div className="h-px flex-1 bg-surface-2" />
          <div className="h-6 w-32 bg-surface-2 rounded animate-pulse" />
          <div className="h-px flex-1 bg-surface-2" />
        </div>
        {/* Skeleton cards */}
        <div className="flex gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-36 h-32 bg-surface-1 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (experts.length === 0 && !isAdmin) {
    return null;
  }

  return (
    <div className="mt-10">
      {/* Section Separator */}
      <div className="flex items-center gap-4 mb-6">
        <div className="h-px flex-1 bg-gradient-to-l from-primary/30 to-transparent" />
        <div className="flex items-center gap-2 text-primary">
          <GraduationCap size={20} />
          <h2 className="font-rubik font-bold text-lg whitespace-nowrap">
            שאל את המומחה
          </h2>
        </div>
        <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
      </div>

      {/* Experts Grid */}
      <div className="flex flex-wrap gap-4">
        {experts.map((expert) => (
          <ExpertCard
            key={expert.id}
            expert={expert}
            isAdmin={isAdmin}
            onClick={() => handleViewDetails(expert)}
            onEdit={handleEdit}
            onDelete={setDeleteConfirm}
          />
        ))}

        {/* Add Button (Admin only) */}
        {isAdmin && (
          <button
            onClick={handleAdd}
            className="flex flex-col items-center justify-center text-center p-4 rounded-2xl border-2 border-dashed border-surface-3 hover:border-primary hover:bg-primary/5 transition-all duration-300 cursor-pointer min-w-[140px] min-h-[140px] group"
          >
            <div className="w-12 h-12 rounded-full bg-surface-2 group-hover:bg-primary/10 flex items-center justify-center mb-2 transition-colors">
              <Plus size={24} className="text-gray-400 group-hover:text-primary transition-colors" />
            </div>
            <span className="text-sm text-gray-500 group-hover:text-primary transition-colors">
              הוסף מומחה
            </span>
          </button>
        )}
      </div>

      {/* Empty State for Admin */}
      {experts.length === 0 && isAdmin && (
        <p className="text-center text-gray-400 text-sm mt-2">
          עדיין אין מומחים. לחץ על &quot;הוסף מומחה&quot; להוספת הראשון.
        </p>
      )}

      {/* Details Modal */}
      <ExpertDetailsModal
        expert={selectedExpert}
        isOpen={detailsOpen}
        onClose={() => setDetailsOpen(false)}
      />

      {/* Add/Edit Modal */}
      <AddEditExpertModal
        isOpen={editModalOpen}
        currentGrade={grade}
        expert={editingExpert}
        onSave={handleSave}
        onClose={() => {
          setEditModalOpen(false);
          setEditingExpert(null);
        }}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        title="מחיקת מומחה"
        message={`האם למחוק את המומחה "${deleteConfirm?.name}"?`}
        confirmLabel="מחק"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
}
