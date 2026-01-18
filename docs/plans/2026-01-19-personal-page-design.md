# Personal Page Design

## Overview

Add a new "Personal" (אישי) page for students featuring a shared intro section with rich text editing and a grade-targeted media gallery supporting images, videos, and YouTube embeds.

## Data Model

### Firestore Collections

```typescript
// Collection: settings/personalPageConfig (single document)
interface PersonalPageConfig {
  id: "config";
  introHtml: string;           // Lexical rich text output
  bannerUrl?: string;          // Optional header banner
  updatedAt: Date;
  updatedBy: string;           // Admin who last edited
}

// Collection: personalMedia
interface PersonalMedia {
  id: string;
  type: "image" | "video" | "youtube";
  url: string;                 // Storage URL or YouTube URL
  thumbnailUrl?: string;       // For videos: auto-generated or YouTube thumb
  title: string;
  description?: string;
  grades: Grade[] | "all";     // ["א", "ב"] or "all" (default)
  createdAt: Date;
  createdBy: string;
  order: number;               // For manual sorting in masonry
}
```

### Storage Paths

- Banner: `personal/banner/{timestamp}-{filename}.webp`
- Images: `personal/media/{timestamp}-{filename}.webp`
- Videos: `personal/media/{timestamp}-{filename}.mp4`

## Routes & File Structure

### New Routes

```
/admin/personal          → Admin management page
/[role]/personal         → Student/Admin view page
```

### New Files

```
src/app/(dashboard)/admin/personal/page.tsx       # Admin management
src/app/(dashboard)/[role]/personal/page.tsx      # Student view

src/components/personal/
  PersonalIntroEditor.tsx     # Lexical editor + banner upload (reusable)
  PersonalMediaGallery.tsx    # Masonry grid display
  PersonalMediaUploader.tsx   # Image/video upload with ffmpeg
  PersonalMediaCard.tsx       # Single media item in grid
  VideoPlayerModal.tsx        # Modal for video playback
  YouTubeEmbed.tsx            # YouTube iframe wrapper

src/lib/services/personal.ts           # Firestore operations
src/lib/queries/personal.ts            # React Query hooks
src/lib/utils/videoCompression.ts      # ffmpeg.wasm wrapper
```

## Video Compression

### Client-side Processing with ffmpeg.wasm

1. Load ffmpeg.wasm (lazy-loaded, ~25MB one-time download)
2. User selects video file
3. Show compression progress UI with percentage
4. Process with ffmpeg:
   - Scale to max 720p (preserve aspect ratio)
   - Encode H.264 (libx264) with CRF 28
   - Output MP4 container
   - Max 3 minutes (reject if longer)
5. Return compressed Blob for upload

### Constraints

- Max duration: 3 minutes
- Max resolution: 720p
- Format: MP4/H.264
- Client-side compression handles Netlify timeout (10s)

### Error Handling

- ffmpeg fails to load: Suggest YouTube link instead
- Video too long: "הסרטון ארוך מדי (מקסימום 3 דקות)"
- Compression fails: Offer retry or YouTube alternative

## Admin Interface

### `/admin/personal` Layout

```
┌─────────────────────────────────────────────────┐
│  אישי - ניהול                                   │
├─────────────────────────────────────────────────┤
│  ┌─── הקדמה ───────────────────────────────┐   │
│  │ [באנר: העלה תמונה / הסר]               │   │
│  │ ┌─────────────────────────────────────┐ │   │
│  │ │  Lexical Rich Text Editor          │ │   │
│  │ │  [B] [I] [U] [Link] [List]         │ │   │
│  │ └─────────────────────────────────────┘ │   │
│  │                           [שמור הקדמה] │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌─── גלריית מדיה ─────────────────────────┐   │
│  │ [+ הוסף תמונה] [+ הוסף סרטון] [+ YouTube] │  │
│  │  ┌────┐ ┌────┐ ┌────┐ ┌────┐           │   │
│  │  │ 📷 │ │ 🎬 │ │ ▶️  │ │ 📷 │ (draggable)│  │
│  │  └────┘ └────┘ └────┘ └────┘           │   │
│  └─────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

### Media Metadata

- Title (required)
- Description (optional)
- Grade selector: Checkboxes for א-ו + "כל הכיתות" toggle
- Upload date (auto)
- Drag handle for reordering

## Student View

### `/[role]/personal` Layout

```
┌─────────────────────────────────────────────────┐
│  אישי                                           │
├─────────────────────────────────────────────────┤
│  [Banner Image - full width]                    │
│                                                 │
│  Rich text intro rendered as HTML               │
│                                                 │
│  ┌─── Masonry Gallery ─────────────────────┐   │
│  │  ┌──────┐ ┌────┐ ┌───────┐              │   │
│  │  │ img  │ │vid │ │  img  │              │   │
│  │  └──────┘ └────┘ └───────┘              │   │
│  │  ┌────┐ ┌───────────┐ ┌────┐           │   │
│  │  │ yt │ │    img    │ │vid │           │   │
│  │  └────┘ └───────────┘ └────┘           │   │
│  └─────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

