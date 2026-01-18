"use client";

import { useMemo } from "react";
import { CalendarDayCell } from "./CalendarDayCell";
import { getCurrentMonthDates, getHebrewMonthYear } from "@/lib/utils/slots";
import type { Expert, ExpertBooking, Grade, ConfigurableRole } from "@/types";

interface ExpertsCalendarProps {
  experts: Expert[];
  bookings: ExpertBooking[];
  grade: Grade;
  userRole?: ConfigurableRole;
  isAdmin: boolean;
  onDayClick: (date: string, expertsForDay: Expert[]) => void;
}

export function ExpertsCalendar({
  experts,
  bookings,
  grade,
  userRole,
  isAdmin,
  onDayClick,
}: ExpertsCalendarProps) {
  const { year, month, dates } = useMemo(() => getCurrentMonthDates(), []);
  const hebrewMonthYear = getHebrewMonthYear(year, month);

  // Hebrew day names (Sunday first, RTL)
  const dayNames = ["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ש׳"];

  // Get first day of month (0 = Sunday)
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  // Get today's date string
  const today = new Date().toISOString().split("T")[0];

  // Filter experts visible to this user (grade + role filter)
  const visibleExperts = useMemo(() => {
    return experts.filter((e) => {
      const gradeMatch = e.grade === null || e.grade === grade;
      const roleMatch = isAdmin || !userRole || !e.roles?.length || e.roles.includes(userRole);
      return gradeMatch && roleMatch;
    });
  }, [experts, grade, userRole, isAdmin]);

  // Get experts available on a specific date
  const getExpertsForDate = (date: string): Expert[] => {
    return visibleExperts.filter((expert) =>
      expert.availability?.some((a) => a.date === date)
    );
  };

  // Get bookings for a specific date and expert
  const getBookingsForDateAndExpert = (date: string, expertId: string): ExpertBooking[] => {
    return bookings.filter((b) => b.date === date && b.expertId === expertId);
  };

  return (
    <div className="mt-8 bg-surface-0 rounded-2xl border border-surface-2 p-4">
      {/* Month Header */}
      <h3 className="text-center font-rubik font-bold text-lg text-foreground mb-4">
        {hebrewMonthYear}
      </h3>

      {/* Day Names Header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-gray-500 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for days before month starts */}
        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <div key={`empty-${i}`} className="min-h-[80px]" />
        ))}

        {/* Day cells */}
        {dates.map((date) => {
          const dayExperts = getExpertsForDate(date);
          const isPast = date < today;
          const isToday = date === today;

          return (
            <CalendarDayCell
              key={date}
              date={date}
              experts={dayExperts}
              isPast={isPast}
              isToday={isToday}
              onClick={() => {
                if (dayExperts.length > 0) {
                  onDayClick(date, dayExperts);
                }
              }}
              getBookingsForExpert={(expertId) =>
                getBookingsForDateAndExpert(date, expertId)
              }
            />
          );
        })}
      </div>
    </div>
  );
}
