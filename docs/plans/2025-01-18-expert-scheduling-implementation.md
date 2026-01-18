# Expert Scheduling Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a scheduling system allowing users to book 10-minute consultation slots with STEM experts.

**Architecture:** Calendar-based booking below the experts grid. Availability stored on Expert documents, bookings in separate Firestore collection. Role/grade filtering for visibility, global slot sharing across grades.

**Tech Stack:** Next.js 16, TypeScript, Tailwind CSS, Firebase Firestore, TanStack Query

---

## Task 1: Update Types

**Files:**
- Modify: `src/types/index.ts:176-188`

**Step 1: Add new types for availability and bookings**

Add these types after line 175 (before Expert interface):

```typescript
// Expert availability time range
export interface TimeRange {
  start: string;  // "10:00" (HH:mm format)
  end: string;    // "11:00"
}

// Expert availability for a specific date
export interface ExpertAvailability {
  date: string;           // "2025-01-15" (ISO date YYYY-MM-DD)
  timeRanges: TimeRange[];
}

// Expert consultation booking
export interface ExpertBooking {
  id: string;
  expertId: string;
  date: string;              // "2025-01-15"
  startTime: string;         // "10:00"
  endTime: string;           // "10:10"
  userId: string;
  userName: string;
  userRole: UserRole;
  userGrade: Grade | null;
  topic: string;
  createdAt: Date;
  sessionToken: string;      // For 5-min cancel window check
}
```

**Step 2: Update Expert interface**

Replace the `availability: string;` line with:

```typescript
availability: ExpertAvailability[];  // Structured availability (replaces old string field)
```

**Step 3: Verify TypeScript compiles**

Run: `npm run build`
Expected: May show errors in places using old `availability` string - that's expected, we'll fix those next.

---

## Task 2: Update Settings Service for New Availability Format

**Files:**
- Modify: `src/lib/services/settings.ts:153-189`

**Step 1: Update getExperts to handle new availability format**

Replace the `getExperts` function:

```typescript
// Experts for "שאל את המומחה"
export async function getExperts(): Promise<Expert[]> {
  try {
    const docRef = doc(db, SETTINGS_DOC, "experts");
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return [];
    const data = docSnap.data();
    return (data.experts || [])
      .map((expert: Record<string, unknown>) => {
        const createdAt = expert.createdAt as { toDate?: () => Date } | undefined;
        // Handle availability - convert old string format to empty array
        let availability: ExpertAvailability[] = [];
        if (Array.isArray(expert.availability)) {
          availability = expert.availability as ExpertAvailability[];
        }
        // Old string format gets converted to empty array (migration)

        return {
          id: expert.id as string,
          name: expert.name as string,
          title: expert.title as string,
          description: expert.description as string,
          availability,
          imageUrl: expert.imageUrl as string,
          grade: expert.grade as Grade | null,
          roles: (expert.roles as ConfigurableRole[]) || [],
          order: (expert.order as number) || 0,
          createdAt: createdAt?.toDate?.() || new Date(),
        };
      })
      .sort((a: Expert, b: Expert) => a.order - b.order);
  } catch (error) {
    handleFirebaseError(error, "getExperts");
    throw error;
  }
}
```

**Step 2: Add import for ExpertAvailability**

Update the import at the top of the file:

```typescript
import type { EmailConfig, ReportConfig, Grade, StemLink, Expert, ExpertAvailability, ConfigurableRole } from "@/types";
```

---

## Task 3: Create Bookings Service

**Files:**
- Create: `src/lib/services/bookings.ts`

**Step 1: Create the bookings service file**

