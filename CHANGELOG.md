# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
