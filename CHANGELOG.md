# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

#### Unit Form Navigation
- **Separate pages for unit creation/editing**: New unit form now opens on a dedicated page (`/[role]/work-plans/[grade]/new`) instead of inline on the units list page
- **Edit unit page**: Editing a unit now navigates to a separate page (`/[role]/work-plans/[grade]/[unitId]/edit`) instead of expanding inline form
- **Improved back button behavior**: Back button from create/edit pages returns to the units list for that grade

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

### Added

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

### Fixed
- AuthContext login return type now includes `role` property for redirect
- GradeSelector prop validation (added required `selected` prop)
- **Unit display order**: Now starts at 1 instead of 0, defaults to next available number when adding new units, and prevents values outside valid range (1 to total units)

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