```typescript
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { handleFirebaseError } from "@/lib/utils/errors";
import type { ExpertBooking } from "@/types";

const BOOKINGS_COLLECTION = "expert-bookings";

// Convert Firestore doc to ExpertBooking
function docToBooking(id: string, data: Record<string, unknown>): ExpertBooking {
  const createdAt = data.createdAt as { toDate?: () => Date } | undefined;
  return {
    id,
    expertId: data.expertId as string,
    date: data.date as string,
    startTime: data.startTime as string,
    endTime: data.endTime as string,
    userId: data.userId as string,
    userName: data.userName as string,
    userRole: data.userRole as ExpertBooking["userRole"],
    userGrade: data.userGrade as ExpertBooking["userGrade"],
    topic: data.topic as string,
    createdAt: createdAt?.toDate?.() || new Date(),
    sessionToken: data.sessionToken as string,
  };
}

// Get all bookings (admin use)
export async function getBookings(): Promise<ExpertBooking[]> {
  try {
    const q = query(
      collection(db, BOOKINGS_COLLECTION),
      orderBy("date", "asc"),
      orderBy("startTime", "asc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => docToBooking(doc.id, doc.data()));
  } catch (error) {
    handleFirebaseError(error, "getBookings");
    throw error;
  }
}

// Get bookings for a specific date
export async function getBookingsByDate(date: string): Promise<ExpertBooking[]> {
  try {
    const q = query(
      collection(db, BOOKINGS_COLLECTION),
      where("date", "==", date),
      orderBy("startTime", "asc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => docToBooking(doc.id, doc.data()));
  } catch (error) {
    handleFirebaseError(error, "getBookingsByDate");
    throw error;
  }
}

// Get bookings for a specific expert
export async function getBookingsByExpert(expertId: string): Promise<ExpertBooking[]> {
  try {
    const q = query(
      collection(db, BOOKINGS_COLLECTION),
      where("expertId", "==", expertId),
      orderBy("date", "asc"),
      orderBy("startTime", "asc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => docToBooking(doc.id, doc.data()));
  } catch (error) {
    handleFirebaseError(error, "getBookingsByExpert");
    throw error;
  }
}

// Get a single booking by ID
export async function getBooking(bookingId: string): Promise<ExpertBooking | null> {
  try {
    const docRef = doc(db, BOOKINGS_COLLECTION, bookingId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    return docToBooking(docSnap.id, docSnap.data());
  } catch (error) {
    handleFirebaseError(error, "getBooking");
    throw error;
  }
}

// Create a new booking
export async function createBooking(
  booking: Omit<ExpertBooking, "id" | "createdAt">
): Promise<ExpertBooking> {
  try {
    const id = crypto.randomUUID();
    const now = new Date();
    const docRef = doc(db, BOOKINGS_COLLECTION, id);

    await setDoc(docRef, {
      ...booking,
      createdAt: Timestamp.fromDate(now),
    });

    return {
      ...booking,
      id,
      createdAt: now,
    };
  } catch (error) {
    handleFirebaseError(error, "createBooking");
    throw error;
  }
}

// Delete a booking
export async function deleteBooking(bookingId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, BOOKINGS_COLLECTION, bookingId));
  } catch (error) {
    handleFirebaseError(error, "deleteBooking");
    throw error;
  }
}

// Delete multiple bookings (for when admin removes availability)
export async function deleteBookings(bookingIds: string[]): Promise<void> {
  try {
    await Promise.all(bookingIds.map((id) => deleteDoc(doc(db, BOOKINGS_COLLECTION, id))));
  } catch (error) {
    handleFirebaseError(error, "deleteBookings");
    throw error;
  }
}
```

---

## Task 4: Add Bookings Query Keys

**Files:**
- Modify: `src/lib/queries/keys.ts`

**Step 1: Add bookings query keys**

Add after the `globeMonitor` object (before the closing brace):

```typescript
  bookings: {
    all: ["bookings"] as const,
    byDate: (date: string) => ["bookings", "date", date] as const,
    byExpert: (expertId: string) => ["bookings", "expert", expertId] as const,
    single: (id: string) => ["bookings", id] as const,
  },
```

---

## Task 5: Create Bookings React Query Hooks

**Files:**
- Create: `src/lib/queries/bookings.ts`

**Step 1: Create the bookings hooks file**

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./keys";
import {
  getBookings,
  getBookingsByDate,
  getBookingsByExpert,
  createBooking,
  deleteBooking,
  deleteBookings,
} from "@/lib/services/bookings";
import type { ExpertBooking } from "@/types";

// Get all bookings (admin)
export function useBookings() {
  return useQuery({
    queryKey: queryKeys.bookings.all,
    queryFn: getBookings,
  });
}

// Get bookings for a specific date
export function useBookingsByDate(date: string | null) {
  return useQuery({
    queryKey: queryKeys.bookings.byDate(date!),
    queryFn: () => getBookingsByDate(date!),
    enabled: !!date,
  });
}

// Get bookings for a specific expert
export function useBookingsByExpert(expertId: string | null) {
  return useQuery({
    queryKey: queryKeys.bookings.byExpert(expertId!),
    queryFn: () => getBookingsByExpert(expertId!),
    enabled: !!expertId,
  });
}

