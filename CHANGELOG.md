# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.9.17] - 2026-01-20

### Changed

- **Parent content event images**: Images now display fully with `object-contain` instead of being cropped; clicking an image expands it to fill the entire card with a dark overlay. Includes hover effect on thumbnail, Escape key to close, and proper ARIA attributes for accessibility

## [0.9.16] - 2026-01-20

### Added

- **Edit questionnaire name**: Admin can now edit questionnaire names inline in the questionnaire edit page using a pencil icon
- **Copy questionnaire to other grades**: New "העתק לכיתות" button in questionnaire edit page opens a modal to copy the questionnaire (with all questions) to other grades as independent copies
- **Question form modal**: Add/edit question form now opens in a wide modal dialog instead of inline, providing better UX
- **"Other" option for choice questions**: Single and multiple choice questions can now include an "אחר" (Other) option that allows free-text input
  - Checkbox in question form: "אפשר תשובה אחרת"
  - Student UI shows text input when "Other" is selected
  - Answers stored with "אחר: " prefix for identification

### Changed

- **Admin Settings save buttons**: Disabled save buttons in Email Settings and Report Settings when no changes have been made

## [0.9.15] - 2026-01-19

### Added

- **Daily Summary Report Generation**: Added button to Admin Settings → Report Settings to batch generate AI reports for all research journals submitted today
  - Shows count of today's journals grouped by grade
  - Generates one daily summary report per grade using Gemini AI
  - Progress indicator with completed/skipped grades
  - Skips grades that already have a report for today
  - New service functions: `getTodaysJournals`, `generateDailyReport`, `checkDailyReportExists`
  - New query hook: `useTodaysJournals`
- **Scheduled Daily Report Generation**: Added Netlify scheduled function (`generate-daily-reports.ts`) that automatically generates AI reports every day at 23:00 Israel time
  - Fetches all research journals submitted that day
  - Groups journals by grade and generates one report per grade
  - Skips grades that already have a report for the day
  - Uses Gemini 1.5 Flash for AI analysis
  - Logs summary of generated, skipped, and errored reports

### Changed

- **Email sender domain**: Updated equipment request emails to send from `noreply@floatjet.com` (verified domain)
- **Report generation architecture**: Refactored `generate-report.ts` to export reusable `generateReportContent` function used by both on-demand and scheduled report generation

## [0.9.14] - 2026-01-19

### Added

- **Upload progress animation**: All image and video upload locations now show a spinner overlay with progress bar during upload
  - Created reusable `UploadOverlay` component with spinner, progress bar, and accessibility attributes (role="status", aria-live)
  - Added `uploadImageWithProgress` and `uploadResourceFileWithProgress` utilities using Firebase's `uploadBytesResumable` for real progress tracking
  - Applied to: staff modal, experts modal, event form, documentation page, pedagogical page resource uploads, and personal media uploader
  - Video uploads now also show real upload progress (in addition to existing compression progress)
  - Resource modal in pedagogical page prevents closing during active upload
- **Pedagogical Model resource button**: Added "מודל פדגוגי" button to pedagogical page that allows admin to upload an image/file (same functionality as "מערכת שעות")
  - New `pedagogical-model` resource type
  - Uses Image icon to indicate visual content
- **Pedagogical page button visibility controls**: Admin can now control visibility of all 4 buttons (תוכניות לימודים, מודל פדגוגי, לוז הדרכה, מערכת שעות) per role in admin/display page elements section
  - Added `pedagogicalModel`, `trainingSchedule`, `timetable` to `PageElementsConfig`
  - Grid layout dynamically adjusts based on number of visible buttons
- **Partners page** (`/[role]/partners`): Static page for parent role with STEM partnership info
  - Intro section with placeholder text
  - "קול קורא" button opens full-screen modal displaying `/voice.png` image
  - "הירשמו כאן" button links to Google registration form
  - Responsive layout with centered action buttons
- **Parent Content Admin ("תוכן הורים")**: Complete feature for managing parent-facing pages
  - Admin management page (`/admin/parent-content`) with tabbed interface for "פעילויות קהילתיות" and "STEM במשפחה"
  - Intro text editing per page (500 char limit)
  - Events management with drag-and-drop reordering
  - Event form modal with title, description, date, image upload, and URL fields
  - Timeline display on parent-facing pages (`/parent/community-activities`, `/parent/stem-family`)
  - Firestore service and React Query hooks for data management
  - "תוכן הורים" sidebar link for admin
  - Firebase Storage rules for `parent-content/` path (5MB image limit)

### Fixed

- **Page elements visibility not showing new fields**: Fixed PageElementsSection to derive available elements from labels instead of stored config, ensuring newly added visibility options appear in admin panel
- **Personal media upload error**: Fixed Firebase error when uploading images/videos without description. The `createPersonalMedia` and `updatePersonalMedia` functions now filter out `undefined` values before writing to Firestore, which doesn't accept them.
- **Storage delete permissions**: Added `delete` permission to Firebase Storage rules for paths that support deletion: `documentation/`, `staff/`, `resources/`, `personal/media/`, and `parent-content/`. Firebase treats delete operations separately from write operations.

### Removed

- **unitDetails visibility option**: Removed "פרטי יחידה" from pedagogical page visibility settings - unit details are now always shown in the תוכניות לימודים modal

### Changed

- **Pedagogical page button label**: Changed "מודל פדגוגי" to "תוכניות לימודים" in the action buttons section
- **Collapsible Forum Posts**: Posts now show collapsed by default with title, author, date, and comment count. Click to expand and see full content, replies, and reply form. Chevron indicator shows expand/collapse state.
  - Added keyboard navigation support (Enter/Space to toggle)
  - Added ARIA attributes for screen readers (role, aria-expanded, aria-controls)
  - Prevents accidental collapse when reply form has content
  - Uses theme utilities (rounded-theme, duration-theme) for consistency

## [0.9.13] - 2026-01-19

### Added

- **Student Forum**: New forum for students to share research observations and data collection
  - Separate Firestore collection `student-forum` (distinct from teacher `forum`)
  - New service `src/lib/services/studentForum.ts` with full CRUD operations
  - New React Query hooks in `src/lib/queries/studentForum.ts`
  - Students access via `/student/forum` with student-themed UI

- **Student Journal Landing Page**: `/student/journal` now shows two card buttons:
  - "תיעוד איסוף הנתונים" - navigates to student forum (`/student/forum`)
  - "רפלקציה אישית" - navigates to questionnaire wizard (`/student/journal/questionnaire`)

- **Questionnaire Page**: Moved questionnaire wizard to `/student/journal/questionnaire`
  - Same functionality as before, relocated from `/student/journal`
  - Header updated to "רפלקציה אישית"
  - Added "חזרה לדף הראשי" button after submission

### Changed

- **Admin Forum Page**: Now shows tabbed interface for managing both forums
  - "מורים" tab - teacher forum (existing)
  - "תלמידים" tab - student forum (new)
  - Admin can post, edit, delete, and pin posts in both forums

- **Sidebar Navigation**:
  - Admin forum link renamed from "במה אישית - מורים" to "פורומים"
  - Teacher forum link shows "במה אישית" (unchanged functionality)

- **Forum Components**: `NewPostForm` and `PostCard` now accept `forumType` prop to support both teacher and student forums

- **Forum Page Role Checking**: Now uses session role consistently instead of URL params for security

### Fixed

- **Student Forum Error Handling**: Added missing error re-throw in `addStudentReply` and `deleteStudentPost` functions so mutations properly report failures

- **Forum Page Redundant Refetch**: Removed redundant `loadPosts()` calls after mutations since React Query invalidation handles refetching automatically

- **Forum Type Duplication**: Extracted `ForumType` to shared types file (`src/types/index.ts`) instead of duplicating in 3 files

- **Session Null Safety**: Added early return in forum page when session is null to prevent potential runtime errors

## [0.9.12] - 2026-01-19

### Changed

