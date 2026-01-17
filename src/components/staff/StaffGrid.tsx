"use client";

import { useState, useEffect } from "react";
import { StaffMemberCard } from "./StaffMemberCard";
import { AddEditStaffModal } from "./AddEditStaffModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToastActions } from "@/components/ui/Toast";
import {
  useStaffByGrade,
  useCreateStaffMember,
  useUpdateStaffMember,
  useDeleteStaffMember,
} from "@/lib/queries";
import { getNextStaffOrder } from "@/lib/services/staff";
import { deleteStorageFile } from "@/lib/utils/imageUpload";
import { Plus, Users, Sparkles } from "lucide-react";
import type { StaffMember, Grade } from "@/types";

interface StaffGridProps {
  grade: Grade;
  isAdmin?: boolean;
}

export function StaffGrid({ grade, isAdmin = false }: StaffGridProps) {
  const toast = useToastActions();

  const { data: staff = [], isLoading: loading, error } = useStaffByGrade(grade);
  const createMutation = useCreateStaffMember();
  const updateMutation = useUpdateStaffMember();
  const deleteMutation = useDeleteStaffMember();

  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState<StaffMember | null>(null);
  const [deletingMember, setDeletingMember] = useState<StaffMember | null>(null);

  // Show error toast if query fails
  useEffect(() => {
    if (error) {
      toast.error("שגיאה", "לא הצלחנו לטעון את הצוות");
    }
  }, [error, toast]);

  const handleAdd = () => {
    setEditingMember(null);
    setShowModal(true);
  };

  const handleEdit = (member: StaffMember) => {
    setEditingMember(member);
    setShowModal(true);
  };

  const handleSave = async (data: { name: string; description: string; imageUrl: string }) => {
    try {
      if (editingMember) {
        // Update existing
        await updateMutation.mutateAsync({ id: editingMember.id, data });
        toast.success("עודכן", "פרטי איש הצוות עודכנו");
      } else {
        // Create new
        const order = await getNextStaffOrder(grade);
        await createMutation.mutateAsync({
          ...data,
          gradeId: grade,
          order,
        });
        toast.success("נוסף", "איש הצוות נוסף בהצלחה");
      }
    } catch {
      toast.error("שגיאה", editingMember ? "לא הצלחנו לעדכן" : "לא הצלחנו להוסיף");
    }
  };

  const handleDelete = async () => {
    if (!deletingMember) return;

    try {
      // Try to delete image from storage
      try {
        const urlObj = new URL(deletingMember.imageUrl);
        const pathMatch = urlObj.pathname.match(/o\/(.+?)\?/);
        if (pathMatch) {
          const storagePath = decodeURIComponent(pathMatch[1]);
          await deleteStorageFile(storagePath);
        }
      } catch {
        // Ignore storage deletion errors
      }

      await deleteMutation.mutateAsync(deletingMember.id);
      toast.success("נמחק", "איש הצוות הוסר");
    } catch {
      toast.error("שגיאה", "לא הצלחנו למחוק");
    }
    setDeletingMember(null);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex flex-col items-center p-4 rounded-2xl bg-surface-1 animate-pulse"
          >
            <div className="w-24 h-24 rounded-full bg-surface-2 mb-4" />
            <div className="h-5 w-20 bg-surface-2 rounded mb-2" />
            <div className="h-4 w-32 bg-surface-2 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (staff.length === 0 && !isAdmin) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-surface-2 rounded-full flex items-center justify-center">
          <Users size={32} className="text-gray-400" />
        </div>
        <p className="text-gray-500">טרם נוספו חברי צוות</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with decoration */}
      <div className="flex items-center justify-center gap-3">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        <div className="flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-full border border-primary/20">
          <Sparkles size={16} className="text-primary" />
          <span className="text-sm font-medium text-primary">צוות מו״פ</span>
          <Sparkles size={16} className="text-primary" />
        </div>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {staff.map((member, index) => (
          <div
            key={member.id}
            className="animate-scale-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <StaffMemberCard
              member={member}
              isAdmin={isAdmin}
              onEdit={handleEdit}
              onDelete={setDeletingMember}
            />
          </div>
        ))}

        {/* Add button for admin */}
        {isAdmin && (
          <button
            onClick={handleAdd}
            className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-dashed border-surface-3 hover:border-primary hover:bg-primary/5 transition-all duration-300 cursor-pointer group min-h-[200px]"
          >
            <div className="w-16 h-16 rounded-full bg-surface-2 group-hover:bg-primary/20 flex items-center justify-center mb-3 transition-colors">
              <Plus size={24} className="text-gray-400 group-hover:text-primary transition-colors" />
            </div>
            <span className="text-sm font-medium text-gray-500 group-hover:text-primary transition-colors">
              הוסף איש צוות
            </span>
          </button>
        )}
      </div>

      {/* Empty state for admin */}
      {staff.length === 0 && isAdmin && (
        <div className="text-center py-8">
          <p className="text-gray-400 text-sm">לחץ על הכפתור למעלה להוספת חבר צוות ראשון</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      <AddEditStaffModal
        isOpen={showModal}
        grade={grade}
        member={editingMember}
        onSave={handleSave}
        onClose={() => {
          setShowModal(false);
          setEditingMember(null);
        }}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingMember}
        title="מחיקת איש צוות"
        message={`האם למחוק את ${deletingMember?.name}?`}
        confirmLabel="מחק"
        onConfirm={handleDelete}
        onCancel={() => setDeletingMember(null)}
      />
    </div>
  );
}