// Create a booking
export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (booking: Omit<ExpertBooking, "id" | "createdAt">) =>
      createBooking(booking),
    onSuccess: (newBooking) => {
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.bookings.byDate(newBooking.date),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.bookings.byExpert(newBooking.expertId),
      });
    },
  });
}

// Delete a booking
export function useDeleteBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteBooking,
    onSuccess: () => {
      // Invalidate all bookings queries (simpler than tracking which specific ones)
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
}

// Delete multiple bookings
export function useDeleteBookings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteBookings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
}
```

---

## Task 6: Export Bookings Hooks from Index

**Files:**
- Modify: `src/lib/queries/index.ts`

**Step 1: Add export for bookings**

Add this line to the exports:

```typescript
export * from "./bookings";
```

---

## Task 7: Create Slot Generation Utility

**Files:**
- Create: `src/lib/utils/slots.ts`

**Step 1: Create utility for generating time slots**

```typescript
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

// Get current month dates in YYYY-MM-DD format
export function getCurrentMonthDates(): { year: number; month: number; dates: string[] } {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed

  const dates: string[] = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    dates.push(date.toISOString().split("T")[0]);
  }

  return { year, month, dates };
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
```

---

## Task 8: Create Session Token Utility

**Files:**
- Create: `src/lib/utils/sessionToken.ts`

**Step 1: Create session token management utility**

```typescript
const SESSION_TOKEN_KEY = "stem-explorers-session-token";

// Get or create session token
export function getSessionToken(): string {
  if (typeof window === "undefined") return "";

  let token = sessionStorage.getItem(SESSION_TOKEN_KEY);

  if (!token) {
    token = crypto.randomUUID();
    sessionStorage.setItem(SESSION_TOKEN_KEY, token);
  }

  return token;
}

// Check if booking can be cancelled (within 5 minutes and same session)
export function canCancelBooking(
  bookingSessionToken: string,
  bookingCreatedAt: Date
): boolean {
  const currentToken = getSessionToken();

  // Must be same session
  if (bookingSessionToken !== currentToken) return false;

  // Must be within 5 minutes
  const fiveMinutesMs = 5 * 60 * 1000;
  const timeSinceCreation = Date.now() - bookingCreatedAt.getTime();

  return timeSinceCreation <= fiveMinutesMs;
}
```

---

## Task 9: Create ExpertsCalendar Component

**Files:**
- Create: `src/components/experts/ExpertsCalendar.tsx`

**Step 1: Create the main calendar component**

```typescript
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
              bookings={bookings}
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
```

---

## Task 10: Create CalendarDayCell Component

**Files:**
- Create: `src/components/experts/CalendarDayCell.tsx`

**Step 1: Create the day cell component**

```typescript
"use client";

import { useMemo } from "react";
import { generateSlots, getAvailabilityStatus, type AvailabilityStatus } from "@/lib/utils/slots";
import type { Expert, ExpertBooking } from "@/types";