- **Questionnaires now belong to grades only** (not units): Simplified questionnaire model
  - Removed `unitId` from `Questionnaire` type - questionnaires are now tied only to a grade
  - Removed `unitId` from `ResearchJournal` type - journal submissions link to questionnaire via `questionnaireId`
  - One active questionnaire per grade (instead of per grade+unit)
  - Students can submit multiple journal entries (no unit selection needed)

- **Simplified student journal flow**: Students click "יומן חוקר" and fill the active questionnaire for their grade directly (no unit selection step)

- **Responses page redesign**: `/responses/[grade]` now shows all journal submissions with questionnaire dropdown filter (removed unit-based navigation)

- **Admin questionnaire pages simplified**: Removed unit selection from questionnaire creation and unit display from questionnaire editing

### Added

- `getJournalsByGrade(gradeId)` service function for fetching all journals by grade
- `getJournalsByQuestionnaire(questionnaireId)` service function for filtering journals by questionnaire
- `useJournalsByGrade` and `useJournalsByQuestionnaire` React Query hooks
- Migration script `scripts/migrate-questionnaires-remove-unitId.ts` for cleaning up existing Firestore data

### Removed

- `/[role]/journal/[unitId]` page (unit selection) - merged into `/[role]/journal`
- `/[role]/responses/[grade]/[unitId]` page - merged into `/[role]/responses/[grade]`
- `getJournalsByUnit` service function and `useJournalsByUnit` hook
- Unit column from questionnaire list and edit pages

## [0.9.1] - 2026-01-19

### Added

- **Personal Page types**: Added TypeScript types for Personal Page feature
  - `PersonalPageConfig` - Config for intro text and banner
  - `PersonalMedia` - Media items (image/video/youtube) with grade targeting
  - `PersonalMediaType` - Union type for media types
- **Personal Page React Query keys**: Added query keys for `personal.config`, `personal.media`, `personal.allMedia`
- **Personal Page dependencies**: Added ffmpeg.wasm (video compression), react-masonry-css (gallery layout)
- **Personal Page Firestore services** (`src/lib/services/personal.ts`): CRUD operations for config and media
- **Personal Page React Query hooks** (`src/lib/queries/personal.ts`): Caching hooks for all service operations
- **Video compression utility** (`src/lib/utils/videoCompression.ts`): Client-side video processing with ffmpeg.wasm
  - Lazy-loaded FFmpeg with singleton pattern (~25MB one-time download)
  - Compresses videos to 720p MP4/H.264 with CRF 28
  - Max 3-minute duration validation
  - Progress callbacks for UI feedback (loading, analyzing, compressing, finalizing)
  - Thumbnail generation from video frames
  - Browser support detection (SharedArrayBuffer + WebAssembly)
  - Utility functions: `formatFileSize`, `formatDuration`
- **Personal Page media gallery components**:
  - `PersonalMediaGallery.tsx`: Masonry layout with drag-and-drop reordering (admin)
  - `PersonalMediaCard.tsx`: Media item card with thumbnail, play overlay for videos, admin actions
  - `PersonalMediaUploader.tsx`: Multi-mode uploader for images, videos, and YouTube links with compression
  - `VideoPlayerModal.tsx`: Full-screen modal for video/YouTube playback
  - `YouTubeEmbed.tsx`: YouTube iframe wrapper with URL parsing and thumbnail extraction
- **Personal Page admin management** (`/admin/personal`): Full admin page for managing personal page content
  - Intro section with inline editable plain text (500 char limit)
  - Media gallery with add/edit/delete functionality
  - Drag-and-drop reordering for media items
  - Role-based access control (admin-only)
  - Grade targeting for media (single/multiple/all grades)
  - Error handling with Hebrew toast messages
- **Personal Page student view** (`/[role]/personal`): Student-facing page displaying personal content
  - Displays intro text from config
  - Shows media gallery filtered by student's grade (admins see all media)
  - View-only mode - no edit/delete/reorder capabilities
  - Proper role validation with redirect if URL role doesn't match session
- **Personal Page sidebar integration**: Added "אישי" to sidebar for admin and student roles
  - Student sidebar link with visibility configuration support
  - Admin sidebar link (navigates to admin management page)
  - Dashboard card for student role with Heart icon
- **Firebase Storage rules for Personal page**: Added rules for `personal/media/` (50MB for videos)
- **Heart icon**: Added `heart` to Icon component presets for Personal page empty state

- **Globe Monitor submission feature**: Users with `canSubmitGlobeMonitor` flag can now submit monitoring data
  - New `SubmissionFormModal` component with dynamic form based on admin-configured questions
  - Submission button appears below globe logo, above calendar for authorized users
  - Daily limit of 2 submissions per user (per calendar day)
  - Button shows submission count (X/2) and disables when limit reached
  - Admin password management page shows "מדווח גלוב" badge for users with flag
  - Seed script to create globe monitor user: `npx tsx scripts/seed-globe-monitor-user.ts`
- **Reusable ImageCarousel component** (`src/components/ui/ImageCarousel.tsx`): Shared carousel component with sliding effect, loading states, and responsive design
- **ImageCarousel initialIndex prop**: Added `initialIndex` prop to start carousel at a specific image position
- **xs breakpoint in Tailwind config**: Added 480px breakpoint for extra-small screens

### Changed

- **Complete React Query caching coverage**: All Firebase data fetching now uses React Query hooks
  - Gallery pages (`/gallery/[grade]`, `/gallery/[grade]/[unitId]`) now use cached queries instead of direct service calls
  - Gallery error retry buttons now use React Query `refetch()` instead of page reload
  - `UnitTree` component now uses `useUnitsByGrade` hook
  - New unit page now uses `useUnitsByGrade` for order calculation
  - `StaffGrid` derives next order from cached data instead of calling `getNextStaffOrder()`

### Removed

- **Dead code cleanup**: Removed unused `src/lib/services/questions.ts` - questions are handled through questionnaires service which has proper caching

### Fixed

- **Personal Page cleanup fixes**:
  - Fixed Firebase Storage deletion to extract storage path from download URLs
  - Added role validation to block unauthorized roles (parent/teacher) from accessing /personal
  - Fixed VideoPlayerModal event listener memory leak using ref pattern
  - Added cleanup for file preview URLs on component unmount and early return

- **Documentation modal slow image switching**: Replaced single-image display with sliding carousel
  - All images rendered in a horizontal track for instant switching
  - Smooth 300ms slide animation when navigating between images
  - Each image shows its own loading spinner until loaded
  - Images stay in browser cache after first load

- **DocumentationCard missing loading state**: Thumbnail images now show loading spinner until loaded
  - Added loading spinner overlay while image loads
  - Image fades in smoothly once loaded
  - Error state shows placeholder icon if image fails to load

- **Public gallery lightbox missing carousel**: Gallery page (`/gallery/[grade]/[unitId]`) now has proper image carousel
  - Added sliding carousel with 300ms transition animation
  - Added loading spinners for each image
  - Added dot indicators and counter badge
  - Responsive design with smaller padding on mobile

- **Public gallery thumbnails missing loading state**: Grid thumbnails now show loading spinners
  - Extracted ThumbnailCard component with loading/error states
  - Image fades in smoothly once loaded
  - Error state shows camera icon placeholder

- **ExpertCard missing loading state**: Expert profile images now show loading spinner
  - Spinner displays in role-themed color while image loads
  - Image fades in smoothly once loaded
  - Fallback to initials if image fails to load

- **ExpertDetailsModal missing loading state**: Large expert image in modal now shows loading spinner
  - Larger spinner (40px) appropriate for the 300px image
  - Smooth fade-in transition when image loads

- **StaffMemberCard missing loading state**: Staff member images now show loading spinner
  - Gradient background with spinner while loading
  - Image fades in and supports hover scale effect
  - Fallback to initials if image fails

- **Pedagogical page images missing loading state**: Resource images and lightbox now show loading spinners
  - Resource modal images show spinner until loaded
  - Fullscreen lightbox shows spinner during load
  - Smooth fade-in transitions

### Changed

- **Documentation modal responsive design**: Modal now works properly on mobile devices
  - Content section scrollable instead of fixed height (text now visible on mobile)
  - Reduced padding and adjusted spacing for smaller screens
  - Image aspect ratio adjusts based on screen size (4:3 on mobile, 16:9 on tablet, 16:10 on desktop)
  - Meta info wraps properly on narrow screens

