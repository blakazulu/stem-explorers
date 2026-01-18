"use client";

import { useMemo } from "react";
import { generateSlots, getAvailabilityStatus, type AvailabilityStatus } from "@/lib/utils/slots";
import type { Expert, ExpertBooking } from "@/types";

interface CalendarDayCellProps {
  date: string;
  experts: Expert[];
  isPast: boolean;
  isToday: boolean;
  onClick: () => void;
  getBookingsForExpert: (expertId: string) => ExpertBooking[];
}

const statusColors: Record<AvailabilityStatus, string> = {
  available: "bg-emerald-500",
  limited: "bg-amber-500",
  full: "bg-red-500",
};

export function CalendarDayCell({
  date,
  experts,
  isPast,
  isToday,
  onClick,
  getBookingsForExpert,
}: CalendarDayCellProps) {
  const dayNumber = new Date(date).getDate();

  // Calculate availability status for each expert
  const expertStatuses = useMemo(() => {
    return experts.map((expert) => {
      const availability = expert.availability?.find((a) => a.date === date);
      if (!availability) return { expert, status: "full" as AvailabilityStatus };

      const expertBookings = getBookingsForExpert(expert.id);
      const slots = generateSlots(availability.timeRanges, expertBookings);
      const bookedCount = slots.filter((s) => s.isBooked).length;

      return {
        expert,
        status: getAvailabilityStatus(slots.length, bookedCount),
      };
    });
  }, [experts, date, getBookingsForExpert]);

  const hasExperts = experts.length > 0;
  const isClickable = hasExperts && !isPast;

  return (
    <div
      onClick={isClickable ? onClick : undefined}
      className={`
        min-h-[80px] p-1.5 rounded-lg border transition-all
        ${isToday ? "border-primary bg-primary/5" : "border-transparent"}
        ${isPast ? "opacity-50" : ""}
        ${isClickable ? "cursor-pointer hover:bg-surface-1 hover:border-surface-3" : ""}
        ${!hasExperts ? "bg-surface-0" : "bg-surface-0"}
      `}
    >
      {/* Day Number */}
      <div
        className={`text-xs font-medium mb-1 ${
          isToday ? "text-primary" : "text-gray-600"
        }`}
      >
        {dayNumber}
      </div>

      {/* Expert Names with Status Indicators */}
      <div className="space-y-0.5">
        {expertStatuses.slice(0, 3).map(({ expert, status }) => (
          <div
            key={expert.id}
            className="flex items-center gap-1 text-[10px] text-gray-600 truncate"
          >
            <span
              className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${statusColors[status]}`}
            />
            <span className="truncate">{expert.name}</span>
          </div>
        ))}
        {experts.length > 3 && (
          <div className="text-[10px] text-gray-400">
            +{experts.length - 3} נוספים
          </div>
        )}
      </div>
    </div>
  );
}
