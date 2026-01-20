# Parents Challenge (אתגר הורים) - Design Document

## Overview

A feature allowing admin to create challenges for parents, with community engagement through comments. Only one challenge can be active at a time, and parents can only comment on the active challenge.

## User Roles & Permissions

| Action | Admin | Parent |
|--------|-------|--------|
| View challenges | All challenges | Grade-filtered |
| Create challenge | ✓ | - |
| Edit challenge | ✓ | - |
| Delete challenge | ✓ | - |
| Mark as active | ✓ | - |
| Add comment | - | Active challenge only |
| Delete comment | ✓ | - |

## Data Model

### Firestore Collection: `/challenges/{challengeId}`

```typescript
interface Challenge {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  videoUrl?: string;        // YouTube/Vimeo embed URL
  videoStorageUrl?: string; // Direct upload URL
  targetGrades: Grade[] | "all";  // "all" or ["א", "ב", "ג"]
  isActive: boolean;
  comments: ChallengeComment[];
  authorName: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ChallengeComment {
  id: string;
  authorName: string;
  authorGrade: Grade;
  content: string;
  imageUrl?: string;
  createdAt: Date;
}
```

### Storage Path

`/challenges/` - Images and videos (50MB limit for video compression support)

## Routes

| Route | Role | Purpose |
|-------|------|---------|
| `/parent/challenges` | Parent | View challenges, add comments |
| `/admin/challenges` | Admin | Manage challenges |

## Components

### Shared (`src/components/challenges/`)

- **ChallengeCard** - Displays a single challenge (expandable for inactive)
- **ChallengeMedia** - Handles image + video display (YouTube embed or uploaded video)
- **CommentList** - Shows comments on a challenge
- **CommentForm** - Form for parents to add comment (description + optional image)

### Admin (`src/components/challenges/admin/`)

- **ChallengeForm** - Create/edit challenge (title, description, media, grade selector)
- **ChallengeList** - Admin list with edit/delete/activate actions
- **ActiveToggle** - Button to mark challenge as active (auto-deactivates others)

## Parent View Layout

```
┌─────────────────────────────────┐
│ 🏆 אתגר הורים                    │
├─────────────────────────────────┤
│ ┌─────────────────────────────┐ │
│ │ ACTIVE CHALLENGE (expanded) │ │
│ │ - Title, Media, Description │ │
│ │ - Comment Form              │ │
│ │ - Comments List             │ │
│ └─────────────────────────────┘ │
│                                 │
│ אתגרים קודמים                    │
│ ┌─────────────────────────────┐ │
│ │ Past Challenge 1 [▼]        │ │
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │ Past Challenge 2 [▼]        │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

## Services (`src/lib/services/challenges.ts`)

- `getChallenges()` - All challenges (for admin)
- `getChallengesByGrade(grade)` - Filtered by grade (for parents)
- `createChallenge(data)` - Create new challenge
- `updateChallenge(id, data)` - Edit challenge
- `deleteChallenge(id)` - Delete challenge + cleanup storage files
- `setActiveChallenge(id)` - Mark as active, deactivate all others (transaction)
- `addChallengeComment(challengeId, comment)` - Add comment to active challenge
- `deleteChallengeComment(challengeId, commentId)` - Admin removes comment

## React Query Hooks (`src/lib/queries/challenges.ts`)

- `useChallenges()` - For admin
- `useChallengesByGrade(grade)` - For parents
- `useCreateChallenge()`
- `useUpdateChallenge()`
- `useDeleteChallenge()`
- `useSetActiveChallenge()`
- `useAddChallengeComment()`
- `useDeleteChallengeComment()`

### Query Keys

```typescript
challenges: {
  all: ["challenges"],
  byGrade: (grade: Grade) => ["challenges", "byGrade", grade]
}
```

## Firebase Configuration

### Firestore Rules

```javascript
match /challenges/{challengeId} {
  allow read: if true;
  allow write: if true; // Client-side role check (following existing pattern)
}
```

### Storage Rules

```javascript
match /challenges/{allPaths=**} {
  allow read: if true;
  allow write: if request.resource.size < 50 * 1024 * 1024
               && (request.resource.contentType.matches('image/.*')
                   || request.resource.contentType.matches('video/.*'));
}
```

### Firestore Index

```json
{
  "collectionGroup": "challenges",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "isActive", "order": "DESCENDING" },
    { "fieldPath": "createdAt", "order": "DESCENDING" }
  ]
}
```

## Sidebar Navigation

Add to `Sidebar.tsx` navItems:

```typescript
{ label: "אתגר הורים", href: "/parent/challenges", roles: ["parent"], icon: Trophy },
{ label: "אתגר הורים", href: "/admin/challenges", roles: ["admin"], icon: Trophy },
```

## Visibility Settings

Add `challenges` to admin display settings for parent role page visibility.

## Implementation Order

1. Types - Add Challenge and ChallengeComment types
2. Firebase config - Firestore rules, Storage rules, Index
3. Service - Create challenges service with all CRUD operations
4. Query hooks - React Query hooks for data fetching
5. Components - Shared components (ChallengeCard, ChallengeMedia, CommentList, CommentForm)
6. Admin components - ChallengeForm, ChallengeList, ActiveToggle
7. Routes - Parent view page, Admin management page
8. Navigation - Sidebar entries for parent and admin
9. Visibility - Add to admin display settings
