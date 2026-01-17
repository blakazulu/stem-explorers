# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

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

[Unreleased]: https://github.com/blakazulu/stem-explorers/compare/v0.4.1...HEAD
[0.4.1]: https://github.com/blakazulu/stem-explorers/compare/v0.4.0...v0.4.1
[0.4.0]: https://github.com/blakazulu/stem-explorers/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/blakazulu/stem-explorers/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/blakazulu/stem-explorers/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/blakazulu/stem-explorers/releases/tag/v0.1.0