interface CalendarDayCellProps {
  date: string;
  experts: Expert[];
  bookings: ExpertBooking[];
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
```

---

## Task 11: Create DayExpertsModal Component

**Files:**
- Create: `src/components/experts/DayExpertsModal.tsx`

**Step 1: Create modal for selecting expert on a day**

```typescript
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
```

---

## Task 12: Create TimeSlotsModal Component

**Files:**
- Create: `src/components/experts/TimeSlotsModal.tsx`

**Step 1: Create modal for selecting time slot**

```typescript
"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { X, Clock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useRoleStyles } from "@/contexts/ThemeContext";
import { generateSlots, formatHebrewDate } from "@/lib/utils/slots";
import { canCancelBooking, getSessionToken } from "@/lib/utils/sessionToken";
import type { Expert, ExpertBooking } from "@/types";

interface TimeSlotsModalProps {
  isOpen: boolean;
  expert: Expert | null;
  date: string | null;
  bookings: ExpertBooking[];
  currentUserId: string;
  isAdmin: boolean;
  onBook: (startTime: string, endTime: string, topic: string) => Promise<void>;
  onCancelBooking: (bookingId: string) => Promise<void>;
  onClose: () => void;
}

export function TimeSlotsModal({
  isOpen,
  expert,
  date,
  bookings,
  currentUserId,
  isAdmin,
  onBook,
  onCancelBooking,
  onClose,
}: TimeSlotsModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const roleStyles = useRoleStyles();
  const [selectedSlot, setSelectedSlot] = useState<{ start: string; end: string } | null>(null);
  const [topic, setTopic] = useState("");
  const [booking, setBooking] = useState(false);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      dialog.showModal();
      setSelectedSlot(null);
      setTopic("");
      setError("");
    } else {
      dialog.close();
    }
  }, [isOpen]);

  // Generate slots for this expert and date
  const slots = useMemo(() => {
    if (!expert || !date) return [];

    const availability = expert.availability?.find((a) => a.date === date);
    if (!availability) return [];

    const expertBookings = bookings.filter((b) => b.expertId === expert.id);
    return generateSlots(availability.timeRanges, expertBookings);
  }, [expert, date, bookings]);

  const handleBook = async () => {
    if (!selectedSlot || !topic.trim()) {
      setError("יש להזין נושא לפגישה");
      return;
    }

    setBooking(true);
    setError("");

    try {
      await onBook(selectedSlot.start, selectedSlot.end, topic.trim());
      setSelectedSlot(null);
      setTopic("");
    } catch {
      setError("שגיאה בקביעת הפגישה. ייתכן שהזמן כבר תפוס.");
    }

    setBooking(false);
  };

  const handleCancel = async (bookingId: string) => {
    setCancelling(bookingId);
    try {
      await onCancelBooking(bookingId);
    } catch {
      setError("שגיאה בביטול הפגישה");
    }
    setCancelling(null);
  };

  if (!isOpen || !expert || !date) return null;

  return (
    <dialog
      ref={dialogRef}
      className="fixed inset-0 m-auto z-50 rounded-2xl p-0 backdrop:bg-black/50 backdrop:animate-fade-in max-w-lg w-[95vw] shadow-2xl animate-scale-in border-0 overflow-hidden"
      onClose={onClose}
    >
      <div className="flex flex-col" dir="rtl">
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b border-surface-2 ${roleStyles.bgLight}`}>
          <div>
            <h2 className="text-lg font-rubik font-bold text-foreground">
              {expert.name}
            </h2>
            <p className="text-sm text-gray-500">{formatHebrewDate(date)}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-surface-2 rounded-lg transition-all cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Slots Grid */}
        <div className="p-4 max-h-[50vh] overflow-y-auto">
          <div className="flex items-center gap-2 mb-3 text-gray-500">
            <Clock size={16} />
            <span className="text-sm">בחר שעה:</span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {slots.map((slot) => {
              const isSelected = selectedSlot?.start === slot.startTime;
              const isOwnBooking = slot.booking?.userId === currentUserId;
              const canCancel = slot.booking && (
                isAdmin ||
                (isOwnBooking && canCancelBooking(slot.booking.sessionToken, slot.booking.createdAt))
              );

              return (
                <div key={slot.startTime} className="relative">
                  <button
                    onClick={() => {
                      if (!slot.isBooked) {
                        setSelectedSlot({ start: slot.startTime, end: slot.endTime });
                        setError("");
                      }
                    }}
                    disabled={slot.isBooked}
                    className={`
                      w-full py-2 px-3 rounded-lg text-sm font-medium transition-all
                      ${slot.isBooked
                        ? "bg-surface-2 text-gray-400 cursor-not-allowed"
                        : isSelected
                          ? `${roleStyles.bg} text-white`
                          : "bg-surface-1 hover:bg-surface-2 text-foreground cursor-pointer"
                      }
                    `}
                  >
                    {slot.startTime}
                    {slot.isBooked && (
                      <span className="block text-[10px] text-gray-400">תפוס</span>
                    )}
                  </button>

                  {/* Cancel button for own bookings or admin */}
                  {canCancel && (
                    <button
                      onClick={() => handleCancel(slot.booking!.id)}
                      disabled={cancelling === slot.booking!.id}
                      className="absolute -top-1 -left-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors cursor-pointer"
                      title="ביטול פגישה"
                    >
                      {cancelling === slot.booking!.id ? (
                        <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2 size={12} />
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {slots.length === 0 && (
            <p className="text-center text-gray-400 py-8">
              אין זמנים זמינים ביום זה
            </p>
          )}
        </div>

        {/* Booking Form */}
        {selectedSlot && (
          <div className="p-4 border-t border-surface-2 bg-surface-1">
            <div className="mb-3">
              <p className="text-sm font-medium text-foreground mb-1">
                זמן נבחר: {selectedSlot.start} - {selectedSlot.end}
              </p>
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium text-foreground mb-1.5">
                נושא הפגישה *
              </label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value.slice(0, 200))}
                placeholder="במה תרצה להתייעץ?"
                rows={2}
                className="w-full px-3 py-2 rounded-lg border border-surface-3 bg-surface-0 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none text-sm"
                maxLength={200}
              />
              <p className="text-xs text-gray-400 text-left mt-1">{topic.length}/200</p>
            </div>

            {error && (
              <p className="text-sm text-error bg-error/10 px-3 py-2 rounded-lg mb-3">
                {error}
              </p>
            )}

            <Button
              onClick={handleBook}
              loading={booking}
              disabled={!topic.trim()}
              className="w-full"
            >
              קבע פגישה
            </Button>
          </div>
        )}
      </div>
    </dialog>
  );
}
```

---

## Task 13: Create AvailabilityPicker Component

**Files:**
- Create: `src/components/experts/AvailabilityPicker.tsx`

**Step 1: Create multi-month calendar picker for admin**

```typescript
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
```

---

## Task 14: Create TimeRangeInput Component

**Files:**
- Create: `src/components/experts/TimeRangeInput.tsx`

**Step 1: Create time range input component**

```typescript
"use client";

import { Trash2 } from "lucide-react";
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

export function TimeRangeInput({ range, onChange, onRemove }: TimeRangeInputProps) {
  return (
    <div className="flex items-center gap-2">
      <select
        value={range.start}
        onChange={(e) => onChange({ ...range, start: e.target.value })}
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
        className="flex-1 px-2 py-1.5 text-sm rounded-lg border border-surface-3 bg-surface-0 focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
      >
        {TIME_OPTIONS.map((time) => (
          <option key={time} value={time}>
            {time}
          </option>
        ))}
      </select>

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
```

---

## Task 15: Update AddEditExpertModal with Availability Picker

**Files:**
- Modify: `src/components/experts/AddEditExpertModal.tsx`

**Step 1: Import AvailabilityPicker and update state**

Add import at top:
```typescript
import { AvailabilityPicker } from "./AvailabilityPicker";
import type { Expert, Grade, ConfigurableRole, ExpertAvailability } from "@/types";
```

**Step 2: Update state and effects**

Replace `const [availability, setAvailability] = useState("");` with:
```typescript
const [availability, setAvailability] = useState<ExpertAvailability[]>([]);
```

Update the useEffect that sets initial values - replace `setAvailability(expert.availability);` with:
```typescript
setAvailability(expert.availability || []);
```

And in the else branch, replace `setAvailability("");` with:
```typescript
setAvailability([]);
```

**Step 3: Replace the old availability text input**

Replace the entire "Availability" div (lines ~305-318) with:
```typescript
{/* Availability Picker */}
<AvailabilityPicker
  availability={availability}
  onChange={setAvailability}
/>
```

**Step 4: Update handleSubmit**

The `availability` field is now the array, so no change needed there - it already passes `availability` to `onSave`.

---

## Task 16: Update ExpertCard with Badges

**Files:**
- Modify: `src/components/experts/ExpertCard.tsx`

**Step 1: Add badge logic**

Add these imports at top:
```typescript
import type { Expert, ExpertAvailability } from "@/types";
```

**Step 2: Add badge calculation helper**

Add this function before the component:
```typescript
function getExpertBadge(availability: ExpertAvailability[] | undefined): {
  type: "none" | "no-month" | "no-future";
  label: string;
  color: string;
} | null {
  if (!availability || availability.length === 0) {
    return {
      type: "no-future",
      label: "לא זמין",
      color: "bg-red-500 text-white",
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split("T")[0];

  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  // Check for any future dates
  const hasFutureDates = availability.some((a) => a.date >= todayStr);

  if (!hasFutureDates) {
    return {
      type: "no-future",
      label: "לא זמין",
      color: "bg-red-500 text-white",
    };
  }

  // Check for dates in current month
  const hasCurrentMonthDates = availability.some((a) => {
    const date = new Date(a.date);
    return (
      date >= today &&
      date.getMonth() === currentMonth &&
      date.getFullYear() === currentYear
    );
  });

  if (!hasCurrentMonthDates) {
    return {
      type: "no-month",
      label: "לא זמין החודש",
      color: "bg-amber-500 text-white",
    };
  }

  return null;
}
```

**Step 3: Add badge to the component**

Inside the component, after the line `const roleStyles = useRoleStyles();`, add:
```typescript
const badge = isAdmin ? getExpertBadge(expert.availability) : null;
```

**Step 4: Render badge**

Add this right after the opening `<div` of the card (after line ~45, before Admin Actions):
```typescript
{/* Availability Badge (Admin only) */}
{badge && (
  <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-medium ${badge.color} z-10`}>
    {badge.label}
  </div>
)}
```

---

## Task 17: Update ExpertsSection with Calendar

**Files:**
- Modify: `src/components/experts/ExpertsSection.tsx`

**Step 1: Add imports**

Add these imports:
```typescript
import { ExpertsCalendar } from "./ExpertsCalendar";
import { DayExpertsModal } from "./DayExpertsModal";
import { TimeSlotsModal } from "./TimeSlotsModal";
import { useBookingsByDate, useCreateBooking, useDeleteBooking } from "@/lib/queries";
import { useAuth } from "@/contexts/AuthContext";
import { getSessionToken } from "@/lib/utils/sessionToken";
import { getCurrentMonthDates } from "@/lib/utils/slots";
```

**Step 2: Add new state and hooks**

After the existing state declarations, add:
```typescript
const { session } = useAuth();
const [selectedDate, setSelectedDate] = useState<string | null>(null);
const [dayExpertsOpen, setDayExpertsOpen] = useState(false);
const [dayExperts, setDayExperts] = useState<Expert[]>([]);
const [selectedExpertForSlots, setSelectedExpertForSlots] = useState<Expert | null>(null);
const [timeSlotsOpen, setTimeSlotsOpen] = useState(false);

