# יוצאים לדרך (Announcements) Feature Design

**Date:** 2026-01-20
**Status:** Approved

## Overview

A new "יוצאים לדרך" page where admin can post announcements with text and optional images targeted at specific grades. Students can view posts for their grade and comment publicly on them.

## Requirements

- Admin can create posts with text content and optional single image
- Admin selects target grade (א-ו) or "all grades" when posting
- Students see posts targeted at their grade OR posts marked "all grades"
- Students can comment on posts (public comments visible to all students in that grade)
- Admin can delete posts and delete comments
- Sidebar link appears before "יומן חוקר" for students
- Only admin and students have access (not teachers/parents)

## Data Model

### Firestore Collection: `announcements`

```typescript
interface Announcement {
  id: string;
  content: string;            // Post text (required)
  imageUrl?: string;          // Optional image URL in Firebase Storage
  targetGrade: Grade | "all"; // "א" | "ב" | "ג" | "ד" | "ה" | "ו" | "all"
  comments: AnnouncementComment[];
  createdAt: Date;
  authorName: string;         // Admin who posted
}

interface AnnouncementComment {
  id: string;
  authorName: string;         // Student name
  authorGrade: Grade;         // Student's grade (for display)
  content: string;
  createdAt: Date;
}
```

### Firestore Queries

- **Admin:** Fetch ALL posts, ordered by `createdAt` desc
- **Students:** `where("targetGrade", "in", [studentGrade, "all"])`, ordered by `createdAt` desc

## File Structure

### New Files

```
src/lib/services/announcements.ts     # Firestore CRUD operations
src/lib/queries/announcements.ts      # React Query hooks
src/app/(dashboard)/[role]/announcements/page.tsx  # Main page
src/components/announcements/
  ├── AnnouncementCard.tsx            # Single post display + comments
  ├── AnnouncementForm.tsx            # Admin: create new post
  └── CommentForm.tsx                 # Student: add comment
```

### Modified Files

```
src/components/dashboard/Sidebar.tsx  # Add nav item
src/lib/queries/keys.ts               # Add query keys
src/lib/queries/index.ts              # Export new hooks
src/types/index.ts                    # Add types
src/contexts/VisibilityContext.tsx    # Add to default config
CHANGELOG.md                          # Document changes
```

## UI/UX Design

### Admin View (`/admin/announcements`)

**Top Section - Create Form:**
- Text area for content (required)
- Grade selector dropdown: א | ב | ג | ד | ה | ו | כל הכיתות
- Image upload button (optional, uses existing imageUpload utility)
- "פרסם" (Publish) button

**Posts List:**
- All posts displayed, newest first
- Each post card shows:
  - Content text
  - Image (if present)
  - Target grade badge (e.g., "כיתה ג" or "כל הכיתות")
  - Creation date
  - Delete button (trash icon)
- Comments section:
  - List of all comments with author name, grade, date
  - Delete button on each comment

### Student View (`/student/announcements`)

**Posts List (read-only creation):**
- Posts filtered to student's grade + "all grades" posts
- Each post card shows:
  - Content text
  - Image (if present)
  - Author name and date
- Comment form at bottom of each post:
  - Text area
  - Submit button
- Comments list showing all classmate comments

### Responsive Image Display

- Positioned below text content
- `max-width: 100%`, `height: auto`
- Rounded corners matching card style (`rounded-theme`)
- Clickable to open full-size in new tab

## Sidebar Configuration

### Nav Item Entry

```typescript
{
  label: "יוצאים לדרך",
  href: "/announcements",
  roles: ["admin", "student"],
  icon: Rocket  // lucide-react - fits "setting off" theme
}
```

**Position:** Before "יומן חוקר" in the navItems array

### Visibility Config

- Add `"announcements"` to student's default `SidebarLinkConfig[]`
- Admin display page will automatically include toggle for students

### Route Protection

- Page component checks session role
- Non-authorized roles (parent/teacher) redirect to their dashboard

## Implementation Notes

1. **Image Upload:** Reuse existing `processAndUploadImage` from `src/lib/utils/imageUpload.ts`
2. **Comments Pattern:** Follow existing `ForumReply` pattern with `arrayUnion` for adding comments
3. **React Query:** Follow established patterns in `src/lib/queries/` for caching
4. **Styling:** Use role-based theming with `useRoleStyles()` hook
5. **Hebrew Dates:** Use `toLocaleDateString("he-IL")` for date display
