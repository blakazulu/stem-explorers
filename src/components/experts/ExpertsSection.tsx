"use client";

import { useState, useMemo } from "react";
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
import { useExperts, useSaveExperts, useReorderExperts, useBookingsByDateRange, useCreateBooking, useDeleteBooking } from "@/lib/queries";
import { ExpertCard } from "./ExpertCard";
import { ExpertDetailsModal } from "./ExpertDetailsModal";
import { AddEditExpertModal } from "./AddEditExpertModal";
import { ExpertsCalendar } from "./ExpertsCalendar";
import { DayExpertsModal } from "./DayExpertsModal";
import { TimeSlotsModal } from "./TimeSlotsModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToastActions } from "@/components/ui/Toast";
import { useAuth } from "@/contexts/AuthContext";
import { getSessionToken } from "@/lib/utils/sessionToken";
import { getCurrentMonthDates } from "@/lib/utils/slots";
import { GraduationCap, Plus } from "lucide-react";
import type { Expert, Grade, ConfigurableRole } from "@/types";

interface ExpertsSectionProps {
  grade: Grade;
  isAdmin: boolean;
  userRole?: ConfigurableRole; // For filtering experts by role
}

interface SortableExpertItemProps {
  expert: Expert;
  onView: (expert: Expert) => void;
  onEdit: (expert: Expert) => void;
  onDelete: (expert: Expert) => void;
}

function SortableExpertItem({ expert, onView, onEdit, onDelete }: SortableExpertItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: expert.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <ExpertCard
        expert={expert}
        isAdmin={true}
        isDragging={isDragging}
        dragHandleProps={{ attributes, listeners }}
        onClick={() => onView(expert)}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );
}

