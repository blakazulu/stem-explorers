# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Important Rules

- **Every change must update CHANGELOG.md** - When making any code changes, add an entry to the appropriate section (Added, Changed, Fixed, etc.) under `[Unreleased]`.
- **UI components must follow system design** - When creating or changing UI components, always refer to `docs/system-design.md` and consider role-based theming if the component needs it.

## Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run lint     # Run ESLint
npm start        # Start production server
```

## Project Overview

STEM Explorers (חוקרי STEM) is a Hebrew RTL learning management platform for elementary schools (grades א-ו) implementing STEM education. Built with Next.js 16 App Router, TypeScript, Tailwind CSS, and Firebase.

## Architecture

### Authentication
Password-based login where Firestore document ID IS the password. Users enter name + password; the password is used to lookup the user document directly. Session stored in localStorage and validated against Firestore on mount.

```
/users/{password} -> { role, grade, createdAt }
```

### User Roles & Access
- **admin**: Full access, manages questions, passwords, settings
- **teacher**: Manages units, documentation, views reports, forum access
- **parent**: View-only access to child's grade content and reports
- **student**: View content, fill research journal wizard

### Route Groups
- `(auth)/login` - Public login page
- `(dashboard)/*` - Protected routes with Sidebar/Header layout

### Key Data Flow
1. **Units** are created per grade by teachers/admins
2. **Documentation** (images) is attached to units by teachers
3. **Students** fill **Research Journals** (wizard with questions)
4. **AI Reports** are generated from journal submissions using Google Gemini
5. **Forum** has two rooms: requests (emails admin) and consultations

### Context Providers
Located in `src/contexts/`:
- `AuthContext` - Session state, login/logout functions
- `ThemeContext` - Role-based theming, applies `theme-{role}` class to body

Theme usage in components:
```tsx
const roleStyles = useRoleStyles(); // Returns { bg, bgLight, text, border, accent }
```

### Services Pattern
All Firestore operations in `src/lib/services/`:
- Each service handles one collection (units, questions, journals, etc.)
- Functions: `get*`, `create*`, `update*`, `delete*`
- Errors handled via `handleFirebaseError()` utility

### UI Component Library
Located in `src/components/ui/`:
- `Button` - Variants: primary, outline, ghost, destructive; supports icons, loading
- `Card` - Variants: default, elevated, outlined; interactive prop for hover effects
- `Icon` - Wrapper around Lucide icons with STEM presets
- `Skeleton` - Loading placeholders (text, card, grid variants)
- `EmptyState` - Consistent empty displays; accepts ActionConfig or ReactNode
- `Progress` - Animated progress bar with step indicators
- `GradeSelector` - Hebrew grade selection with visual feedback
- `ConfirmDialog` - Modal with variant-specific icons (danger, warning, info)

### Styling Conventions
- Colors via CSS variables (see `globals.css`), referenced in Tailwind config
- Role colors: `role-admin` (indigo), `role-teacher` (blue), `role-parent` (amber), `role-student` (emerald)
- Surface colors for depth: `surface-0` through `surface-3`
- Animations defined in `tailwind.config.ts`: fade-in, slide-up, scale-in, shimmer, celebrate

### Hebrew/RTL Notes
- All layout is RTL by default (`dir="rtl"` on html)
- Grade type is Hebrew letters: `"א" | "ב" | "ג" | "ד" | "ה" | "ו"`
- Fonts: Rubik (headers), Heebo (body)

### File Upload
Images processed via `src/lib/utils/imageUpload.ts`:
- Resizes to max 800px width
- Converts to WebP format
- Uploads to Firebase Storage
