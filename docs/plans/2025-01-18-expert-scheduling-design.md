# Expert Scheduling System Design

## Overview

Add a scheduling system to the Experts feature (שאל את המומחה) allowing users to book 10-minute consultation slots with STEM experts.

## Data Structure

### Updated Expert Type

```typescript
interface ExpertAvailability {
  date: string;           // "2025-01-15" (ISO date)
  timeRanges: TimeRange[];
}

interface TimeRange {
  start: string;  // "10:00"
  end: string;    // "11:00"
}

// Updated Expert interface
interface Expert {
  // ... existing fields ...
  availability: ExpertAvailability[];  // replaces old string field
}
```

### New ExpertBooking Type

```typescript
interface ExpertBooking {
  id: string;
  expertId: string;
  date: string;              // "2025-01-15"
  startTime: string;         // "10:00"
  endTime: string;           // "10:10"
  userId: string;
  userName: string;
  userRole: Role;
  userGrade: Grade;
  topic: string;
  createdAt: Date;
  sessionToken: string;      // for 5-min cancel window check
}
```

### Firestore Structure

- Expert availability: stays within `settings/experts` document (existing)
- Bookings: new collection `expert-bookings/{bookingId}`

## User Interface

### Calendar View (All Users)

**Location:** Below experts grid on the existing experts page

**Monthly Calendar:**
- Shows current month only (no navigation)
- Hebrew month/year header (e.g., "ינואר 2025")
- 7-column grid (Sunday-Saturday, RTL)
- Today's date highlighted
- Past days dimmed but visible

**Day Cell Contents:**
- Expert names listed vertically (truncate if >2-3)
- Colored availability indicator per expert:
  - 🟢 Green = 3+ slots available
  - 🟠 Orange = 1-2 slots left
  - 🔴 Red = fully booked (0 slots)
- Empty/grayed for days with no experts

### Booking Flow