const { dates } = useMemo(() => getCurrentMonthDates(), []);
const { data: bookings = [] } = useBookingsByDate(selectedDate);
const createBookingMutation = useCreateBooking();
const deleteBookingMutation = useDeleteBooking();
```

**Step 3: Add handler functions**

Add after the existing handlers:
```typescript
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

const handleBook = async (startTime: string, endTime: string, topic: string) => {
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
    topic,
    sessionToken: getSessionToken(),
  });

  toast.success("נקבע", "הפגישה נקבעה בהצלחה");
};

const handleCancelBooking = async (bookingId: string) => {
  await deleteBookingMutation.mutateAsync(bookingId);
  toast.success("בוטל", "הפגישה בוטלה");
};
```

**Step 4: Add calendar and modals to render**

Add before the closing `</div>` of the component (before line ~207):
```typescript
{/* Calendar */}
<ExpertsCalendar
  experts={allExperts}
  bookings={bookings}
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
  bookings={bookings}
  onSelectExpert={handleSelectExpertForSlots}
  onClose={() => setDayExpertsOpen(false)}
/>

{/* Time Slots Modal */}
<TimeSlotsModal
  isOpen={timeSlotsOpen}
  expert={selectedExpertForSlots}
  date={selectedDate}
  bookings={bookings}
  currentUserId={session?.documentId || ""}
  isAdmin={isAdmin}
  onBook={handleBook}
  onCancelBooking={handleCancelBooking}
  onClose={() => setTimeSlotsOpen(false)}
