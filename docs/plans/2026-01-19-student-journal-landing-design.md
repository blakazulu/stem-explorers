# Student Journal Landing Page Design

## Overview

Transform the student journal page into a landing page with two entry points:
1. **תיעוד איסוף הנתונים** - Student forum for sharing research observations
2. **רפלקציה אישית** - Questionnaire wizard (current journal functionality)

Additionally, add admin monitoring of student forum via tabs on the existing forum page.

## Routes

| Route | Purpose |
|-------|---------|
| `/student/journal` | Landing page with 2 card buttons |
| `/student/journal/questionnaire` | Questionnaire wizard (moved from journal) |
| `/student/forum` | Student forum (data collection sharing) |
| `/teacher/forum` | Teacher forum (unchanged) |
| `/admin/forum` | Tabbed view of both forums |

## Student Journal Landing Page

**Route:** `/student/journal`

**Layout:** Two prominent cards side by side (responsive - stack on mobile)

```
┌─────────────────────────┐  ┌─────────────────────────┐
│      📊 (icon)          │  │      📝 (icon)          │
│                         │  │                         │
│  תיעוד איסוף הנתונים     │  │    רפלקציה אישית        │
│                         │  │                         │
│  שתפו תצפיות, ממצאים     │  │  מלאו את יומן החוקר     │
│  ותובנות מהמחקר שלכם    │  │  ושתפו את החוויה שלכם   │
│                         │  │                         │
└─────────────────────────┘  └─────────────────────────┘
     → /student/forum           → /student/journal/questionnaire
```

**Behavior:**
- Each card is clickable and navigates to the respective route
- Cards use emerald/student theme colors
- Hover effects for interactivity

## Student Forum

**Route:** `/student/forum`

**Firestore Collection:** `student-forum` (separate from teacher `forum`)

**Functionality:** Same as teacher forum with adjustments:
- Header: "תיעוד איסוף הנתונים"
- Subtitle: "שתפו תצפיות וממצאים מהמחקר"
- Student theme colors (emerald)
- Students can create posts, reply, edit/delete their own posts
- No pin functionality for students (only admin can pin)

**Data Structure:** Same as existing `ForumPost` type:
```typescript
{
  id: string
  title: string
  content: string
  authorName: string
  createdAt: Date
  pinned?: boolean
  replies: ForumReply[]
}
```

## Admin Forum Page with Tabs

**Route:** `/admin/forum`

**Sidenav:** Rename "במה אישית - מורים" to "פורומים" for admin role

**Layout:**
```
┌──────────────────────────────────────────────────┐
│  💬 פורומים                                       │
│  ניהול פורומים של מורים ותלמידים                  │
├──────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐                │
│  │   מורים    │  │  תלמידים   │   ← Tabs        │
│  └─────────────┘  └─────────────┘                │
├──────────────────────────────────────────────────┤
│                                                  │
│  [Posts list based on selected tab]              │
│                                                  │
└──────────────────────────────────────────────────┘
```

**Behavior:**
- Default tab: "מורים" (teacher forum)
- Switching tabs loads posts from respective collection
- Admin can pin/delete/edit posts in both forums
- Admin can post in both forums

## Questionnaire Page

**Route:** `/student/journal/questionnaire`

**Implementation:**
- Move current journal page content to nested route
- Same `JournalWizard` component and logic
- Header: "רפלקציה אישית - יומן חוקר"
- Back button returns to `/student/journal`
- After submission: option to fill again or return to landing

## Implementation Plan

### Files to Create

1. `src/lib/services/studentForum.ts` - Student forum service (same pattern as forum.ts)
2. `src/lib/queries/studentForum.ts` - React Query hooks for student forum
3. `src/app/(dashboard)/[role]/journal/questionnaire/page.tsx` - Questionnaire page

### Files to Modify

1. `src/app/(dashboard)/[role]/journal/page.tsx` - Replace with landing page
2. `src/app/(dashboard)/[role]/forum/page.tsx` - Add role-based logic + admin tabs
3. `src/components/dashboard/Sidebar.tsx` - Rename admin forum link
4. `src/lib/queries/index.ts` - Export student forum hooks

### Firestore

- New collection: `student-forum` (same structure as `forum`)
