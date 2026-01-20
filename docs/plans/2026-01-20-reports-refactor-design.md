# Reports Refactor Design

## Overview

Refactor the reports system to be grade+questionnaire+date based instead of unit-based. The current `unitId` on reports is legacy - questionnaires and journals are grade-based only.

## Current State

- Reports have `unitId` but source data (journals/questionnaires) don't
- Reports page shows unit selector which doesn't align with data model
- Report ID format: `{gradeId}-{unitId}` or `{gradeId}-daily-{YYYY-MM-DD}`
- One report per grade per day

## New Design

### Data Model

**Report Type (updated)**

```typescript
interface Report {
  id: string;                    // Format: {gradeId}-{questionnaireId}-{YYYY-MM-DD}
  gradeId: Grade;
  questionnaireId: string;
  questionnaireName: string;     // Denormalized for display
  journalCount: number;          // Number of journals analyzed
  teacherContent: string;        // AI-generated for teachers
  parentContent: string;         // AI-generated for parents
  generatedAt: Date;
}
```

**Changes:**
- Removed: `unitId`
- Added: `questionnaireId`, `questionnaireName`, `journalCount`

**Report ID format:** `{gradeId}-{questionnaireId}-{YYYY-MM-DD}`

This allows multiple reports per grade per day (one per questionnaire with submissions).

### UI & Navigation

**Route structure (simplified)**

```
Current:  /[role]/reports/[grade]/[unitId]  (unit selector page)
New:      /[role]/reports/[grade]           (report list + viewer)
```

**Teacher/Parent flow:**
1. Open `/teacher/reports` → redirects to `/teacher/reports/{their-grade}`
2. See list of all reports for grade, sorted by date (newest first)
3. Each report card shows:
   - Date (formatted Hebrew date)
   - Questionnaire name
   - Response count (e.g., "12 תגובות")
4. Click card → view full report

**Admin flow:**
1. Open `/admin/reports` → see grade selector
2. Select grade → see same report list as teachers

### Report Generation

**Scheduled daily generation:**
- Get journals from today
- Group by grade AND questionnaireId
- For each grade+questionnaire combo with submissions:
  - Generate report with ID `{gradeId}-{questionnaireId}-{YYYY-MM-DD}`
  - Store `questionnaireName` and `journalCount`

**Manual generation (admin settings):**
- Same logic - find all grade+questionnaire combos with today's submissions
- Generate one report per combo
- Skip if report already exists for that combo+date

## Files to Change

### Types
- `src/types/index.ts` - Update `Report` interface

### Services
- `src/lib/services/reports.ts` - Update for new model, add `getReportsByGrade()`

### Queries
- `src/lib/queries/reports.ts` - Update hooks, add `useReportsByGrade()`
- `src/lib/queries/keys.ts` - Update query keys

### Pages
- **Delete:** `src/app/(dashboard)/[role]/reports/[grade]/[unitId]/page.tsx`
- **Rewrite:** `src/app/(dashboard)/[role]/reports/[grade]/page.tsx` - Report list + viewer
- **Update:** `src/app/(dashboard)/[role]/settings/page.tsx` - Generation grouped by questionnaire

### Netlify Functions
- `netlify/functions/generate-report.ts` - Accept questionnaireId, return new fields
- `netlify/functions/generate-daily-reports.ts` - Group by grade+questionnaire

## Out of Scope

- Migrating existing reports (old format will be ignored)
- Local development for report generation (only works in production via Netlify functions)

## Notes

- Teachers see only their assigned grade (no grade selector)
- Parents see same list view as teachers (content differs via teacherContent vs parentContent)
- Reports sorted by date, newest first