## [0.8.1] - 2026-01-18

### Added

- **Expert drag and drop reordering**: Admin can reorder experts via drag and drop in the experts page
  - Drag handle appears on hover for each expert card
  - Uses @dnd-kit library for smooth drag interactions
  - Dedicated `reorderExperts` service function reads fresh data before saving to prevent race conditions
  - Correctly handles filtered views (only reorders visible experts)
  - Visual feedback during drag (opacity, scale, ring)

## [0.8.0] - 2026-01-18

### Added

- **Forum link previews**: URLs in posts now show rich preview cards with Open Graph metadata
  - Displays title, description, and image from linked pages
  - Netlify function fetches metadata server-side (CORS-safe)
  - In-memory caching prevents duplicate requests
  - Maximum 3 previews per post
  - Graceful fallback for sites without metadata

### Fixed

- **Forum newlines not preserved**: Post and reply content now preserves line breaks using `whitespace-pre-wrap`
- **Link preview SSRF vulnerability**: Netlify function now blocks requests to localhost, private IPs, and cloud metadata endpoints
- **Link preview ReDoS vulnerability**: HTML content limited to 100KB before regex processing
- **Link preview unbounded cache**: Added LRU-style cache with 100 entry limit to prevent memory growth
- **Link preview response validation**: Added runtime validation of API responses for type safety

### Changed

- **Link preview theming**: Applied role-based theming utilities (`rounded-theme`, `duration-theme`) to LinkPreview component

## [0.7.0] - 2026-01-18

### Added

- **Forum post pinning**: Admin can pin a single post to always appear at the top
  - Pin/unpin button in post header (admin only)
  - Pinned post displays with visual indicator (ring border + "פוסט מוצמד" badge)
  - Only one post can be pinned at a time (pinning a new post unpins the previous one)
- **Forum post editing**: Admin can edit any post's title and content
  - Edit button in post header (admin only)
  - Inline editing with title input and content textarea
  - Save/cancel buttons with validation (both fields required)
- **Forum pagination**: Posts now display 10 per page with pagination controls
  - Previous/next buttons with page indicator
  - Pinned post always appears on first page at the top
- **Forum clickable links**: URLs in posts and replies are now clickable
  - Auto-detects plain URLs and makes them clickable
  - Supports markdown-style links: `[title](url)` for custom link text
  - Helper hint in post form showing link syntax

- **Expert scheduling system**: Complete booking system for 10-minute expert consultations
  - **Calendar view**: Monthly calendar below experts grid showing expert availability
    - Hebrew month/day names with RTL layout
    - Day cells show expert names with color-coded availability indicators (green=3+ slots, amber=1-2 slots, red=full)
    - Clicking a day opens modal with available experts
  - **Booking flow**: Select day → choose expert → pick time slot → enter details → confirm
    - Participants field for listing meeting attendees
    - Topic field for meeting subject
    - 10-minute slots generated from expert time ranges
    - Users can cancel own bookings within 5 minutes of creation (same session only)
    - Admins can delete any booking
  - **Admin availability management**: New "זמינות" section in AddEditExpertModal
    - Multi-month calendar picker for selecting dates
    - Time range inputs for each selected date
    - Validates time ranges (end > start, minimum 10 minutes)
  - **Admin meetings page**: New page at `/[role]/expert-meetings` with sidebar link
    - Tabs for upcoming and past meetings
    - Search by user name or topic, filter by grade
    - Table with booking details and delete action
  - **Expert card badges** (admin only): Shows availability status
    - Red "לא זמין" badge if no future dates
    - Amber "לא זמין החודש" badge if no current month dates
  - **New types**: `TimeRange`, `ExpertAvailability`, `ExpertBooking`
  - **New service**: `src/lib/services/bookings.ts` with React Query hooks
  - **New utilities**: `src/lib/utils/slots.ts` (slot generation), `src/lib/utils/sessionToken.ts` (cancel window)
  - **Firestore indexes**: Added composite indexes for `expert-bookings` collection

### Changed

- **Expert availability field**: Changed `Expert.availability` from `string` to `ExpertAvailability[]` for structured scheduling data

### Fixed

- **Forum pin race condition**: Used Firestore batch write to atomically unpin old post and pin new post, preventing multiple pinned posts in concurrent admin scenarios
- **Forum pagination edge case**: Added useEffect to clamp currentPage when posts are deleted, preventing empty page display
- **Forum URL trailing punctuation**: LinkifiedText now strips trailing punctuation (periods, commas, etc.) from auto-detected URLs
- **Forum edit mode state sync**: Edit fields now sync with post data when changed externally (e.g., another admin edited the same post)
- **Forum accessibility**: Added aria-labels to all action buttons in PostCard for screen reader support
- **Expert booking race condition**: Added server-side slot availability check before creating bookings to prevent double-booking
- **Expert meetings page access control**: Added admin role check to prevent non-admin users from accessing the meetings page via direct URL
- **Expert name display in meetings table**: Admin meetings page now shows expert names instead of IDs
- **Time range validation**: TimeRangeInput now validates that end time is after start time, with visual feedback and auto-adjustment
- **Calendar availability accuracy**: Calendar now fetches all bookings for the month to show accurate availability indicators
- **Cancel button auto-refresh**: TimeSlotsModal now auto-refreshes cancel button eligibility every 30 seconds
- **Tailwind config TypeScript error**: Extended Config type with `{ safelist?: string[] }` to allow safelist property in Tailwind v4
- **Expert cards/modal not using role-based theming**: Updated ExpertCard and ExpertDetailsModal components to use `useRoleStyles()` hook and theme utilities (`rounded-theme`, `duration-theme`, `ease-theme`) instead of hardcoded `primary/secondary/accent` colors
- **Staff image upload 403 error**: Added missing `staff/` path to Firebase Storage security rules to allow image uploads for צוות מו"פ
- **Resource file upload 403 error**: Added missing `resources/` path to Firebase Storage security rules to allow uploads for לוז הדרכה and מערכת שעות
- **Expert image upload 403 error**: Added missing `experts/` path to Firebase Storage security rules to allow image uploads for "שאל את המומחה" feature
- **Expert details modal centering**: Fixed modal not being centered on screen
- **Expert details modal image size**: Increased expert profile image from 96px to 300px for better visibility
- **Expert details modal availability display**: Fixed crash when rendering availability (changed from string to array format) - now shows count of available days
- **Expert image upload optimization**: Expert images now resized to 400px (instead of 800px) since they display at 300px max, reducing file size
- **Duplicate mx-auto class**: Removed duplicate `mx-auto` CSS class from 14 page components

### Added

- **Staff drag and drop reordering**: Admins can now reorder staff members by dragging the grip handle on hover; order persists to Firestore using batch writes

### Changed

- **Staff member cards redesign**: New image-focused card design (4:5 aspect ratio) with name overlay at bottom; hover/click reveals description with smooth sliding animation, glass backdrop effect, and shine animation on hover
  - Admins can now preview expanded card state on hover
  - Increased description max-height and added scroll for long text
  - Removed duplicate "צוות מו״פ" header from StaffGrid (page has its own)
  - Added drag handle (grip icon) for reordering in admin mode
- **Pedagogical page layout**: Moved "צוות מו"פ" (Staff Team) from a button to a full section below the intro; remaining buttons now display in responsive row
  - Mobile: stacked (1 column), Desktop: side-by-side (2-3 columns based on visibility)
  - Grid dynamically adjusts columns when "מודל פדגוגי" button is hidden