### Behavior

- Media filtered by student's grade (+ items marked "all")
- Click image → Opens ImageCarousel modal (existing component)
- Click video/YouTube → Opens VideoPlayerModal
- Videos show play button overlay on thumbnail
- Titles shown below each media item
- Empty state if no media for student's grade

### Responsive Grid

- Desktop: 3-4 columns masonry
- Tablet: 2-3 columns
- Mobile: 1-2 columns

## Reusable Intro Editor Component

### PersonalIntroEditor Props

```typescript
interface IntroEditorProps {
  initialHtml: string;
  bannerUrl?: string;
  onSave: (data: { html: string; bannerUrl?: string }) => Promise<void>;
  storagePath: string;  // e.g., "personal/banner" or "intros/dashboard/admin"
}
```

### Lexical Toolbar Features

- Bold, Italic, Underline
- Links (with URL input)
- Bullet list, Numbered list
- Headings (H2, H3)
- Text alignment (right default for RTL)

### Integration Points

| Page | Storage Path | Notes |
|------|--------------|-------|
| Personal | `intros/personal/` | New page |
| Dashboard | `intros/dashboard/{role}/` | Upgrade existing textarea |
| Pedagogical | `intros/pedagogical/{grade}/` | Upgrade existing textarea |

### Backwards Compatibility

Existing pages store intro as plain text. New schema:

```typescript
// Dashboard config extension
interface DashboardConfig {
  intro: string;        // Keep for backwards compat
  introHtml?: string;   // New: rich text
  bannerUrl?: string;   // New: optional banner
  cards: DashboardCardConfig[];
}

// Pedagogical intro extension
interface PedagogicalIntro {
  text: string;         // Keep for backwards compat
  introHtml?: string;   // New: rich text
  bannerUrl?: string;   // New: optional banner
}
```

If `introHtml` exists, render that. Otherwise fall back to plain `text`/`intro`.

## Integration Points

### Sidebar Updates

```typescript
// Admin nav items
{ label: "אישי", href: "/admin/personal", icon: User }

// Student nav items (controlled by visibility)
{ label: "אישי", href: "/student/personal", icon: User, visibilityKey: "personal" }
```

### Admin Display Page

Add "אישי" toggle in student features section for enabling/disabling visibility.

### Dependencies

```json
{
  "lexical": "^0.17.0",
  "@lexical/react": "^0.17.0",
  "@ffmpeg/ffmpeg": "^0.12.0",
  "@ffmpeg/util": "^0.12.0",
  "react-masonry-css": "^1.0.16"
}
```

### React Query Keys

```typescript
personal: {
  config: () => ["personal", "config"],
  media: (grade?: Grade) => ["personal", "media", grade],
  allMedia: () => ["personal", "media", "all"]
}
```

## Implementation Order

1. Add dependencies
2. Create data types and Firestore services
3. Create React Query hooks
4. Build video compression utility
5. Build reusable PersonalIntroEditor component
6. Build media gallery components (uploader, card, masonry grid)
7. Build video/YouTube modal players
8. Create admin management page
9. Create student view page
10. Update sidebar navigation
11. Update admin display page with visibility toggle
12. Upgrade Dashboard intro to use new editor
13. Upgrade Pedagogical intro to use new editor
