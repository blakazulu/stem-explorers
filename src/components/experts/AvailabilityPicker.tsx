"use client";

import { useState, useMemo } from "react";
import { ChevronRight, ChevronLeft, Plus, Trash2 } from "lucide-react";
import { TimeRangeInput } from "./TimeRangeInput";
import { formatHebrewDate, getHebrewMonthYear } from "@/lib/utils/slots";
import type { ExpertAvailability, TimeRange } from "@/types";

interface AvailabilityPickerProps {
  availability: ExpertAvailability[];
  onChange: (availability: ExpertAvailability[]) => void;
}

export function AvailabilityPicker({ availability, onChange }: AvailabilityPickerProps) {
  const [viewDate, setViewDate] = useState(() => new Date());

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  // Generate dates for current view month
  const dates = useMemo(() => {
    const result: string[] = [];
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      result.push(date.toISOString().split("T")[0]);
    }

    return result;
  }, [year, month]);

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const dayNames = ["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ש׳"];
  const today = new Date().toISOString().split("T")[0];

  // Check if a date is selected
  const isDateSelected = (date: string) => {
    return availability.some((a) => a.date === date);
  };

  // Toggle date selection
  const toggleDate = (date: string) => {
    if (isDateSelected(date)) {
      onChange(availability.filter((a) => a.date !== date));
    } else {
      onChange([
        ...availability,
        { date, timeRanges: [{ start: "10:00", end: "11:00" }] },
      ]);
    }
  };

  // Update time ranges for a date
  const updateTimeRanges = (date: string, timeRanges: TimeRange[]) => {
    onChange(
      availability.map((a) =>
        a.date === date ? { ...a, timeRanges } : a
      )
    );
  };

  // Add time range to a date
  const addTimeRange = (date: string) => {
    const existing = availability.find((a) => a.date === date);
    if (!existing) return;

    updateTimeRanges(date, [
      ...existing.timeRanges,
      { start: "14:00", end: "15:00" },
    ]);
  };

  // Remove time range from a date
  const removeTimeRange = (date: string, index: number) => {
    const existing = availability.find((a) => a.date === date);
    if (!existing || existing.timeRanges.length <= 1) return;

    updateTimeRanges(
      date,
      existing.timeRanges.filter((_, i) => i !== index)
    );
  };

  // Update a specific time range
  const updateTimeRange = (date: string, index: number, range: TimeRange) => {
    const existing = availability.find((a) => a.date === date);
    if (!existing) return;

    updateTimeRanges(
      date,
      existing.timeRanges.map((r, i) => (i === index ? range : r))
    );
  };

  // Sort selected dates for display
  const sortedSelected = useMemo(() => {
    return [...availability].sort((a, b) => a.date.localeCompare(b.date));
  }, [availability]);

  const prevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-foreground">
        זמינות
      </label>

      {/* Calendar Picker */}
      <div className="bg-surface-1 rounded-xl p-3">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-3">
          <button
            type="button"
            onClick={nextMonth}
            className="p-1.5 hover:bg-surface-2 rounded-lg transition-colors cursor-pointer"
          >
            <ChevronRight size={18} />
          </button>
          <span className="font-medium text-sm">
            {getHebrewMonthYear(year, month)}
          </span>
          <button
            type="button"
            onClick={prevMonth}
            className="p-1.5 hover:bg-surface-2 rounded-lg transition-colors cursor-pointer"
          >
            <ChevronLeft size={18} />
          </button>
        </div>

        {/* Day Names */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {dayNames.map((day) => (
            <div key={day} className="text-center text-[10px] text-gray-400 py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {dates.map((date) => {
            const isSelected = isDateSelected(date);
            const isPast = date < today;

            return (
              <button
                key={date}
                type="button"
                onClick={() => !isPast && toggleDate(date)}
                disabled={isPast}
                className={`
                  aspect-square flex items-center justify-center text-xs rounded-lg transition-all
                  ${isPast
                    ? "text-gray-300 cursor-not-allowed"
                    : isSelected
                      ? "bg-primary text-white font-medium"
                      : "hover:bg-surface-2 cursor-pointer text-foreground"
                  }
                `}
              >
                {new Date(date).getDate()}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Dates List */}
      {sortedSelected.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs text-gray-500">תאריכים נבחרים ({sortedSelected.length}):</p>

          {sortedSelected.map((item) => (
            <div
              key={item.date}
              className="bg-surface-1 rounded-xl p-3 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">
                  {formatHebrewDate(item.date)}
                </span>
                <button
                  type="button"
                  onClick={() => toggleDate(item.date)}
                  className="p-1 text-gray-400 hover:text-error transition-colors cursor-pointer"
                  title="הסר תאריך"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Time Ranges */}
              <div className="space-y-2">
                {item.timeRanges.map((range, index) => (
                  <TimeRangeInput
                    key={index}
                    range={range}
                    onChange={(r) => updateTimeRange(item.date, index, r)}
                    onRemove={
                      item.timeRanges.length > 1
                        ? () => removeTimeRange(item.date, index)
                        : undefined
                    }
                  />
                ))}
              </div>

              {/* Add Time Range Button */}
              <button
                type="button"
                onClick={() => addTimeRange(item.date)}
                className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors cursor-pointer"
              >
                <Plus size={14} />
                <span>הוסף טווח שעות</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {sortedSelected.length === 0 && (
        <p className="text-xs text-gray-400 text-center py-2">
          לחץ על תאריכים בלוח השנה לבחירת ימי זמינות
        </p>
      )}
    </div>
  );
}
