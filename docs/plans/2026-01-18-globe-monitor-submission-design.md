# Globe Monitor Submission Feature Design

## Overview

Enable designated students to submit globe monitoring data via a form on the globe-monitor page, with a limit of 2 submissions per day.

## Requirements

1. Create a special student user (password "ggg") with submission capability
2. Show submission button below globe logo, above calendar
3. Limit to 2 submissions per calendar day (midnight reset)
4. Form opens in a modal
5. Admin can see (but not edit) which users have submission capability

## Data Model

### User Document Update

Add optional field to User interface:

```typescript
export interface User {
  name: string;
  role: UserRole;
  grade: Grade | null;
  canSubmitGlobeMonitor?: boolean;  // New optional field
  createdAt: Date;
}
```

### New Firebase User

```
Collection: users
Document ID: "ggg"
{
  role: "student",
  grade: "ו",
  canSubmitGlobeMonitor: true,
  createdAt: <timestamp>
}
```

### Submission Document

Already defined in `GlobeMonitorSubmission`:

```typescript
interface GlobeMonitorSubmission {
  id: string;
  answers: Record<string, string | number | string[]>;
  submittedBy: string;      // User document ID
  submittedByName: string;  // User's entered name
  submittedAt: Date;
  date: string;             // YYYY-MM-DD for calendar grouping
}
```

## Service Layer

### New Functions in `src/lib/services/globeMonitor.ts`

1. `createGlobeMonitorSubmission(data)` - Create new submission
2. `getSubmissionsCountToday(userId)` - Get count of submissions by user for current day

### New React Query Hooks in `src/lib/queries/globeMonitor.ts`

1. `useCreateGlobeMonitorSubmission()` - Mutation for creating submissions
2. `useUserSubmissionsCountToday(userId)` - Query for daily count

## UI Components

### StudentCalendarView Updates

Location: `src/app/(dashboard)/[role]/globe-monitor/components/StudentCalendarView.tsx`

Add between globe logo and calendar:

```
[Globe Image]
גלוב-ניטור

┌─────────────────────────┐
│  📝 מלא דיווח ניטור     │  ← Only if canSubmitGlobeMonitor
│     (1/2 דיווחים היום)  │
└─────────────────────────┘

[Calendar]
```

**Button States:**
- Can submit: Primary button, shows "X/2 דיווחים היום"
- Limit reached: Disabled grey button, shows "הגשת 2 דיווחים היום"

### New Component: SubmissionFormModal

Location: `src/app/(dashboard)/[role]/globe-monitor/components/SubmissionFormModal.tsx`

**Features:**
- Renders form dynamically based on questions from Firestore
- Field types: date, time, number, text, single (radio), multi (checkbox)
- Date defaults to today, time defaults to now
- Validates required fields
- Shows success toast on submit
- Closes and refreshes calendar on success

### Admin Users Screen Update

Location: `src/app/(dashboard)/[role]/users/page.tsx` (or similar)

**Changes:**
- Display badge/chip "מדווח גלוב" for users with `canSubmitGlobeMonitor: true`
- Read-only indicator, not editable by admin

## Daily Limit Logic

```typescript
// Check if user can submit
const todayStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
const todayCount = await getSubmissionsCountToday(userId);
const canSubmit = todayCount < 2;
```

Query filters submissions where:
- `submittedBy === userId`
- `date === todayStr`

## File Changes Summary

1. `src/types/index.ts` - Add `canSubmitGlobeMonitor` to User interface
2. `src/lib/services/globeMonitor.ts` - Add create and count functions
3. `src/lib/queries/globeMonitor.ts` - Add mutation and count query hooks
4. `src/app/(dashboard)/[role]/globe-monitor/components/StudentCalendarView.tsx` - Add submission button
5. `src/app/(dashboard)/[role]/globe-monitor/components/SubmissionFormModal.tsx` - New component
6. `src/app/(dashboard)/[role]/users/page.tsx` - Show globe reporter badge
7. Firebase: Create user document with ID "ggg"
8. `CHANGELOG.md` - Document changes