- **Pedagogical description limit**: Increased character limit from 300 to 500 for unit descriptions
- **Pedagogical section - global resources**: Staff Team (צוות מו"פ), Training Schedule (לוז הדרכה), and Timetable (מערכת שעות) are now global instead of per-grade
  - Staff members are shared across all grades
  - Resource files (training schedule, timetable) are shared across all grades
  - Removed grade from modal titles for these items
  - Updated Firestore document paths: `resource-{type}` instead of `resource-{type}-{grade}`
  - Updated storage paths: `resources/{type}/` and `staff/` instead of `resources/{grade}/{type}/` and `staff/{grade}/`

### Fixed

- **Globe Monitor typo**: Fixed "גלוב-ניטורר" to "גלוב-ניטור" (removed duplicate ר) in sidebar, dashboard cards, and page headers
- **Sidebar scrolling**: Changed sidebar from `min-h-screen` to `h-screen` so navigation content is scrollable when it exceeds viewport height

### Added

- **Equipment form "Other" field**: Added optional free-text field (אחר) to equipment request form with 500 character limit
- **Documentation lightbox modal**: Click on documentation cards to view full content in a modal
  - Image gallery with navigation arrows for multiple images
  - Dot indicators for image position
  - Keyboard navigation (arrow keys for images, Escape to close)
  - Click outside modal to close
  - Full text display (no truncation)
  - Respects visibility settings per role
- **Role-themed custom scrollbars**: Added custom scrollbar styling that matches the role-based theme system
  - Thin, rounded scrollbars with transparent track by default
  - Admin theme: indigo scrollbars (#6366F1)
  - Teacher theme: blue scrollbars (#0284C7)
  - Parent theme: amber scrollbars (#F59E0B)
  - Student theme: emerald scrollbars (#10B981)
  - Hover states with increased opacity
  - Cross-browser support (WebKit and Firefox scrollbar-color)
- **Globe Monitor visibility defaults**: Added globe-monitor to visibility configuration for admin control
  - Added to `ALL_DASHBOARD_CARDS` with label "גלוב-ניטורר" and description "צפייה בנתוני ניטור סביבתי"
  - Added to `ALL_SIDEBAR_LINKS` with href "/globe-monitor"
  - Added to `DEFAULT_STUDENT_DASHBOARD` cards (visible by default, order 4)
  - Added to `DEFAULT_STUDENT_SIDEBAR` links (visible by default)
- **Globe Monitor sidebar navigation**: Added "גלוב-ניטורר" link to sidebar for admin and student roles with Globe icon
- **Globe Monitor question form component**: Shared form component for creating and editing questions
  - Question type selector with visual icons (text, number, date, time, single, multi)
  - Dynamic fields based on type (unit/min/max for numbers, options for choices)
  - Validation requiring at least 2 options for choice questions
  - Required field checkbox
- **Globe Monitor new question page**: Admin page at `/[role]/globe-monitor/questions/new` for creating questions
- **Globe Monitor edit question page**: Admin page at `/[role]/globe-monitor/questions/[id]` for editing questions
- **Globe Monitor student calendar view**: Calendar component for students to view submission data
  - Monthly calendar grid with Hebrew day/month names
  - Navigation arrows for prev/next month
  - Dates with submissions highlighted with green indicator
  - Click date to show submission cards with summary (time, temp, humidity, clouds)
  - Click card to see full details in modal with all question answers
- **Globe Monitor types**: Added TypeScript types for the Globe Monitor feature (`src/types/globeMonitor.ts`)
  - `GlobeMonitorQuestionType` - Type union for question types (text, number, date, time, single, multi)
  - `GlobeMonitorQuestion` - Question definition interface with label, type, options, unit, min/max, required, order
  - `GlobeMonitorSubmission` - Submission interface with answers, submitter info, and date for calendar grouping
  - `DEFAULT_GLOBE_MONITOR_QUESTIONS` - Default questions configuration for weather observation (date, time, temperature, humidity, cloud types, coverage, precipitation, ground condition)
- **React Query caching documentation**: Added comprehensive docs at `docs/react-query-caching.md` covering configuration, refresh behavior, cache invalidation, and how to extend for new features
- **Sidenav structure documentation**: Added `docs/sidenav-structure.md` documenting all sidebar navigation links per role, admin display settings capabilities, and grade-aware sections

## [0.5.0] - 2026-01-18

### Added

- **React Query caching layer**: Added TanStack React Query (@tanstack/react-query) for global data caching
  - New `QueryProvider` wrapping the app in `layout.tsx`
  - Query hooks at `src/lib/queries/` for all Firebase services
  - Centralized query keys for cache invalidation
  - Default 5-minute stale time, 30-minute garbage collection
  - `useRefreshAll` hook for manual refresh functionality

### Changed

- **All dashboard pages migrated to React Query**: Replaced useState/useEffect data fetching patterns with React Query hooks across ~30 pages and components. Benefits include:
  - **70-80% fewer skeleton appearances** during navigation - cached data renders instantly
  - **Automatic background refresh** keeps data fresh without blocking UI
  - **Smart cache invalidation** after mutations - related queries update automatically
  - **Reduced Firebase reads** and lower costs

  **Migrated pages:** Documentation, Reports, Responses, Journal, Questions, Forum, Passwords, Settings, Display, Pedagogical, Teaching Resources (curricula)

  **Migrated components:** DocumentationGallery, UnitTreeView, StaffGrid, ExpertsSection, StemLinksModal

  **VisibilityContext:** Now uses `useVisibilityConfig` hook internally for caching

### Added

- **"שאל את המומחה" standalone page**: Moved experts section from teaching-resources to its own page
  - New page at `/[role]/experts/[grade]` accessible to all roles (including admin)
  - Configurable visibility per role via admin display settings sidebar
  - Added role-based expert visibility: admin can set which roles (teacher/parent/student) see each expert
  - Added grade-based expert visibility: experts can be global or grade-specific
  - Removed from teaching-resources page elements
  - Wider modal on tablet/desktop for better UX
- **Parent sidebar links**: Added 3 new placeholder links for parent role (configurable via admin visibility settings)
  - פעילויות קהילתיות (Community Activities)
  - STEM במשפחה (STEM in Family)
  - שותפים לדרך (Partners)
- **Display Settings Admin Page** (`/admin/display`): New admin page for visibility control
  - Role tabs to switch between teacher/parent/student configuration
  - Dashboard section with intro text editor and drag-and-drop card reordering
  - Sidebar section with visibility toggles and editable link names
  - Page elements section with checkboxes for granular element visibility
  - Real-time preview of changes with save button
  - Added "תצוגה" link to admin sidebar with Eye icon
- **Drag-and-Drop Components**: New display components for admin configuration
  - `RoleTabs` - Role selector for switching between configurable roles
  - `DraggableCardList` - Drag-and-drop list using @dnd-kit for card reordering
  - `DashboardSection` - Dashboard intro and cards configuration
  - `SidebarSection` - Sidebar links visibility and label editing
  - `PageElementsSection` - Page element toggles grouped by page
- **Collapsible sections in Display page**: Each configuration section (dashboard, sidebar, page elements) is now collapsible
  - Click header to expand/collapse
  - State persisted in localStorage
  - Smooth animation on toggle
- **Cancel changes button**: Added "בטל" button to discard unsaved changes and restore last saved config
- **Visibility-aware consumer components**:
  - Sidebar now filters links based on visibility config for non-admin roles
  - Sidebar supports custom link labels from visibility config
  - Dashboard cards are filtered, ordered, and shows intro text from config
  - Teaching Resources page hides sections based on visibility config
  - Documentation gallery respects visibility for images/text/teacherName
- **Visibility Context provider**: React context for visibility configuration (`src/contexts/VisibilityContext.tsx`)
  - `VisibilityProvider` - fetches config from Firestore on mount, merges with defaults
  - `useVisibility()` hook with helper functions: `getDashboardConfig`, `getSidebarConfig`, `getPageElements`, `canSee`
  - Handles loading and error states gracefully
- **Visibility Firestore service**: Service for fetching and saving visibility config to Firestore (`src/lib/services/visibility.ts`)
  - `getVisibilityConfig()` - fetches config from `settings/visibility`
  - `saveVisibilityConfig()` - saves config to Firestore
  - `mergeWithDefaults()` - merges saved config with defaults for forward compatibility
- **Visibility default constants**: Default configuration values for the visibility control system
  - `ALL_DASHBOARD_CARDS` - metadata for all possible dashboard cards
  - `ALL_SIDEBAR_LINKS` - metadata for all possible sidebar links
  - `PAGE_ELEMENT_LABELS` - Hebrew labels for page elements in admin UI
  - `DEFAULT_VISIBILITY_CONFIG` - complete default config mirroring current hardcoded behavior
- **Visibility config types**: TypeScript types for the visibility control system
  - `ConfigurableRole` type for teacher/parent/student roles
  - `VisibilityConfig` interface for the full configuration structure
  - `DashboardConfig` and `DashboardCardConfig` for dashboard visibility settings
  - `SidebarConfig` and `SidebarLinkConfig` for sidebar visibility settings
  - `PageElementsConfig` for granular page element visibility (teaching resources, reports, pedagogical, documentation)
- **Visibility control design document**: Design spec for admin תצוגה (Display) feature
  - Allows admins to control what each role (teacher/parent/student) sees
  - Dashboard: intro text, toggle/reorder cards
  - Sidebar: toggle visibility, edit link names
  - Page elements: granular show/hide for elements within pages (e.g., hide STEM links from parents)
  - Design doc at `docs/plans/2026-01-17-visibility-control-design.md`
  - Implementation plan at `docs/plans/2026-01-17-visibility-control-implementation.md`

### Fixed

- **Sidebar labels as single source of truth**: Renamed sidebar links now reflect in dashboard cards (labels sync between sections)
- **VisibilityContext performance**: Added useMemo to context value to prevent unnecessary re-renders
- **Visibility control cleanup**: Removed reports from PageElementsConfig since AI-generated content shouldn't have element-level visibility control
- **Pedagogical page visibility**: Now respects visibility config for unitCards (מודל פדגוגי button) and unitDetails (file indicators in tree view)
- **Pedagogical page crash for parent role**: Fixed `getPageElements` call to pass both role and page key (was missing "pedagogical" parameter)
- **New visibility items not appearing**: Fixed mergeWithDefaults to add new sidebar links and dashboard cards from defaults to existing saved configs
- **Dashboard and sidebar items now match**: All sidebar items are now also available as dashboard cards (experts, community-activities, stem-family, partners)
- **Page elements filtered by enabled pages**: Page elements section now only shows pages that are enabled in either sidebar OR dashboard
- **Dashboard limited to 4 items**: Default dashboard config now shows only 4 visible cards per role (admin can change)
- **Editable dashboard card descriptions**: Admin can now edit the description for each dashboard card (shown below each card in the config)
- **Sticky header on display settings page**: Header with save button and role tabs stays visible when scrolling
- **Dashboard card limit validation**: Admin can only select up to 4 dashboard cards per role, with counter and toast error message
- **Teaching resources button contrast**: Added drop shadows to text and icons on gradient buttons for better readability
- **Firebase service functions**: Added proper error re-throwing in staff.ts and settings.ts to ensure functions always return or throw
- **StaffGrid useEffect**: Fixed missing dependency by wrapping `loadStaff` in useCallback
- **AddEditStaffModal memory leak**: Replaced FileReader with URL.createObjectURL for image preview with proper cleanup
- **DocumentViewer retry**: Fixed to use React state (iframeKey) instead of DOM query for iframe reload
- **DocumentViewer timeout**: Added 15-second load timeout since Google Docs Viewer doesn't always trigger onerror
- **DocumentViewer z-index**: Fixed non-standard `z-5` class to `z-[5]`
- **Pedagogical page race condition**: Fixed upload/delete handlers to capture resource type at function start
- **Accessibility**: Added aria-labels to all modal close buttons
- **StaffMemberCard image reset**: Added useEffect to reset error state when imageUrl changes
- **Pedagogical intro flash**: Added skeleton loading state to prevent flash of stale content while fetching from Firebase

### Changed

- **Forum → במה אישית**: Simplified forum section
  - Renamed "פורום" to "במה אישית" in sidebar and dashboard
  - Removed room tabs (בקשות/התייעצויות) - now single unified forum
  - Deleted `/forum/[room]` route, forum content now directly at `/forum`
- **Sidebar label**: Renamed "מודל פדגוגי" to "מודל פדגוגי ומו"פ" (R&D)
- **Pedagogical page**: Updated page title to match new sidebar label
- **Work Plans → Teaching Resources**: Major refactoring:
  - Renamed "תוכניות עבודה" to "משאבי הוראה" in sidebar
  - Changed route from `/work-plans` to `/teaching-resources`
  - Created new landing page with 3 beautiful gradient buttons
  - Moved curricula/units to sub-route `/teaching-resources/[grade]/curricula/`
  - Updated all navigation links throughout the app

### Added

- **"שאל את המומחה" section**: New experts section on teaching-resources page
  - Displays below resource buttons with decorative section separator
  - Shows circular image, name, and title for each expert
  - Clicking expert opens details modal with full description and availability
  - Admin can add/edit/delete experts with image upload
  - Experts can be global (all grades) or specific to current grade
  - Experts stored in Firestore at `settings/experts`
- **Equipment request form**: Clicking "טופס הצטיידות" button opens a form modal
  - Form fields: teacher name, program/unit, classes, age group selection
  - Resource checkboxes for agricultural/gardening supplies
  - Sends email to admin emails configured in settings
  - Uses Resend API for immediate email delivery
- **STEM Links modal**: Clicking "קישורים STEM" button opens a modal with links
  - Links display description text, clicking opens URL in new tab
  - Admin can add/edit/delete links with inline editing
  - Links can be global (all grades) or specific to current grade via checkbox
  - Links stored in Firestore at `settings/stemLinks`
- **Pedagogical page intro section**: Editable intro text stored in Firebase per grade
  - Admins see pencil icon to edit inline
  - Text saved to `settings/pedagogicalIntro-{grade}` in Firestore
  - Default placeholder text shown if no custom text set
  - 300 character limit with live counter (turns amber near limit)
- **Pedagogical page action buttons**: Four buttons in 2x2 grid - מודל פדגוגי, צוות מו"פ, לוז הדרכה, מערכת שעות
  - מודל פדגוגי opens full-screen modal with unit tree view
  - Buttons display with icon above text, taller card style
  - Buttons show "קובץ קיים" indicator when file is uploaded
- **Resource file upload** for לוז הדרכה and מערכת שעות:
  - Admin can upload PDF, Word (.doc/.docx), or images
  - Images are automatically compressed before upload
  - Files stored in Firebase Storage at `resources/{grade}/{type}/`
  - Metadata stored in Firestore at `settings/resource-{type}-{grade}`
  - Images display full-size in modal, click to open lightbox
  - Admin can replace or delete existing files with floating buttons
  - Non-admin users can view uploaded files
- **DocumentViewer component** (`src/components/ui/DocumentViewer.tsx`):
  - Reusable embedded viewer for PDF and Word documents
  - Uses Google Docs Viewer for rendering
  - Download button fixed at top-left
  - Loading spinner and error state with retry option
  - Can be used anywhere documents need to be displayed
- **Unit detail page file viewer**: Updated מבוא ליחידה and תוכן היחידה cards
  - Files now open in modal with embedded viewer instead of new tab
  - Images display full-size with lightbox on click
  - Documents use DocumentViewer component
- **צוות מו"פ (R&D Staff)** feature:
  - Admin can add, edit, and delete staff members per grade
  - Each member has: circular profile image, name, description (200 char max)
  - Beautiful responsive grid: 2 cols mobile, 3 cols tablet, 4 cols desktop
  - Gradient ring effect and hover animations on profile cards
  - Images auto-compressed and stored in Firebase Storage
  - Staff data stored in Firestore `staff` collection
  - New components: `StaffGrid`, `StaffMemberCard`, `AddEditStaffModal`

- **Public gallery page**: New `/gallery` page for browsing documentation by grade level
  - Full-viewport grid layout with 6 grade boxes (א through ו)
  - Responsive: 2 columns × 3 rows on mobile/tablet, 3 columns × 2 rows on desktop
  - Cards max 400×300px, centered in viewport
  - Soft pastel gradients with glass effect, matching home page background
  - Header with warm gradient and back-to-home navigation
- **Grade unit browser**: `/gallery/[grade]` shows learning units for selected grade
  - Responsive card grid layout
  - Shows unit name and order number
  - Loading skeletons and error handling
- **Unit documentation gallery**: `/gallery/[grade]/[unitId]` documentation cards
  - Card grid showing documentation records (not individual images)
  - Each card: thumbnail, image count badge, text description, teacher name, date
  - Click card to open lightbox - navigate within that record's images
  - Full-screen lightbox with keyboard navigation (arrows, Escape)
  - RTL-aware navigation (right = previous, left = next)
  - Lazy loading thumbnails for performance
  - Loading skeletons and error handling

## [0.4.1] - 2026-01-15

### Changed

- **Version check on every route**: Version check now runs on every navigation, not just initial load

## [0.4.0] - 2026-01-15

### Added

- **Custom 404 page**: Friendly Hebrew "page not found" page with STEM theme, logo, and back-to-home button
- **Automatic version check**: App checks version on load and on every route change
  - Compares localStorage stored version with current package.json version
  - On version change: automatically clears service workers and caches, then reloads
  - Shows loading screen ("מעדכן גרסה חדשה...") during cache clearing
  - Checks on every navigation, so users get updates even while browsing

## [0.3.0] - 2026-01-15

### Added

- **Home page landing**: New landing page replaces automatic redirect to login
  - STEM-themed background illustration (`/bg/bg-home.webp`) with warm brownish overlay
  - Large centered logo with glow effect (128px mobile, 160px sm, 224px tablet, 380px desktop)
  - Hero text "מרכז למידה בית ספרי" in Playpen Sans Hebrew cursive font with indigo glow effect
  - Four glowing LED-style bubble cards with glass/glassmorphism effects
  - Responsive layout: 2x2 grid on mobile/tablet, radial corner layout on desktop
  - Bubble cards feature: gradient backgrounds (70% opacity), multi-layer glow effects, 3D shine highlights, hover scale animation
  - Color scheme: emerald (students), blue (staff), amber (parents), teal (gallery)
  - Added Playpen Sans Hebrew font via Google Fonts link tag
  - Logged-in users auto-redirect to their dashboard
- **New animations**: Added `twinkle`, `float`, and `portal-appear` keyframes and utilities
- **Radial gradient utility**: Added `bg-gradient-radial` CSS utility class
- **Themed login pages**: Login page now supports role-specific themes via URL parameter (`/login?type=student|parent|staff`)
  - **Student theme**: Glass card floating over full-bleed bg-student.webp, emerald color scheme, playful "שלום חוקר!" greeting
  - **Parent theme**: Side-by-side layout with bg-parents.webp on left, warm amber gradient background, welcoming family feel
  - **Staff theme**: Integrated layout with form positioned in left empty space of bg-teachers.webp, professional blue theme
  - Each theme has unique background image, color scheme, greeting text, and button styling
  - All layouts include "חזרה" (back) button to return to home page
  - Default fallback layout for direct `/login` access without type parameter
  - Role-based login validation: students can only login via student entry, parents via parent entry, staff via staff entry
  - Admins can login from any entry point

### Fixed

- **Logout redirect**: Users are now redirected to home page on logout instead of staying on dashboard

## [0.2.0] - 2026-01-15

### Added

- **ErrorBoundary component**: New `ErrorBoundary` component at `src/components/ErrorBoundary.tsx` that catches unhandled React errors and displays a user-friendly error message with retry button
- **Image configuration**: Image processing settings (max width, quality, format) are now configurable via environment variables (`NEXT_PUBLIC_IMAGE_MAX_WIDTH`, `NEXT_PUBLIC_IMAGE_QUALITY`) instead of hardcoded values
- **Code review documentation**: Added comprehensive code review document at `docs/code-review-2026-01-14.md` with findings categorized by severity (Critical, Important, Minor), accepted risks documented with rationale, and recommended fixes with code examples

### Fixed

- **API endpoint security**: Added API secret validation to the report generation endpoint (`netlify/functions/generate-report.ts`) to prevent unauthorized access and quota abuse. Set both `REPORT_API_SECRET` (server) and `NEXT_PUBLIC_REPORT_API_SECRET` (client) environment variables to the same value to enable
- **XSS protection for AI reports**: Added `rehype-sanitize` to ReactMarkdown in reports page to sanitize AI-generated content
- **Input validation**: Added input sanitization for journal submissions (student names max 100 chars, answers max 5000 chars) and forum posts (titles max 200 chars, content max 10000 chars)
- **Race condition in password updates**: Password updates now use Firestore transactions to prevent duplicate records if a crash occurs between create and delete operations
- **Firebase error detection**: Error handling now uses Firebase error codes instead of string matching for more reliable error categorization
- **Empty interface definitions**: Fixed TypeScript empty interfaces in Card.tsx by converting them to type aliases
- **Inconsistent loading states**: Role layout and forum redirect pages now show skeleton loaders instead of returning null during loading/redirecting

### Improved

- **Accessibility (ARIA)**: Added proper ARIA labels and roles to QuestionRenderer (rating buttons, radio groups, checkboxes) and Sidebar navigation (aria-current for active page, aria-label for nav)
- **Version display and app refresh**: Header now shows app version number (from package.json) and includes a refresh button that clears cached HTML, CSS, JS, and service workers with an animated 3-second progress modal
- **Password visibility toggle**: Login page now has a show/hide password button for better UX
- **Improved social sharing metadata**: Enhanced Open Graph and Twitter card meta tags with proper image dimensions, locale, and site name
- **Header grade selector**: Grade selector is now prominently displayed in the header on grade-relevant pages and admin dashboard. Admin can switch grades with one click; users with assigned grades see their grade displayed. Desktop shows compact buttons, mobile shows dropdown. Selected grade is stored in localStorage and persists across navigation - selecting a grade on the dashboard stores it for later use when navigating to grade-relevant sections via sidebar.

### Removed

- **Explanation buttons feature**: Removed the unused "כפתורי הסבר" (explanation buttons) tab from admin settings, along with related service functions and types

### Fixed

- **Teacher dashboard duplication**: Removed duplicate "פורום" from quick actions (already in info cards), replaced with "תגובות תלמידים" for better feature discovery
- **Netlify 404 on dynamic routes**: Added `netlify.toml` with `@netlify/plugin-nextjs` to properly handle Next.js App Router dynamic routes
- **Questionnaire activation validation**: Prevent activating questionnaires with 0 questions (button is now disabled with tooltip explaining why)
- **Grade selector localStorage issues**: Users with assigned grades (teachers, parents, students) now always use their assigned grade, ignoring any stored grade from previous admin sessions. Only admins use the stored grade preference.
- **Sidebar polling performance**: Replaced 100ms localStorage polling with custom event-based communication between components
- **Redirect page security**: Added role validation to prevent URL manipulation attacks where users could access pages with incorrect role in URL
- **localStorage error handling**: Added try-catch blocks for localStorage operations to prevent crashes in private browsing or when storage is unavailable

### Changed

#### Unit Form Navigation
- **Separate pages for unit creation/editing**: New unit form now opens on a dedicated page (`/[role]/work-plans/[grade]/new`) instead of inline on the units list page
- **Edit unit page**: Editing a unit now navigates to a separate page (`/[role]/work-plans/[grade]/[unitId]/edit`) instead of expanding inline form
- **Improved back button behavior**: Back button from create/edit pages returns to the units list for that grade

#### Pedagogical Tree View
- **Beautiful tree visualization**: Pedagogical page now displays units in a vertical timeline/tree format
  - Connected nodes with gradient lines showing learning journey
  - Alternating color themes (primary, secondary, accent) for visual variety
  - Animated entrance with staggered delays
  - "מסע הלמידה" (Learning Journey) header decoration
  - End-of-journey decoration with bouncing dot and spinning atom
- **Click-through navigation**: Clicking a unit navigates to work-plans detail page

#### Nested Routing for Units
- **Unit detail pages**: Added `/[role]/work-plans/[grade]/[unitId]` route for viewing individual units
- **URL-based state**: Unit selection now uses URL routing instead of component state
- **Improved navigation**: Back button returns to units grid, browser back/forward works correctly
- **Admin actions**: Edit/delete buttons shown in unit detail view for admins

#### Teacher Grade Restriction
- **Teachers now restricted to assigned grade**: Teachers with a grade assigned in their user document are automatically redirected to that grade instead of seeing the grade selector
- **Affected pages**: work-plans, pedagogical, documentation, reports
- **Admins still see all grades**: Only admins can access the grade selector to view/manage all grades
- **Hidden back button for restricted users**: Back button to grade selector is hidden for users restricted to their grade (teachers, students, parents) since it would just redirect them back

#### Layout Improvements
- **Fixed sidebar and header**: Sidebar now spans full viewport height on desktop; header stays fixed at top of content area
- **Scrollable main content**: Only the `<main>` element scrolls; sidebar and header remain visible during scroll
- **Mobile behavior unchanged**: Mobile sidebar overlay with backdrop works as before

#### Toast Notifications
- **Position moved to bottom-left**: Toast notifications now appear at bottom-left of screen instead of top-left
- **Animation updated**: Changed from `animate-slide-in-right` to `animate-slide-up` for better UX
- **Error messages unified**: All error messages throughout the app now display as toast notifications instead of inline alerts
  - Affected components: DocumentationGallery, UnitTree, NewPostForm, PostCard
  - Affected pages: passwords, forum, journal, documentation, work-plans
- **RTL border direction**: Toast accent border now appears on the correct (left) side for RTL layouts
- **Memoized `useToastActions` hook**: Prevents unnecessary re-renders when toast is included in useCallback dependencies
- **Standardized toast message format**: All toast messages now follow consistent pattern (category title + action description)

#### Journal Error Recovery
- **Retry buttons for journal pages**: Added error states with retry buttons to journal unit selector and journal wizard pages
  - Shows EmptyState with "נסה שוב" button when loading fails
  - Maintains consistent UX with other pages (DocumentationGallery, UnitTree)

#### Questions Page Validation
- **Form validation**: Added proper form validation for admin questions page
  - Choice questions (single/multiple) now require at least 2 options
  - Target validation: must select at least one grade AND one unit
  - Submit button disabled when form is invalid or saving
  - Visual validation messages shown when validation fails
- **Error handling**: All CRUD operations now wrapped in try-catch with toast notifications
  - Success/error toasts for create, update, and delete operations
  - Error handling for data loading with toast notification
- **Loading state**: Submit button shows loading spinner and is disabled while saving
- **Order defaults**: New questions default to next available order number (1-indexed)
  - Order input clamped to valid range (1 to total questions)
  - Helper text shows valid range

#### ConfirmDialog Centering
- **Fixed dialog positioning**: ConfirmDialog now properly centered on screen using fixed positioning with transform

#### Questionnaire System (Breaking Change)
- **New data model**: Questions now belong to Questionnaires instead of being individually targeted
  - `Questionnaire`: Container with name, grade, unit, embedded questions, and active status
  - `EmbeddedQuestion`: Simplified question without target (determined by parent)
  - Multiple questionnaires allowed per grade+unit, but only one can be active
- **New route structure**:
  - `/[role]/questions` - Grade selector
  - `/[role]/questions/[grade]` - List questionnaires for grade
  - `/[role]/questions/[grade]/new` - Create new questionnaire
  - `/[role]/questions/[grade]/[id]` - Edit questionnaire and manage questions
- **Questionnaire features**:
  - Min 1, max 10 questions per questionnaire
  - 4 question types: rating, single choice, multiple choice, open
  - Activate/deactivate questionnaires (only one active per grade+unit)
  - Atomic activation using Firestore batch writes
- **Updated `getQuestionsForUnit()`**: Now fetches questions from active questionnaire only

### Added

#### Student Responses Viewer
- **New responses pages**: Teachers and admins can now view student journal responses
  - `/[role]/responses` - Grade selector (teachers auto-redirect to their grade)
  - `/[role]/responses/[grade]` - Unit selector
  - `/[role]/responses/[grade]/[unitId]` - List of student responses with expandable cards
- **Response cards**: Show student name, date, and number of answers; expand to see full Q&A
- **Admin delete**: Admins can delete individual responses with confirmation
- **Sidebar navigation**: Added "תגובות תלמידים" menu item for teachers and admins

#### Rating Style Selection for Questions
- **New `RatingStyle` type**: 4 visual styles for rating questions (stars, hearts, emojis, thumbs)
- **Admin questionnaire editor**: Rating style selector shown when creating/editing rating questions
- **Student journal wizard**: Rating questions now display in the selected style
  - **Stars (כוכבים)**: Classic 5-star rating with amber fill
  - **Hearts (לבבות)**: 5-heart rating with red fill
  - **Emojis (אימוג'י)**: 😢😕😐🙂😊 progression for younger students
  - **Thumbs (אגודלים)**: ThumbsDown→ThumbsUp with color gradient (red→green)

#### Questionnaires Service (`src/lib/services/questionnaires.ts`)
- `getQuestionnairesByGrade(gradeId)` - List all questionnaires for a grade
- `getActiveQuestionnaire(gradeId, unitId)` - Get active questionnaire for grade+unit
- `getQuestionnaire(id)` - Get by ID
- `createQuestionnaire(data)` - Create new questionnaire
- `updateQuestionnaire(id, data)` - Update questionnaire
- `deleteQuestionnaire(id)` - Delete questionnaire
- `activateQuestionnaire(id, gradeId, unitId)` - Activate (deactivates others)
- `deactivateQuestionnaire(id)` - Deactivate

#### Document Upload for Units
- **New `uploadDocument` utility**: Uploads PDF and Word files (.pdf, .doc, .docx) to Firebase Storage
  - Preserves original file extension
  - Validates file type before upload
- **Work Plans page**: Updated file upload to accept only PDF and Word documents (removed image support)
- **Work Plans page**: Added download links for all users; only admins can create/edit/delete units
- **Firebase Storage rules**: Added `storage.rules` with path-based permissions for units, documentation, and journals

#### Pedagogical UX Improvement
- **UnitTree Component**: Added "הוסף יחידה" (Add Unit) button to empty state when no units exist for a grade
  - Button only visible to teachers and admins
  - Navigates to work-plans page for the selected grade to create new units

#### Logo Integration
- **WelcomeHeader**: Logo displayed alongside greeting with role-specific animations (bouncy for students)
- **Login Page**: Full logo on desktop illustration panel and mobile header (replaces Atom icon)

#### Role-Specific Theming System
- **CSS Theme Variables**: Each role now has distinct visual properties that cascade through the app
  - `--theme-card-radius`: 4px (admin) → 16px (parent/student)
  - `--theme-card-shadow`: Role-tinted shadows with varying intensity
  - `--theme-animation-duration`: 150ms (admin) → 400ms (parent/student)
  - `--theme-animation-easing`: Linear (admin) → Spring-bounce (student)
  - `--theme-content-max-width`: 1400px (admin) → 1000px (parent)
  - `--theme-card-gap`: 1rem (admin) → 2rem (parent)

- **Theme-Aware Tailwind Utilities**: New utility classes that use CSS variables
  - `rounded-theme`, `shadow-theme`, `duration-theme`, `ease-theme`
  - `max-w-theme`, `gap-theme`
  - New animations: `animate-bounce-playful`, `animate-pulse-glow`, `animate-wiggle`

- **Enhanced ThemeContext**: `useRoleStyles()` now returns extended tokens
  - `cardClass`, `animationClass` for theme-aware component styling
  - `headerStyle` semantic token (dense/balanced/warm/playful)
  - `iconStyle` semantic token (sharp/outlined/soft/filled)
  - `gridCols` for role-specific grid layouts

- **WelcomeHeader Component**: New reusable component with role-specific welcome experiences
  - Student: Playful animations, streak counter, encouragement card
  - Parent: Warm greeting, child progress indicator
  - Teacher: Balanced layout, date display
  - Admin: Compact header, efficient design

- **Role-Specific Sidebar Themes**: Full visual differentiation for sidebar
  - Admin: Dark slate command center (bg-slate-900, Shield icon, indigo accents)
  - Teacher: Light blue gradient (calm, GraduationCap icon, blue accents)
  - Parent: Warm amber gradient (welcoming, Heart icon, amber accents)
  - Student: Emerald gradient (playful, Rocket icon, emerald accents)

- **Role-Specific Header Themes**: Matching header styling for visual consistency
  - Admin: Dark header (bg-slate-800) with light text
  - Teacher: Blue gradient header with blue accents
  - Parent: Amber gradient header with warm accents
  - Student: Emerald gradient header with fresh accents

- **Background Patterns**: Subtle SVG patterns for visual differentiation
  - Admin: Grid pattern (command center aesthetic)
  - Student: Dots pattern (playful lab aesthetic)
  - CSS utility classes: `.dashboard-pattern`, `.dashboard-bg`

### Changed

#### UI Components - Theme-Aware Updates
- **Card**: Uses `rounded-theme` and `shadow-theme` (radius/shadow now vary by role)
- **Card**: New `roleAccent` prop adds role-colored right border
- **Button**: Uses `duration-theme` and `ease-theme` (animation timing varies by role)
- **Dashboard Page**: Uses `roleStyles.gridCols` and `gap-theme` for role-specific layouts
- **Dashboard Page**: Role-specific header sizes (compact for admin, large for student)
- **Dashboard Page**: Refactored to use WelcomeHeader component
- **Sidebar**: Complete visual overhaul with role-specific themes, icons, colors, and backgrounds
- **Header**: Complete visual overhaul with role-specific themes matching sidebar

#### URL Routing - Complete Restructure to Nested Role-Based Routes
- **Breaking:** All dashboard routes now include role prefix (`/admin/...`, `/teacher/...`, `/parent/...`, `/student/...`)
- URLs now preserve state on page refresh (grade, unit, forum room selections)
- Example routes:
  - `/admin/work-plans/א` - Admin viewing grade א work plans
  - `/teacher/forum/requests` - Teacher viewing forum requests room
  - `/student/journal/unit-123` - Student working on specific journal unit

#### New Route Structure
- `[role]/layout.tsx` - Role validation middleware (redirects unauthorized users)
- `[role]/page.tsx` - Role-specific dashboard home
- `[role]/work-plans/page.tsx` - Grade selector
- `[role]/work-plans/[grade]/page.tsx` - Units CRUD for selected grade
- `[role]/pedagogical/page.tsx` - Grade selector (auto-redirects students/parents to their grade)
- `[role]/pedagogical/[grade]/page.tsx` - Unit content tree
- `[role]/documentation/page.tsx` - Grade selector
- `[role]/documentation/[grade]/page.tsx` - Unit selector
- `[role]/documentation/[grade]/[unitId]/page.tsx` - Documentation gallery
- `[role]/reports/page.tsx` - Grade selector (auto-redirects parents to their grade)
- `[role]/reports/[grade]/page.tsx` - Unit selector
- `[role]/reports/[grade]/[unitId]/page.tsx` - AI report viewer
- `[role]/journal/page.tsx` - Unit selector for students
- `[role]/journal/[unitId]/page.tsx` - Research journal wizard
- `[role]/forum/page.tsx` - Redirects to default room
- `[role]/forum/[room]/page.tsx` - Forum posts with room tabs as Links
- `[role]/questions/page.tsx` - Question management (admin only)
- `[role]/passwords/page.tsx` - Password management (admin only)
- `[role]/settings/page.tsx` - Admin settings (buttons, email, reports)

#### Navigation Updates
- Sidebar links now use role-prefixed URLs
- Sidebar active state detection updated for nested routes using `startsWith()`
- GradeSelector now navigates via `router.push()` instead of `setState()`
- Login redirects to `/{role}` based on user role
- Root page (`/`) redirects to `/{role}` or `/login` based on session

### Removed
- Old flat routes (`/dashboard`, `/pedagogical`, `/work-plans`, `/documentation`, `/reports`, `/journal`, `/forum`, `/questions`, `/passwords`, `/admin`)
- State-based grade/unit selection (replaced with URL params)

### Changed

#### Journal Answer Storage
- **Question text now saved with answers**: Each journal answer now includes `questionText` alongside `questionId` for historical accuracy
- Ensures reports and data remain accurate even if questions are later edited or deleted

### Fixed
- AuthContext login return type now includes `role` property for redirect
- GradeSelector prop validation (added required `selected` prop)
- **Unit display order**: Now starts at 1 instead of 0, defaults to next available number when adding new units, and prevents values outside valid range (1 to total units)
- **Questionnaire Firebase errors**: Fixed composite index requirement by sorting questionnaires client-side; Fixed undefined field error by conditionally including options field only for choice question types

## [0.1.0] - 2026-01-13

### Added

#### Core Platform
- Next.js 16 App Router with TypeScript and Tailwind CSS
- Firebase Firestore for database and Firebase Storage for files
- RTL Hebrew layout with Rubik (headers) and Heebo (body) fonts
- Password-based authentication (Firestore document ID as password)
- Role-based access control (admin, teacher, parent, student)
- PWA support with manifest and icons

#### Pages
- Login page with animated STEM illustrations
- Role-specific dashboard home with quick actions
- Pedagogical model page with grade selection and unit tree
- Documentation gallery with image upload (WebP conversion, max 800px)
- Research journal wizard for students with question types (rating, single, multiple, open)
- AI-generated reports page with role-based content (teacher vs parent)
- Forum with two rooms (requests, consultations) and reply threads
- Admin settings page (explanation buttons, email config, report elements)
- Questions management page for research journal configuration
- Work plans page for unit management per grade
- Password management page with collapsible role sections

#### UI Components
- Button with variants (primary, outline, ghost, destructive), icons, loading states
- Card with variants (default, elevated, outlined) and interactive hover
- Icon component with STEM-themed Lucide icons
- GradeSelector with Hebrew numeral indicators and ring glow
- Progress bar with step indicators
- Skeleton loaders (text, card, grid variants) with shimmer animation
- Toast notifications with auto-dismiss
- EmptyState displays with STEM illustrations
- ConfirmDialog modal with variant-specific icons

#### Design System
- Role-based theming via ThemeContext (admin=indigo, teacher=blue, parent=amber, student=emerald)
- Surface colors for depth (surface-0 through surface-3)
- Custom animations (fade-in, slide-up, scale-in, shimmer, celebrate, confetti)
- Responsive design: mobile-first with tablet and desktop breakpoints

#### Services
- Units CRUD service
- Documentation CRUD service
- Questions CRUD service
- Research journals service
- Reports service with AI generation
- Forum service for posts and replies
- Settings service (explanation buttons, email, report config)
- Users service for password management
- Image upload utility with resize and WebP conversion

#### Backend
- Netlify serverless function for AI report generation
- Google Gemini API integration for report content

### Security
- Removed raw password from session storage (uses document ID instead)
- Name input validation and sanitization
- Safe markdown rendering with react-markdown
- Object URL cleanup to prevent memory leaks

[Unreleased]: https://github.com/blakazulu/stem-explorers/compare/v0.9.1...HEAD
[0.9.1]: https://github.com/blakazulu/stem-explorers/compare/v0.9.0...v0.9.1
[0.9.0]: https://github.com/blakazulu/stem-explorers/compare/v0.8.1...v0.9.0
[0.8.1]: https://github.com/blakazulu/stem-explorers/compare/v0.8.0...v0.8.1
[0.8.0]: https://github.com/blakazulu/stem-explorers/compare/v0.7.0...v0.8.0
[0.7.0]: https://github.com/blakazulu/stem-explorers/compare/v0.6.0...v0.7.0
[0.6.0]: https://github.com/blakazulu/stem-explorers/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/blakazulu/stem-explorers/compare/v0.4.1...v0.5.0
[0.4.1]: https://github.com/blakazulu/stem-explorers/compare/v0.4.0...v0.4.1
[0.4.0]: https://github.com/blakazulu/stem-explorers/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/blakazulu/stem-explorers/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/blakazulu/stem-explorers/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/blakazulu/stem-explorers/releases/tag/v0.1.0