export function ExpertsSection({ grade, isAdmin, userRole }: ExpertsSectionProps) {
  const { data: allExperts = [], isLoading: loading } = useExperts();
  const saveExpertsMutation = useSaveExperts();
  const reorderExpertsMutation = useReorderExperts();
  const [deleting, setDeleting] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingExpert, setEditingExpert] = useState<Expert | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Expert | null>(null);
  const toast = useToastActions();

  // Calendar and booking state
  const { session } = useAuth();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dayExpertsOpen, setDayExpertsOpen] = useState(false);
  const [dayExperts, setDayExperts] = useState<Expert[]>([]);
  const [selectedExpertForSlots, setSelectedExpertForSlots] = useState<Expert | null>(null);
  const [timeSlotsOpen, setTimeSlotsOpen] = useState(false);

  const { startDate, endDate } = useMemo(() => getCurrentMonthDates(), []);
  // Fetch all bookings for the current month for accurate calendar availability
  const { data: monthBookings = [] } = useBookingsByDateRange(startDate, endDate);
  const createBookingMutation = useCreateBooking();
  const deleteBookingMutation = useDeleteBooking();

  // Filter bookings for the selected date (for modals)
  const selectedDateBookings = useMemo(() => {
    if (!selectedDate) return [];
    return monthBookings.filter((b) => b.date === selectedDate);
  }, [monthBookings, selectedDate]);

  // Filter experts by grade and role
  const experts = useMemo(() => {
    return allExperts.filter((e) => {
      // Grade filter: show if global (null) or matches current grade
      const gradeMatch = e.grade === null || e.grade === grade;

      // Role filter: admin sees all, others see if their role is in expert's roles
      // Legacy experts without roles field are visible to all
      const roleMatch = isAdmin || !userRole || !e.roles?.length || e.roles.includes(userRole);

      return gradeMatch && roleMatch;
    });
  }, [allExperts, grade, isAdmin, userRole]);

  // Sort experts by order
  const sortedExperts = useMemo(() => {
    return [...experts].sort((a, b) => a.order - b.order);
  }, [experts]);

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

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      // Find indices in the sorted/filtered list (what's displayed)
      const oldIndex = sortedExperts.findIndex((e) => e.id === active.id);
      const newIndex = sortedExperts.findIndex((e) => e.id === over.id);

      // Reorder only the visible experts
      const reorderedVisible = arrayMove(sortedExperts, oldIndex, newIndex);

      // Create a map of new order values for visible experts
      const orderMap = new Map<string, number>();
      reorderedVisible.forEach((expert, index) => {
        orderMap.set(expert.id, index);
      });

      try {
        // Use dedicated reorder function that reads fresh data and only updates order
        await reorderExpertsMutation.mutateAsync(orderMap);
        toast.success("סדר עודכן", "סדר המומחים נשמר");
      } catch {
        toast.error("שגיאה", "לא הצלחנו לשמור את הסדר");
      }
    }
  };

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

      await saveExpertsMutation.mutateAsync(updated);
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
      await saveExpertsMutation.mutateAsync(updated);
      toast.success("נמחק", "המומחה נמחק בהצלחה");
    } catch {
      toast.error("שגיאה", "שגיאה במחיקת המומחה");
    }
    setDeleting(false);
    setDeleteConfirm(null);
  };

  const handleDayClick = (date: string, expertsForDay: Expert[]) => {
    setSelectedDate(date);
    setDayExperts(expertsForDay);
    setDayExpertsOpen(true);
  };

  const handleSelectExpertForSlots = (expert: Expert) => {
    setSelectedExpertForSlots(expert);
    setDayExpertsOpen(false);
    setTimeSlotsOpen(true);
  };

  const handleBook = async (startTime: string, endTime: string, participants: string, topic: string) => {
    if (!session || !selectedExpertForSlots || !selectedDate) return;

    await createBookingMutation.mutateAsync({
      expertId: selectedExpertForSlots.id,
      date: selectedDate,
      startTime,
      endTime,
      userId: session.documentId,
      userName: session.user.name,
      userRole: session.user.role,
      userGrade: session.user.grade,
      participants,
      topic,
      sessionToken: getSessionToken(),
    });

    toast.success("נקבע", "הפגישה נקבעה בהצלחה");
  };

  const handleCancelBooking = async (bookingId: string) => {
    await deleteBookingMutation.mutateAsync(bookingId);
    toast.success("בוטל", "הפגישה בוטלה");
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
      {isAdmin ? (
        // Admin view with drag and drop
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sortedExperts.map((e) => e.id)}
            strategy={rectSortingStrategy}
          >
            <div className="flex flex-wrap gap-4">
              {sortedExperts.map((expert) => (
                <SortableExpertItem
                  key={expert.id}
                  expert={expert}
                  onView={handleViewDetails}
                  onEdit={handleEdit}
                  onDelete={setDeleteConfirm}
                />
              ))}

              {/* Add Button */}
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
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        // Non-admin view without drag and drop
        <div className="flex flex-wrap gap-4">
          {sortedExperts.map((expert) => (
            <ExpertCard
              key={expert.id}
              expert={expert}
              isAdmin={false}
              onClick={() => handleViewDetails(expert)}
            />
          ))}
        </div>
      )}

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

      {/* Calendar */}
      <ExpertsCalendar
        experts={allExperts}
        bookings={monthBookings}
        grade={grade}
        userRole={userRole}
        isAdmin={isAdmin}
        onDayClick={handleDayClick}
      />

      {/* Day Experts Modal */}
      <DayExpertsModal
        isOpen={dayExpertsOpen}
        date={selectedDate}
        experts={dayExperts}
        bookings={selectedDateBookings}
        onSelectExpert={handleSelectExpertForSlots}
        onClose={() => setDayExpertsOpen(false)}
      />

      {/* Time Slots Modal */}
      <TimeSlotsModal
        isOpen={timeSlotsOpen}
        expert={selectedExpertForSlots}
        date={selectedDate}
        bookings={selectedDateBookings}
        currentUserId={session?.documentId || ""}
        isAdmin={isAdmin}
        onBook={handleBook}
        onCancelBooking={handleCancelBooking}
        onClose={() => setTimeSlotsOpen(false)}
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