/>
```

---

## Task 18: Export New Components from Index

**Files:**
- Modify: `src/components/experts/index.ts`

**Step 1: Add exports**

Add these exports:
```typescript
export { ExpertsCalendar } from "./ExpertsCalendar";
export { CalendarDayCell } from "./CalendarDayCell";
export { DayExpertsModal } from "./DayExpertsModal";
export { TimeSlotsModal } from "./TimeSlotsModal";
export { AvailabilityPicker } from "./AvailabilityPicker";
export { TimeRangeInput } from "./TimeRangeInput";
```

---

## Task 19: Create Admin Meetings Page

**Files:**
- Create: `src/app/(dashboard)/admin/expert-meetings/page.tsx`

**Step 1: Create the admin meetings page**

```typescript
"use client";

import { useState, useMemo } from "react";
import { useBookings, useDeleteBooking } from "@/lib/queries";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToastActions } from "@/components/ui/Toast";
import { Trash2, Search, Calendar, Clock, User, BookOpen } from "lucide-react";
import { formatHebrewDate } from "@/lib/utils/slots";
import type { ExpertBooking, Grade } from "@/types";

type TabType = "upcoming" | "past";

const ROLE_LABELS: Record<string, string> = {
  admin: "מנהל",
  teacher: "מורה",
  parent: "הורה",
  student: "תלמיד",
};

