# Globe Monitor Submission - Implementation Plan

## Phase 1: Data Layer

### Task 1.1: Update User Type
- File: `src/types/index.ts`
- Add `canSubmitGlobeMonitor?: boolean` to User interface

### Task 1.2: Add Service Functions
- File: `src/lib/services/globeMonitor.ts`
- Add `createGlobeMonitorSubmission(data)` function
- Add `getSubmissionsCountToday(userId)` function

### Task 1.3: Add React Query Hooks
- File: `src/lib/queries/globeMonitor.ts`
- Add `useCreateGlobeMonitorSubmission()` mutation
- Add `useUserSubmissionsCountToday(userId)` query

## Phase 2: Submission Form UI

### Task 2.1: Create SubmissionFormModal Component
- File: `src/app/(dashboard)/[role]/globe-monitor/components/SubmissionFormModal.tsx`
- Modal with form that renders dynamically based on questions
- Handle all field types: date, time, number, text, single, multi
- Default date to today, time to now
- Validate required fields
- Submit and show success toast

### Task 2.2: Update StudentCalendarView
- File: `src/app/(dashboard)/[role]/globe-monitor/components/StudentCalendarView.tsx`
- Check if user has `canSubmitGlobeMonitor` flag
- Show submission button below header, above calendar
- Display submission count (X/2)
- Disable button when limit reached
- Open modal on button click

## Phase 3: Admin UI

### Task 3.1: Update Users List
- File: `src/app/(dashboard)/[role]/users/page.tsx` (or components)
- Show "מדווח גלוב" badge for users with flag
- Read-only, not editable

## Phase 4: Firebase Setup

### Task 4.1: Create User Document
- Manually create in Firebase console OR via script
- Document ID: "ggg"
- Data: { role: "student", grade: "ו", canSubmitGlobeMonitor: true, createdAt: timestamp }

## Phase 5: Finalize

### Task 5.1: Update CHANGELOG.md
- Document all changes under [Unreleased]
