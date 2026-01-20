# Admin Feature Requests - Design Document

**Date:** 2026-01-20
**Status:** Approved

## Overview

Six feature requests from admin to improve the platform:

| # | Feature | Summary |
|---|---------|---------|
| 1 | Gallery dates | Comment out date display (keep code for future) |
| 2 | Image counts | Show on grade selection page + unit cards |
| 3 | Parent personal page | Add parent access to במה אישית (read-only, grade-filtered) |
| 4 | Community activities | Move to home page, visible to all roles |
| 5 | Teacher delete responses | Teachers can delete any response from their grade |
| 6 | Reports restructure | Grade-based daily reports, list + calendar toggle |

---

## Feature 1: Hide Gallery Dates + Add Image Counts

### 1.1 Hide Dates on Documentation Cards

**File:** `src/components/documentation/DocumentationCard.tsx`

Comment out the date display in the card footer. The date is currently shown using `doc.createdAt.toLocaleDateString("he-IL")`. Wrap in comment block for future restoration.

Also comment out date in `DocumentationModal.tsx` footer if shown there.

### 1.2 Image Count on Grade Selection Page

**File:** `src/app/(dashboard)/[role]/documentation/page.tsx`

Add a query to count total documentation items per grade. Display as a badge on each grade card:

```
כיתה א׳
📷 47 תמונות
```

**New query:** `useDocumentationCountByGrade()` - returns `{ [grade]: number }`

### 1.3 Image Count on Unit Cards

**File:** `src/app/(dashboard)/[role]/documentation/[grade]/page.tsx`

Each unit card shows total images for that unit:

```
[Unit Icon] חקר מים
12 תמונות
```

**New query:** `useDocumentationCountByUnit(grade)` - returns `{ [unitId]: number }`

### Implementation Notes

Create efficient count queries that only fetch document metadata, not full documents.

---

## Feature 2: Parent Access to Personal Stage (במה אישית)

### Changes Required

**File:** `src/app/(dashboard)/[role]/personal/page.tsx`

Add "parent" to allowed roles:
```typescript
const allowedRoles = ["admin", "student", "parent"];
```

**File:** `src/components/dashboard/Sidebar.tsx`

Update navigation link:
```typescript
{ label: "במה אישית", href: "/personal", roles: ["admin", "student", "parent"], icon: Heart },
```

### Behavior

- Parents see media filtered to their child's grade (same as students)
- Read-only view - no upload/edit capabilities
- Uses existing `usePersonalMediaByGrade(userGrade)` query
- Same intro banner and text as students see

---

## Feature 3: Community Activities on Home Page

### Current State

- Community activities exist at `/parent/community-activities`
- Data stored in `parentContent` collection with `type: "community-activities"`
- Components: `EventCard.tsx`, `EventList.tsx` in `src/components/parent-content/`

### New Approach

**New Component:** `src/components/home/CommunityActivitiesSection.tsx`

- Fetches community events using existing query
- Displays using existing `EventCard` component
- Visible to all roles on home/dashboard page
- Read-only (admin manages via existing `/admin/parent-content`)

### Sidebar Change

**File:** `src/components/dashboard/Sidebar.tsx`

Remove separate "פעילויות קהילתיות" link from parent navigation since it's now on home page.

---

## Feature 4: Teacher Delete Responses

### Current State

**File:** `src/app/(dashboard)/[role]/responses/[grade]/page.tsx`

Delete button only shows for admins.

### Change Required

Allow teachers to delete responses from their assigned grade:

```typescript
const canDelete = session?.user.role === "admin" ||
  (session?.user.role === "teacher" && session?.user.grade === grade);

{canDelete && (
  <Button variant="destructive" ...>מחק תגובה</Button>
)}
```

### Security Note

Access control already handled at page routing level - teachers can only view their own grade's responses.

---

## Feature 5: Reports Restructure (Grade-Based Daily Reports)

