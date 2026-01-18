# Globe Monitor (גלוב-ניטורר) - Design Document

## Overview

A weather/environment monitoring feature for STEM Explorers. Admin manages a global questionnaire (not per-grade), and students can view submitted monitoring data in a calendar format.

## Key Decisions

- **Single route, role-based views**: `/[role]/globe-monitor/` shows different UI for admin vs student
- **Global questions**: Questions are not grade-specific, stored in their own collection
- **Calendar display**: Students see submissions organized by date
- **Auto-initialization**: Default questions seeded on first admin visit
- **Future-ready**: Submission form will be added later for a new user type

---

## Data Structure

### Collection: `globeMonitorQuestions`

One document per question.

```typescript
interface GlobeMonitorQuestion {
  id: string;
  label: string;           // e.g., "טמפרטורה"
  description?: string;    // Optional helper text
  type: "text" | "number" | "date" | "time" | "single" | "multi";
  options?: string[];      // For single/multi select
  unit?: string;           // e.g., "°C", "%"
  min?: number;            // For number type
  max?: number;            // For number type
  required: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### Collection: `globeMonitorSubmissions`

One document per submission.

```typescript
interface GlobeMonitorSubmission {
  id: string;
  answers: Record<string, any>;  // questionId -> answer value
  submittedBy: string;           // User ID (for future)
  submittedByName: string;       // Display name
  submittedAt: Date;
  date: string;                  // YYYY-MM-DD for calendar grouping
}
```

### Default Questions (Auto-Seeded)

| Label | Type | Config |
|-------|------|--------|
| תאריך | date | required: true |
| שעה | time | required: true |
| טמפרטורה | number | unit: "°C" |
| לחות | number | unit: "%", max: 100 |
| עננות - סוגי העננים | multi | options: קומולוס, סטרטוס, ציררוס, קומולונימבוס, ערפל, שמיים בהירים |
| אחוז כיסוי בשמים | number | unit: "%", max: 100 |
| משקעים | single | options: יש, אין |
| מצב הקרקע | single | options: יבשה, רטובה, בוצית |

---

## Routes & Navigation

### Sidebar Navigation

Add to `Sidebar.tsx`:
```typescript
{ label: "גלוב-ניטורר", href: "/globe-monitor", roles: ["admin", "student"], icon: Globe }
```

Also add `"globe-monitor"` to display settings for student visibility control.

### Route Structure

```
/[role]/globe-monitor/
├── page.tsx                    # Main page (role-based view)
│   ├── Admin: Question list + management
│   └── Student: Calendar with submissions
│
├── questions/
│   ├── new/page.tsx           # Admin: Create new question
│   └── [id]/page.tsx          # Admin: Edit question
│
└── submissions/
    └── [id]/page.tsx          # View single submission detail (both roles)
```

---

## Admin View

### Questions List Page

**Layout:**
- Globe logo (`/bg/globe.jpg`) centered at top
- Title: "גלוב-ניטורר"
- Subtitle: "ניהול שאלות הניטור"
- "הוסף שאלה חדשה" button

**Question Cards:**
- Display: label, type badge, unit (if applicable), required indicator
- Actions: Edit, Delete (with ConfirmDialog)

### Create/Edit Question Page

**Form Fields:**
- `label` - Text input (שם השאלה)
- `description` - Text input optional (תיאור/הנחיה)
- `type` - Select: טקסט, מספר, תאריך, שעה, בחירה בודדת, בחירה מרובה
- `required` - Checkbox (שדה חובה)

**Conditional fields:**
- **number**: unit, min, max inputs
- **single/multi**: Options list with add/remove

### Auto-Initialization

On admin first visit:
1. Check if `globeMonitorQuestions` collection is empty
2. If empty → seed default questions
3. Show toast: "שאלות ברירת מחדל נוצרו"

---

## Student View

### Calendar Page

**Layout:**
- Globe logo centered at top
- Title: "גלוב-ניטורר"
- Subtitle: "צפייה בנתוני ניטור"

**Calendar:**
- Monthly grid with Hebrew month names
- Prev/next month navigation
- Days with submissions marked with indicator
- Click date → shows submissions panel below

### Submissions Panel

Shows cards for selected date:
- Time, temperature, humidity, cloud type summary
- "צפה בפרטים" button

### Details Modal

- Full submission data (all fields)
- Read-only display
- Globe logo at top
- Close button

---

## Files to Create

```
src/
├── types/
│   └── globeMonitor.ts
│
├── lib/
│   ├── services/
│   │   └── globeMonitor.ts
│   └── queries/
│       └── globeMonitor.ts
│
├── app/(dashboard)/[role]/globe-monitor/
│   ├── page.tsx
│   ├── questions/
│   │   ├── new/page.tsx
│   │   └── [id]/page.tsx
│   └── components/
│       ├── AdminQuestionList.tsx
│       ├── QuestionCard.tsx
│       ├── QuestionForm.tsx
│       ├── StudentCalendarView.tsx
│       ├── CalendarGrid.tsx
│       ├── SubmissionCard.tsx
│       └── SubmissionDetailModal.tsx
```

## Files to Modify

| File | Change |
|------|--------|
| `src/components/dashboard/Sidebar.tsx` | Add globe-monitor nav item |
| `src/lib/queries/keys.ts` | Add globeMonitor query keys |
| `src/lib/queries/index.ts` | Export globeMonitor hooks |
| `src/lib/services/settings.ts` | Add globe-monitor visibility option |
| `src/app/(dashboard)/[role]/display/page.tsx` | Add globe-monitor toggle |
| `CHANGELOG.md` | Document new feature |

---

## References

- Cloud types source: [NOAA Ten Basic Clouds](https://www.noaa.gov/jetstream/clouds/ten-basic-clouds)
- Similar pattern: Questionnaires system (`src/lib/services/questionnaires.ts`)
