import type { TimeRange, ExpertBooking } from "@/types";

const SLOT_DURATION_MINUTES = 10;

export interface TimeSlot {
  startTime: string;  // "10:00"
  endTime: string;    // "10:10"
  isBooked: boolean;
  booking?: ExpertBooking;
}

// Parse time string "HH:mm" to minutes since midnight
function parseTime(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

// Format minutes since midnight to "HH:mm"
function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
}

// Generate 10-minute slots from time ranges
export function generateSlots(
  timeRanges: TimeRange[],
  bookings: ExpertBooking[]
): TimeSlot[] {
  const slots: TimeSlot[] = [];

  for (const range of timeRanges) {
    const startMinutes = parseTime(range.start);
    const endMinutes = parseTime(range.end);

    // Generate slots
    for (let time = startMinutes; time + SLOT_DURATION_MINUTES <= endMinutes; time += SLOT_DURATION_MINUTES) {
      const startTime = formatTime(time);
      const endTime = formatTime(time + SLOT_DURATION_MINUTES);

      // Check if this slot is booked
      const booking = bookings.find(
        (b) => b.startTime === startTime && b.endTime === endTime
      );

      slots.push({
        startTime,
        endTime,
        isBooked: !!booking,
        booking,
      });
    }
  }

  // Sort by start time
  return slots.sort((a, b) => parseTime(a.startTime) - parseTime(b.startTime));
}

// Get availability indicator based on slot counts
export type AvailabilityStatus = "available" | "limited" | "full";

export function getAvailabilityStatus(
  totalSlots: number,
  bookedSlots: number
): AvailabilityStatus {
  const availableSlots = totalSlots - bookedSlots;

  if (availableSlots === 0) return "full";
  if (availableSlots <= 2) return "limited";
  return "available";
}

// Check if a date is in the past
export function isDateInPast(dateStr: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const date = new Date(dateStr);
  return date < today;
}

// Get dates for a specific month in YYYY-MM-DD format
export function getMonthDates(year: number, month: number): {
  year: number;
  month: number;
  dates: string[];
  startDate: string;
  endDate: string;
} {
  const dates: string[] = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    dates.push(date.toISOString().split("T")[0]);
  }

  const startDate = dates[0];
  const endDate = dates[dates.length - 1];

  return { year, month, dates, startDate, endDate };
}

// Get current month dates in YYYY-MM-DD format
export function getCurrentMonthDates(): {
  year: number;
  month: number;
  dates: string[];
  startDate: string;
  endDate: string;
} {
  const now = new Date();
  return getMonthDates(now.getFullYear(), now.getMonth());
}

// Format date for Hebrew display
export function formatHebrewDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("he-IL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Get Hebrew month name
export function getHebrewMonthYear(year: number, month: number): string {
  const date = new Date(year, month, 1);
  return date.toLocaleDateString("he-IL", {
    month: "long",
    year: "numeric",
  });
}