### Current Flow (to remove)
```
Grade Selection → Unit Selection → View Report
```

### New Flow
```
Grade Selection → Daily Reports List/Calendar → View Report
```

### Data Model Changes

**File:** `src/types/index.ts`

```typescript
export interface Report {
  id: string;
  gradeId: Grade;
  date: Date;           // The day this report covers
  teacherContent: string;
  parentContent: string;
  generatedAt: Date;
  // Removed: unitId
}
```

### UI Components

**Remove:** Unit selection page (old `[grade]/page.tsx` that listed units)

**New route structure:** `/reports/[grade]/` shows daily reports, `/reports/[grade]/[date]/` shows specific report

**New Components:**

1. **`DailyReportsList.tsx`** - Simple date list view
   - Shows dates with available reports
   - Format: "דוח יום 15/01/2026"
   - Click to view report

2. **`DailyReportsCalendar.tsx`** - Calendar view
   - Month grid showing which days have reports
   - Highlighted/clickable dates with reports
   - Navigate between months

3. **`ViewToggle.tsx`** - Toggle between list/calendar
   - Toggle button: 📋 List | 📅 Calendar

### Route Change

**Old:** `/reports/[grade]/[unitId]/page.tsx`
**New:** `/reports/[grade]/[date]/page.tsx` (date format: `YYYY-MM-DD`)

---

## Queries & Services

### New Queries

**File:** `src/lib/queries/documentation.ts`
- `useDocumentationCountByGrade()` - Count per grade
- `useDocumentationCountByUnit(grade)` - Count per unit

**File:** `src/lib/queries/reports.ts`
- `useReportsByGrade(grade)` - All daily reports for a grade
- `useReportByDate(grade, date)` - Specific day's report

### Service Updates

**File:** `src/lib/services/reports.ts`
- Update `getReports()` to query by grade + date range
- Update `createReport()` to use date instead of unitId
- Add `getReportByDate(grade, date)`

**File:** `src/lib/services/documentation.ts`
- Add `getDocumentationCounts()` - Efficient count aggregation

---

## Migration

### Reports Data Migration

Existing reports have `unitId`, new ones will have `date`.

**Migration script:** Set `date` from `generatedAt` and remove `unitId` from existing reports.

### Files to Delete

- `src/app/(dashboard)/[role]/reports/[grade]/[unitId]/page.tsx` (replaced by date-based route)

---

## Summary of File Changes

### Files to Modify
- `src/components/documentation/DocumentationCard.tsx` - Comment out date
- `src/components/documentation/DocumentationModal.tsx` - Comment out date
- `src/app/(dashboard)/[role]/documentation/page.tsx` - Add image counts per grade
- `src/app/(dashboard)/[role]/documentation/[grade]/page.tsx` - Add image counts per unit
- `src/app/(dashboard)/[role]/personal/page.tsx` - Add parent role
- `src/components/dashboard/Sidebar.tsx` - Update navigation
- `src/app/(dashboard)/[role]/responses/[grade]/page.tsx` - Teacher delete permission
- `src/app/(dashboard)/[role]/reports/[grade]/page.tsx` - Daily reports list/calendar
- `src/types/index.ts` - Update Report interface
- `src/lib/services/reports.ts` - Update for date-based reports
- `src/lib/services/documentation.ts` - Add count functions

### New Files
- `src/components/home/CommunityActivitiesSection.tsx`
- `src/components/reports/DailyReportsList.tsx`
- `src/components/reports/DailyReportsCalendar.tsx`
- `src/components/reports/ViewToggle.tsx`
- `src/lib/queries/documentation.ts` - Count queries
- `src/app/(dashboard)/[role]/reports/[grade]/[date]/page.tsx`
- `scripts/migrate-reports-to-date-based.ts`

### Files to Delete
- `src/app/(dashboard)/[role]/reports/[grade]/[unitId]/page.tsx`
- `src/app/(dashboard)/parent/community-activities/page.tsx` (after migration)
