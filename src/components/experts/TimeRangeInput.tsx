"use client";

import { useMemo } from "react";
import { Trash2, AlertCircle } from "lucide-react";
import type { TimeRange } from "@/types";

interface TimeRangeInputProps {
  range: TimeRange;
  onChange: (range: TimeRange) => void;
  onRemove?: () => void;
}

// Generate time options in 10-minute intervals
function generateTimeOptions(): string[] {
  const options: string[] = [];
  for (let hour = 7; hour <= 20; hour++) {
    for (let minute = 0; minute < 60; minute += 10) {
      options.push(
        `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
      );
    }
  }
  return options;
}

const TIME_OPTIONS = generateTimeOptions();

// Check if a time range is valid (end > start and at least 10 minutes)
function isValidRange(start: string, end: string): boolean {
  return end > start;
}

export function TimeRangeInput({ range, onChange, onRemove }: TimeRangeInputProps) {
  const isValid = isValidRange(range.start, range.end);

  // Filter end time options to only show times after start (at least 10 minutes later)
  const validEndOptions = useMemo(() => {
    return TIME_OPTIONS.filter((time) => time > range.start);
  }, [range.start]);

  // When start changes, auto-adjust end if it becomes invalid
  const handleStartChange = (newStart: string) => {
    let newEnd = range.end;
    // If end is now invalid, set it to 1 hour after start or last option
    if (newEnd <= newStart) {
      const startIndex = TIME_OPTIONS.indexOf(newStart);
      const endIndex = Math.min(startIndex + 6, TIME_OPTIONS.length - 1); // 6 slots = 1 hour
      newEnd = TIME_OPTIONS[endIndex];
    }
    onChange({ start: newStart, end: newEnd });
  };

  return (
    <div className="flex items-center gap-2">
      <select
        value={range.start}
        onChange={(e) => handleStartChange(e.target.value)}
        className="flex-1 px-2 py-1.5 text-sm rounded-lg border border-surface-3 bg-surface-0 focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
      >
        {TIME_OPTIONS.map((time) => (
          <option key={time} value={time}>
            {time}
          </option>
        ))}
      </select>

      <span className="text-gray-400 text-sm">עד</span>

      <select
        value={range.end}
        onChange={(e) => onChange({ ...range, end: e.target.value })}
        className={`flex-1 px-2 py-1.5 text-sm rounded-lg border bg-surface-0 focus:outline-none focus:ring-2 cursor-pointer ${
          isValid
            ? "border-surface-3 focus:ring-primary/50"
            : "border-error focus:ring-error/50"
        }`}
      >
        {validEndOptions.map((time) => (
          <option key={time} value={time}>
            {time}
          </option>
        ))}
      </select>

      {!isValid && (
        <div className="text-error" title="שעת סיום חייבת להיות אחרי שעת התחלה">
          <AlertCircle size={16} />
        </div>
      )}

      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="p-1.5 text-gray-400 hover:text-error hover:bg-error/10 rounded-lg transition-colors cursor-pointer"
          title="הסר טווח"
        >
          <Trash2 size={14} />
        </button>
      )}
    </div>
  );
}