1. **Click day** → Day Modal opens
2. **Day Modal:** Shows experts available that day (filtered by user's role/grade)
   - Each expert: avatar, name, title, availability indicator
3. **Click expert** → Time Slots Modal opens
4. **Time Slots Modal:** Shows 10-minute slots from expert's time ranges
   - Available slots: clickable
   - Booked slots: grayed out with "תפוס"
5. **Click available slot** → Booking Form appears
   - Topic/reason textarea
   - Confirm button
6. **After booking:** Slot immediately shows as booked

### Expert Card Badges (Admin Only)

**Location:** Top-right corner of ExpertCard

**Badge Types:**
- **"לא זמין החודש"** (yellow) - Expert has future dates but none this month
- **"לא זמין"** (red) - Expert has zero future availability (urgent)

Priority: Red badge takes precedence if both conditions apply.

## Admin Features

### Availability Management

**Location:** New section "זמינות" in AddEditExpertModal

**Multi-Month Calendar Picker:**
- Small calendar with month navigation arrows
- Click dates to select/deselect
- Selected dates highlighted in role-themed color

**Selected Dates List:**
- Shows all selected dates below calendar
- Each date row:
  - Date display (e.g., "15 בינואר 2025")
  - Time ranges with + button to add more
  - Each range: start picker, end picker, delete button
  - Default new range: 10:00-11:00

**Validation:**
- Time ranges must be valid (end > start)
- Minimum 10 minutes per range
- Empty availability allowed (will show "לא זמין" badge)

### Editing with Existing Bookings

When admin removes dates/times that have bookings:
1. System checks for impacted bookings before saving
2. Warning Modal appears:
   - "הפעולה תבטל את הפגישות הבאות:"
   - List of affected bookings (date, time, user name, topic)
   - Buttons: "ביטול" / "אישור ומחיקה"
3. Proceeds only if admin confirms

### Admin Meetings Page

**Route:** `/admin/expert-meetings`

**Sidebar:** New link "פגישות מומחים" below "שאל את המומחה" (admin-only)

**Header:**
- Title: "ניהול פגישות מומחים"
- Filters: date range, expert dropdown, grade dropdown, search box

**Tabs:**
- "פגישות קרובות" (Upcoming) - default
- "פגישות קודמות" (Past)

**Table Columns:**
| תאריך | שעה | מומחה | משתמש | תפקיד | כיתה | נושא | נוצר ב- | פעולות |

**Features:**
- Sortable columns
- Delete button per row (with confirmation)
- Pagination for large lists
- Empty state when no meetings

## Cancellation Rules

### User Cancellation
- Can cancel own booking within 5 minutes of booking creation
- Must be same session (checked via sessionToken)
- Cancel button disappears after 5 minutes or new session

### Admin Cancellation
- Can delete any booking anytime
- Delete from admin meetings page or from time slots modal
- Confirmation required before deletion

## Access Control

### Who Can Book
- Users can only book experts they can see
- Visibility based on expert's `roles` configuration (teacher/parent/student)
- If user's role is in expert's roles array, they can view and book

### Calendar Per Grade
- Each grade sees their own calendar view
- Booking slots are globally shared
- If global expert booked by grade א user, slot unavailable for all grades

## Services & React Query

### New Service: `src/lib/services/bookings.ts`

```typescript
getBookings()                      // all bookings (admin)
getBookingsByExpert(expertId)
getBookingsByDate(date)
createBooking(booking)
deleteBooking(bookingId)
```

### New Hooks: `src/lib/queries/bookings.ts`

```typescript
useBookings()                      // admin: all bookings
useBookingsByDate(date)            // calendar: slots for a day
useCreateBooking()                 // mutation
useDeleteBooking()                 // mutation
```

### Query Keys: `src/lib/queries/keys.ts`

```typescript
bookings: {
  all: ['bookings'],
  byDate: (date: string) => ['bookings', 'date', date],
  byExpert: (expertId: string) => ['bookings', 'expert', expertId],
}
```

## New Components

### Calendar Components (`src/components/experts/`)
- `ExpertsCalendar.tsx` - Monthly calendar grid
- `CalendarDayCell.tsx` - Day with expert names + indicators
- `DayExpertsModal.tsx` - Experts available on clicked day
- `TimeSlotsModal.tsx` - 10-min slots for selected expert
- `BookingForm.tsx` - Topic input + confirm (inside TimeSlotsModal)

### Admin Availability Components
- `AvailabilityPicker.tsx` - Multi-month date selector
- `SelectedDatesList.tsx` - Dates with time range inputs
- `TimeRangeInput.tsx` - Start/end time pickers
- `BookingWarningModal.tsx` - Warns about affected bookings

### Admin Meetings Page
- `src/app/(dashboard)/admin/expert-meetings/page.tsx`
- `MeetingsTable.tsx` - Table with filters, tabs, rows

### Updated Components
- `ExpertCard.tsx` - Add badge display
- `AddEditExpertModal.tsx` - Add AvailabilityPicker section

## Edge Cases

### Slot Generation
- Time ranges split into 10-minute slots
- If not divisible by 10, round down (10:00-10:25 → 2 slots)

### Concurrent Booking (Race Condition)
- Check slot availability before saving
- If taken, show error: "הזמן הזה כבר תפוס"
- Refresh slots to show updated state

### Session Token
- Generated on login, stored in localStorage
- Passed when creating booking
- Cancel checks: matching token + within 5 minutes

### Month Boundaries
- "Current month" based on system date
- Auto-updates at month rollover

### Empty States
- No experts for day: "אין מומחים זמינים ביום זה"
- No slots left: "כל הזמנים תפוסים"
- No bookings (admin): "אין פגישות"

## Migration

The existing `availability` field (free text string) will be replaced with the new structured `ExpertAvailability[]` array. Old text data will not be preserved. All existing experts will start with empty availability and show the "לא זמין" badge until admin adds dates.