export default function ExpertMeetingsPage() {
  const { data: bookings = [], isLoading } = useBookings();
  const deleteBookingMutation = useDeleteBooking();
  const toast = useToastActions();

  const [activeTab, setActiveTab] = useState<TabType>("upcoming");
  const [searchQuery, setSearchQuery] = useState("");
  const [gradeFilter, setGradeFilter] = useState<Grade | "all">("all");
  const [deleteConfirm, setDeleteConfirm] = useState<ExpertBooking | null>(null);
  const [deleting, setDeleting] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  // Filter and sort bookings
  const filteredBookings = useMemo(() => {
    return bookings
      .filter((b) => {
        // Tab filter
        const isUpcoming = b.date >= today;
        if (activeTab === "upcoming" && !isUpcoming) return false;
        if (activeTab === "past" && isUpcoming) return false;

        // Grade filter
        if (gradeFilter !== "all" && b.userGrade !== gradeFilter) return false;

        // Search filter
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          return (
            b.userName.toLowerCase().includes(query) ||
            b.topic.toLowerCase().includes(query)
          );
        }

        return true;
      })
      .sort((a, b) => {
        // Sort by date, then time
        const dateCompare = a.date.localeCompare(b.date);
        if (dateCompare !== 0) return activeTab === "upcoming" ? dateCompare : -dateCompare;
        return a.startTime.localeCompare(b.startTime);
      });
  }, [bookings, activeTab, gradeFilter, searchQuery, today]);

  const handleDelete = async () => {
    if (!deleteConfirm || deleting) return;

    setDeleting(true);
    try {
      await deleteBookingMutation.mutateAsync(deleteConfirm.id);
      toast.success("נמחק", "הפגישה נמחקה בהצלחה");
    } catch {
      toast.error("שגיאה", "שגיאה במחיקת הפגישה");
    }
    setDeleting(false);
    setDeleteConfirm(null);
  };

  const grades: Grade[] = ["א", "ב", "ג", "ד", "ה", "ו"];

  return (
    <div className="p-6 max-w-6xl mx-auto" dir="rtl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-rubik font-bold text-foreground mb-2">
          ניהול פגישות מומחים
        </h1>
        <p className="text-gray-500">צפייה וניהול של כל פגישות הייעוץ</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab("upcoming")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer ${
            activeTab === "upcoming"
              ? "bg-primary text-white"
              : "bg-surface-1 text-foreground hover:bg-surface-2"
          }`}
        >
          פגישות קרובות
        </button>
        <button
          onClick={() => setActiveTab("past")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer ${
            activeTab === "past"
              ? "bg-primary text-white"
              : "bg-surface-1 text-foreground hover:bg-surface-2"
          }`}
        >
          פגישות קודמות
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="חיפוש לפי שם או נושא..."
            className="w-full pr-10 pl-4 py-2 rounded-lg border border-surface-3 bg-surface-0 focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* Grade Filter */}
        <select
          value={gradeFilter}
          onChange={(e) => setGradeFilter(e.target.value as Grade | "all")}
          className="px-4 py-2 rounded-lg border border-surface-3 bg-surface-0 focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
        >
          <option value="all">כל הכיתות</option>
          {grades.map((g) => (
            <option key={g} value={g}>כיתה {g}</option>
          ))}
        </select>
      </div>

      {/* Meetings Table */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-surface-1 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="text-center py-12 bg-surface-1 rounded-2xl">
          <Calendar size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">אין פגישות</p>
        </div>
      ) : (
        <div className="bg-surface-0 rounded-2xl border border-surface-2 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-surface-1 border-b border-surface-2">
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      <span>תאריך</span>
                    </div>
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      <span>שעה</span>
                    </div>
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">מומחה</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">
                    <div className="flex items-center gap-1">
                      <User size={14} />
                      <span>משתמש</span>
                    </div>
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">תפקיד</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">כיתה</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">
                    <div className="flex items-center gap-1">
                      <BookOpen size={14} />
                      <span>נושא</span>
                    </div>
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">נוצר</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">פעולות</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="border-b border-surface-2 last:border-0 hover:bg-surface-1/50 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm">
                      {formatHebrewDate(booking.date)}
                    </td>
                    <td className="px-4 py-3 text-sm font-mono">
                      {booking.startTime}-{booking.endTime}
                    </td>
                    <td className="px-4 py-3 text-sm">{booking.expertId}</td>
                    <td className="px-4 py-3 text-sm font-medium">{booking.userName}</td>
                    <td className="px-4 py-3 text-sm">{ROLE_LABELS[booking.userRole]}</td>
                    <td className="px-4 py-3 text-sm">{booking.userGrade || "-"}</td>
                    <td className="px-4 py-3 text-sm max-w-[200px] truncate" title={booking.topic}>
                      {booking.topic}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {booking.createdAt.toLocaleDateString("he-IL")}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => setDeleteConfirm(booking)}
                        className="p-1.5 text-gray-400 hover:text-error hover:bg-error/10 rounded-lg transition-colors cursor-pointer"
                        title="מחק פגישה"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        title="מחיקת פגישה"
        message={`האם למחוק את הפגישה של ${deleteConfirm?.userName} ב-${deleteConfirm?.date} ${deleteConfirm?.startTime}?`}
        confirmLabel="מחק"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
}
```

---

## Task 20: Add Sidebar Link for Admin Meetings

**Files:**
- Modify: `src/components/dashboard/Sidebar.tsx`

**Step 1: Add Calendar icon import**

Add `Calendar` to the lucide-react imports:
```typescript
import {
  // ... existing imports ...
  Calendar,
} from "lucide-react";
```

**Step 2: Add nav item for expert meetings**

Find the navItems array and add this item right after the "שאל את המומחה" entry:
```typescript
{ label: "פגישות מומחים", href: "/expert-meetings", roles: ["admin"], icon: Calendar },
```

---

## Task 21: Create Firestore Indexes

**Files:**
- Update: `firestore.indexes.json` (if exists) or create index via Firebase Console

**Step 1: Add composite index for bookings**

The bookings collection needs these composite indexes:
1. `date` ASC, `startTime` ASC - for getBookingsByDate
2. `expertId` ASC, `date` ASC, `startTime` ASC - for getBookingsByExpert

If using Firebase Console, create these indexes manually, or add to `firestore.indexes.json`:
```json
{
  "indexes": [
    {
      "collectionGroup": "expert-bookings",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "date", "order": "ASCENDING" },
        { "fieldPath": "startTime", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "expert-bookings",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "expertId", "order": "ASCENDING" },
        { "fieldPath": "date", "order": "ASCENDING" },
        { "fieldPath": "startTime", "order": "ASCENDING" }
      ]
    }
  ]
}
```

---

## Task 22: Update CHANGELOG

**Files:**
- Modify: `CHANGELOG.md`

**Step 1: Add entry under [Unreleased]**

Add to the appropriate section:
```markdown
### Added
- Expert scheduling system with calendar-based booking
  - Monthly calendar view showing expert availability per day
  - 10-minute consultation slot booking with topic input
  - Color-coded availability indicators (green/orange/red)
  - Admin availability management with multi-month date picker
  - User cancellation within 5-minute grace period
  - Admin meetings management page with filters and search
  - Expert card badges for availability status ("לא זמין" / "לא זמין החודש")
