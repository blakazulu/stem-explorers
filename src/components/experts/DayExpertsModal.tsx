"use client";

import { useEffect, useRef, useMemo } from "react";
import { X, Calendar } from "lucide-react";
import { useRoleStyles } from "@/contexts/ThemeContext";
import { generateSlots, getAvailabilityStatus, formatHebrewDate } from "@/lib/utils/slots";
import type { Expert, ExpertBooking } from "@/types";

interface DayExpertsModalProps {
  isOpen: boolean;
  date: string | null;
  experts: Expert[];
  bookings: ExpertBooking[];
  onSelectExpert: (expert: Expert) => void;
  onClose: () => void;
}

export function DayExpertsModal({
  isOpen,
  date,
  experts,
  bookings,
  onSelectExpert,
  onClose,
}: DayExpertsModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const roleStyles = useRoleStyles();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [isOpen]);

  // Calculate status for each expert
  const expertStatuses = useMemo(() => {
    if (!date) return [];

    return experts.map((expert) => {
      const availability = expert.availability?.find((a) => a.date === date);
      if (!availability) return { expert, status: "full" as const, available: 0, total: 0 };

      const expertBookings = bookings.filter((b) => b.expertId === expert.id);
      const slots = generateSlots(availability.timeRanges, expertBookings);
      const bookedCount = slots.filter((s) => s.isBooked).length;
      const availableCount = slots.length - bookedCount;

      return {
        expert,
        status: getAvailabilityStatus(slots.length, bookedCount),
        available: availableCount,
        total: slots.length,
      };
    });
  }, [experts, bookings, date]);

  if (!isOpen || !date) return null;

  const statusLabels = {
    available: "זמין",
    limited: "כמעט מלא",
    full: "מלא",
  };

  const statusColors = {
    available: "bg-emerald-100 text-emerald-700",
    limited: "bg-amber-100 text-amber-700",
    full: "bg-red-100 text-red-700",
  };

  return (
    <dialog
      ref={dialogRef}
      className="fixed inset-0 m-auto z-50 rounded-2xl p-0 backdrop:bg-black/50 backdrop:animate-fade-in max-w-md w-[95vw] shadow-2xl animate-scale-in border-0 overflow-hidden"
      onClose={onClose}
    >
      <div className="flex flex-col" dir="rtl">
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b border-surface-2 ${roleStyles.bgLight}`}>
          <div className="flex items-center gap-2">
            <Calendar size={20} className={roleStyles.text} />
            <h2 className="text-lg font-rubik font-bold text-foreground">
              {formatHebrewDate(date)}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-surface-2 rounded-lg transition-all cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Expert List */}
        <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
          <p className="text-sm text-gray-500 mb-3">בחר מומחה לקביעת פגישה:</p>

          {expertStatuses.map(({ expert, status, available, total }) => (
            <button
              key={expert.id}
              onClick={() => status !== "full" && onSelectExpert(expert)}
              disabled={status === "full"}
              className={`
                w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-right
                ${status === "full"
                  ? "border-surface-2 bg-surface-1 opacity-60 cursor-not-allowed"
                  : `border-surface-2 hover:border-primary/30 hover:bg-primary/5 cursor-pointer`
                }
              `}
            >
              {/* Avatar */}
              <div className="w-12 h-12 rounded-full overflow-hidden bg-surface-2 flex-shrink-0">
                {expert.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={expert.imageUrl}
                    alt={expert.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className={`w-full h-full ${roleStyles.bgLight} flex items-center justify-center`}>
                    <span className={`text-lg font-bold ${roleStyles.text} opacity-60`}>
                      {expert.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-foreground truncate">{expert.name}</h3>
                <p className="text-sm text-gray-500 truncate">{expert.title}</p>
              </div>

              {/* Status Badge */}
              <div className="flex flex-col items-end gap-1">
                <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[status]}`}>
                  {statusLabels[status]}
                </span>
                <span className="text-xs text-gray-400">
                  {available}/{total} פנויים
                </span>
              </div>
            </button>
          ))}

          {expertStatuses.length === 0 && (
            <p className="text-center text-gray-400 py-8">
              אין מומחים זמינים ביום זה
            </p>
          )}
        </div>
      </div>
    </dialog>
  );
}
