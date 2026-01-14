# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Version display and app refresh**: Header now shows app version number (from package.json) and includes a refresh button that clears cached HTML, CSS, JS, and service workers with an animated 3-second progress modal
- **Password visibility toggle**: Login page now has a show/hide password button for better UX
- **Improved social sharing metadata**: Enhanced Open Graph and Twitter card meta tags with proper image dimensions, locale, and site name
- **Header grade selector**: Grade selector is now prominently displayed in the header on grade-relevant pages and admin dashboard. Admin can switch grades with one click; users with assigned grades see their grade displayed. Desktop shows compact buttons, mobile shows dropdown. Selected grade is stored in localStorage and persists across navigation - selecting a grade on the dashboard stores it for later use when navigating to grade-relevant sections via sidebar.

### Removed

- **Explanation buttons feature**: Removed the unused "כפתורי הסבר" (explanation buttons) tab from admin settings, along with related service functions and types

### Fixed

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

[Unreleased]: https://github.com/blakazulu/stem-explorers/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/blakazulu/stem-explorers/releases/tag/v0.1.0