```

---

## Task 23: Build and Test

**Step 1: Run build**

Run: `npm run build`
Expected: Build completes without errors

**Step 2: Run lint**

Run: `npm run lint`
Expected: No lint errors

**Step 3: Manual testing checklist**

- [ ] Calendar displays current month with correct Hebrew formatting
- [ ] Experts with availability show on calendar days
- [ ] Clicking a day opens expert selection modal
- [ ] Selecting expert shows time slots
- [ ] Booking a slot works and shows confirmation
- [ ] Booked slots appear as "תפוס"
- [ ] User can cancel within 5 minutes
- [ ] Admin can delete any booking
- [ ] Admin availability picker works with multi-month navigation
- [ ] Time ranges can be added/removed per date
- [ ] Expert badges show correctly (no-month yellow, no-future red)
- [ ] Admin meetings page shows all bookings with filters
- [ ] Sidebar link appears for admin only

---

## Task 24: Commit

**Step 1: Stage and commit**

```bash
git add -A
git commit -m "feat(experts): add scheduling system with calendar booking

- Add ExpertAvailability and ExpertBooking types
- Create bookings service and React Query hooks
- Add monthly calendar below experts grid
- Implement time slot selection with 10-min intervals
- Add availability management in AddEditExpertModal
- Create admin meetings page at /admin/expert-meetings
- Add expert card badges for availability status
- Support user cancellation within 5-min grace period"
```
