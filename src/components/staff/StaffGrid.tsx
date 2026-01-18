"use client";

import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { StaffMemberCard } from "./StaffMemberCard";
import { AddEditStaffModal } from "./AddEditStaffModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToastActions } from "@/components/ui/Toast";
import {
  useAllStaff,
  useCreateStaffMember,
  useUpdateStaffMember,
  useDeleteStaffMember,
  useReorderStaff,
} from "@/lib/queries";
import { getNextStaffOrder } from "@/lib/services/staff";
import { deleteStorageFile } from "@/lib/utils/imageUpload";
import { Plus, Users } from "lucide-react";
import type { StaffMember } from "@/types";

interface StaffGridProps {
  isAdmin?: boolean;
}

interface SortableStaffItemProps {
  member: StaffMember;
  onEdit: (member: StaffMember) => void;
  onDelete: (member: StaffMember) => void;
}

function SortableStaffItem({ member, onEdit, onDelete }: SortableStaffItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: member.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
    >
      <StaffMemberCard
        member={member}
        isAdmin={true}
        isDragging={isDragging}
        dragHandleProps={{ attributes, listeners }}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );
}

export function StaffGrid({ isAdmin = false }: StaffGridProps) {
  const toast = useToastActions();

  const { data: staff = [], isLoading: loading, error } = useAllStaff();
  const createMutation = useCreateStaffMember();
  const updateMutation = useUpdateStaffMember();
  const deleteMutation = useDeleteStaffMember();
  const reorderMutation = useReorderStaff();

  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState<StaffMember | null>(null);
  const [deletingMember, setDeletingMember] = useState<StaffMember | null>(null);

  // Sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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
        const order = await getNextStaffOrder();
        await createMutation.mutateAsync({
          ...data,
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

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = staff.findIndex((m) => m.id === active.id);
      const newIndex = staff.findIndex((m) => m.id === over.id);

      const newOrder = arrayMove(staff, oldIndex, newIndex);
      const orderedIds = newOrder.map((m) => m.id);

      try {
        await reorderMutation.mutateAsync(orderedIds);
        toast.success("סדר עודכן", "סדר הצוות נשמר");
      } catch {
        toast.error("שגיאה", "לא הצלחנו לשמור את הסדר");
      }
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="aspect-[4/5] rounded-2xl bg-surface-2 animate-pulse relative overflow-hidden"
          >
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <div className="h-5 w-24 bg-surface-3 rounded mb-2" />
              <div className="h-1 w-8 bg-surface-3 rounded mx-auto" />
            </div>
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

  // Sort staff by order
  const sortedStaff = [...staff].sort((a, b) => a.order - b.order);

  const gridContent = (
    <>
      {isAdmin ? (
        // Admin view with sortable items
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sortedStaff.map((m) => m.id)}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {sortedStaff.map((member) => (
                <SortableStaffItem
                  key={member.id}
                  member={member}
                  onEdit={handleEdit}
                  onDelete={setDeletingMember}
                />
              ))}

              {/* Add button */}
              <button
                onClick={handleAdd}
                className="aspect-[4/5] flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-surface-3 hover:border-primary hover:bg-primary/5 transition-all duration-300 cursor-pointer group"
              >
                <div className="w-16 h-16 rounded-full bg-surface-2 group-hover:bg-primary/20 flex items-center justify-center mb-3 transition-colors">
                  <Plus size={28} className="text-gray-400 group-hover:text-primary transition-colors" />
                </div>
                <span className="text-sm font-medium text-gray-500 group-hover:text-primary transition-colors">
                  הוסף איש צוות
                </span>
              </button>
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        // Non-admin view without drag and drop
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {sortedStaff.map((member, index) => (
            <div
              key={member.id}
              className="animate-scale-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <StaffMemberCard
                member={member}
                isAdmin={false}
                onEdit={handleEdit}
                onDelete={setDeletingMember}
              />
            </div>
          ))}
        </div>
      )}
    </>
  );

  return (
    <div className="space-y-4">
      {gridContent}

      {/* Empty state for admin */}
      {staff.length === 0 && isAdmin && (
        <div className="text-center py-8">
          <p className="text-gray-400 text-sm">לחץ על הכפתור למעלה להוספת חבר צוות ראשון</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      <AddEditStaffModal
        isOpen={showModal}
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
