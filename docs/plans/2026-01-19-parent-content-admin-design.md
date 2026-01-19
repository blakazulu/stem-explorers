# Parent Content Admin ("תוכן הורים") - Design Document

## Overview

Admin page for managing content on two parent-facing pages: "פעילויות קהילתיות" (Community Activities) and "STEM במשפחה" (STEM in the Family). Admins can edit intro text and manage events for each page.

## Data Structure

**Firestore Collection: `parentContent`**

Two documents, one per page:
- `/parentContent/community-activities`
- `/parentContent/stem-family`

```typescript
interface ParentContentDocument {
  intro: string;              // Plain text intro
  events: Event[];            // Array of events (ordered by admin)
  updatedAt: Timestamp;
}

interface Event {
  id: string;                 // Generated UUID
  title: string;              // Required
  description: string;        // Required
  date?: string;              // Optional, ISO date string
  imageUrl?: string;          // Optional, Firebase Storage URL
  linkUrl?: string;           // Optional, external link
  createdAt: Timestamp;
}
```

Using an array for events (instead of subcollection) makes drag-and-drop reordering simple - just update the array order in one write.

## Admin Page ("תוכן הורים")

**Route:** `/admin/parent-content`

**Layout:**
- Page title: "תוכן הורים"
- Two tabs: "פעילויות קהילתיות" | "STEM במשפחה"
- Each tab shows:
  1. Intro section - textarea with save button
  2. Events section - draggable list + "הוסף אירוע" button

**Event list item shows:**
- Drag handle
- Title + truncated description
- Date badge (if exists)
- Image thumbnail (if exists)
- Link icon (if exists)
- Edit/Delete buttons

**Add/Edit event modal:**
- Title input (required)
- Description textarea (required)
- Date picker (optional)
- Image upload with preview (optional)
- URL input (optional)
- Save/Cancel buttons

**Drag-and-drop:** Using existing drag-and-drop pattern from the codebase.

## Parent Pages Display

**Routes:**
- `/parent/community-activities` (פעילויות קהילתיות)
- `/parent/stem-family` (STEM במשפחה)

**Layout:**
- Page title (from sidebar label)
- Intro text paragraph at top
- Timeline of events below

**Timeline event card:**
```
┌─────────────────────────────────────┐
│ ● [Date badge if exists]            │
│                                     │
│   [Image if exists - full width]    │
│                                     │
│   Title (bold)                      │
│   Description text                  │
│                                     │
│   [🔗 Link text] (if URL exists)    │
└─────────────────────────────────────┘
        │
        │ (timeline connector line)
        │
┌─────────────────────────────────────┐
│ ● Next event...                     │
└─────────────────────────────────────┘
```

**Empty state:** "אין אירועים להצגה" with appropriate icon

**Loading state:** Skeleton cards matching the timeline layout

## Files to Create

| File | Purpose |
|------|---------|
| `src/types/parentContent.ts` | Event and ParentContent types |
| `src/lib/services/parentContent.ts` | Firestore CRUD operations |
| `src/lib/queries/parentContent.ts` | React Query hooks |
| `src/app/(dashboard)/admin/parent-content/page.tsx` | Admin management page |
| `src/app/(dashboard)/parent/community-activities/page.tsx` | Parent view page |
| `src/app/(dashboard)/parent/stem-family/page.tsx` | Parent view page |
| `src/components/parent-content/EventCard.tsx` | Timeline event card |
| `src/components/parent-content/EventForm.tsx` | Add/edit event modal |
| `src/components/parent-content/EventList.tsx` | Draggable admin list |

## Files to Modify

| File | Change |
|------|--------|
| `src/components/dashboard/Sidebar.tsx` | Add "תוכן הורים" link for admin (below forums) |
| `src/lib/queries/keys.ts` | Add parentContent query keys |
| `src/lib/queries/index.ts` | Export new hooks |
| `CHANGELOG.md` | Document the new feature |

## Edge Cases & Behavior

**Image handling:**
- Reuse existing image upload pattern from Personal page
- Resize to max 800px width, convert to WebP
- Store in Firebase Storage under `parent-content/{pageId}/{eventId}`
- Delete image from storage when event is deleted

**Validation:**
- Title: required, max 100 characters
- Description: required, max 1000 characters
- URL: optional, validate format if provided
- Date: optional, standard date picker

**Permissions:**
- Admin only can access `/admin/parent-content`
- Parents can view their respective pages (already in sidebar config)
- Role layout handles access control

**Initial state:**
- Create default documents on first admin visit if they don't exist
- Empty intro, empty events array

## Sidebar Placement

"תוכן הורים" link added for admin role, positioned below forums in the sidebar navigation.
