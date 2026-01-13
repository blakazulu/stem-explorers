# System Design: Role-Specific Theming

This document provides comprehensive documentation of the role-based visual theming system implemented in STEM Explorers. The system transforms each user role (Admin, Teacher, Parent, Student) into a **distinct visual universe** with unique aesthetics, animations, and interactions.

---

## Table of Contents

1. [Design Philosophy](#design-philosophy)
2. [Architecture Overview](#architecture-overview)
3. [CSS Theme Variables](#css-theme-variables)
4. [Tailwind Theme Utilities](#tailwind-theme-utilities)
5. [ThemeContext & useRoleStyles Hook](#themecontext--userolestyles-hook)
6. [Component Implementation](#component-implementation)
7. [Sidebar Theming](#sidebar-theming)
8. [Header Theming](#header-theming)
9. [WelcomeHeader Component](#welcomeheader-component)
10. [Background Patterns](#background-patterns)
11. [Animation System](#animation-system)
12. [Implementation Checklist](#implementation-checklist)

---

## Design Philosophy

### The Problem
Most multi-role dashboards use "same UI, different accent color" - this creates a flat, uninspired experience where roles feel like afterthoughts rather than intentionally designed experiences.

### The Solution
Each role gets a **complete visual personality**:

| Role | Aesthetic | Personality | Visual Language |
|------|-----------|-------------|-----------------|
| **Admin** | Command Center | Efficient, powerful, data-dense | Sharp corners, snappy transitions, dark slate |
| **Teacher** | Knowledge Garden | Calm, organized, scholarly | Balanced proportions, smooth animations, blue tints |
| **Parent** | Family Dashboard | Warm, accessible, reassuring | Soft corners, gentle timing, amber warmth |
| **Student** | Explorer's Lab | Playful, engaging, adventurous | Rounded elements, bouncy physics, emerald energy |

### Key Principles

1. **Cascade, Don't Override**: Use CSS variables that cascade through the entire UI automatically
2. **Semantic Tokens**: Components use semantic classes (`rounded-theme`) not role-specific ones
3. **Progressive Enhancement**: Theme system is additive; components work without it
4. **Performance**: CSS variables are resolved at render time, no JS overhead

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Theme Application Flow                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1. User logs in → AuthContext stores role                          │
│                        ↓                                             │
│  2. ThemeContext reads role → applies .theme-{role} to <body>       │
│                        ↓                                             │
│  3. CSS variables cascade → all --theme-* properties update         │
│                        ↓                                             │
│  4. Tailwind utilities (rounded-theme, shadow-theme) resolve        │
│                        ↓                                             │
│  5. Components automatically styled per role                        │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### File Structure

```
src/
├── app/globals.css              # CSS variable definitions
├── contexts/ThemeContext.tsx    # Theme provider & hooks
├── components/
│   ├── ui/
│   │   ├── Card.tsx             # Theme-aware card
│   │   └── Button.tsx           # Theme-aware button
│   └── dashboard/
│       ├── Header.tsx           # Role-themed header
│       ├── Sidebar.tsx          # Role-themed sidebar
│       └── WelcomeHeader.tsx    # Role-specific welcome
public/
└── patterns/
    ├── grid.svg                 # Admin background
    └── dots.svg                 # Student background
tailwind.config.ts               # Theme utility extensions
```

---

## CSS Theme Variables

Located in `src/app/globals.css`:

### Default Values (Root)

```css
:root {
  /* Theme defaults (teacher as base) */
  --theme-card-radius: 8px;
  --theme-card-shadow: 0 1px 3px rgba(0,0,0,0.1);
  --theme-animation-duration: 300ms;
  --theme-animation-easing: ease-out;
  --theme-content-max-width: 1200px;
  --theme-card-gap: 1.5rem;
}
```

### Role-Specific Overrides

#### Admin Theme
```css
.theme-admin {
  --theme-card-radius: 4px;
  --theme-card-shadow: 0 1px 2px rgba(99,102,241,0.08);
  --theme-animation-duration: 150ms;
  --theme-animation-easing: ease;
  --theme-content-max-width: 1400px;
  --theme-card-gap: 1rem;
}
```

**Design rationale**: Admins need dense information displays. Sharp corners and fast animations feel efficient and powerful.

#### Teacher Theme
```css
.theme-teacher {
  --theme-card-radius: 8px;
  --theme-card-shadow: 0 2px 8px rgba(2,132,199,0.08);
  --theme-animation-duration: 300ms;
  --theme-animation-easing: ease-out;
  --theme-content-max-width: 1200px;
  --theme-card-gap: 1.5rem;
}
```

**Design rationale**: Teachers benefit from balanced, calm interfaces that don't distract from content.

#### Parent Theme
```css
.theme-parent {
  --theme-card-radius: 16px;
  --theme-card-shadow: 0 4px 12px rgba(245,158,11,0.1);
  --theme-animation-duration: 400ms;
  --theme-animation-easing: cubic-bezier(0.34, 1.56, 0.64, 1);
  --theme-content-max-width: 1000px;
  --theme-card-gap: 2rem;
}
```

**Design rationale**: Parents often view on mobile during busy moments. Soft, warm aesthetics feel welcoming and non-technical.

#### Student Theme
```css
.theme-student {
  --theme-card-radius: 16px;
  --theme-card-shadow: 0 6px 20px rgba(16,185,129,0.12);
  --theme-animation-duration: 400ms;
  --theme-animation-easing: cubic-bezier(0.34, 1.56, 0.64, 1);
  --theme-content-max-width: 1100px;
  --theme-card-gap: 1.5rem;
}
```

**Design rationale**: Students need engaging, game-like experiences. Bouncy spring physics and prominent shadows create depth and playfulness.

---

## Tailwind Theme Utilities

Located in `tailwind.config.ts`:

```typescript
extend: {
  borderRadius: {
    'theme': 'var(--theme-card-radius)',
  },
  boxShadow: {
    'theme': 'var(--theme-card-shadow)',
  },
  transitionDuration: {
    'theme': 'var(--theme-animation-duration)',
  },
  transitionTimingFunction: {
    'theme': 'var(--theme-animation-easing)',
  },
  maxWidth: {
    'theme': 'var(--theme-content-max-width)',
  },
  gap: {
    'theme': 'var(--theme-card-gap)',
  },
}
```

### Usage in Components

```tsx
// Before (hardcoded)
<div className="rounded-xl shadow-lg duration-200 ease-out">

// After (theme-aware)
<div className="rounded-theme shadow-theme duration-theme ease-theme">
```

The component automatically adapts to the current role's visual language without any conditional logic.

---

## ThemeContext & useRoleStyles Hook

Located in `src/contexts/ThemeContext.tsx`:

### ThemeProvider

Applies the theme class to the document body:

```tsx
useEffect(() => {
  if (role) {
    document.body.classList.remove('theme-admin', 'theme-teacher', 'theme-parent', 'theme-student');
    document.body.classList.add(`theme-${role}`);
  }
}, [role]);
```

### useRoleStyles Hook

Returns comprehensive style tokens for the current role:

```typescript
interface RoleStyleConfig {
  // Colors
  accent: string;      // e.g., "role-admin"
  bg: string;          // e.g., "bg-role-admin"
  bgLight: string;     // e.g., "bg-role-admin/10"
  text: string;        // e.g., "text-role-admin"
  border: string;      // e.g., "border-role-admin"

  // Theme-aware classes
  cardClass: string;       // "rounded-theme shadow-theme"
  animationClass: string;  // "duration-theme ease-theme"

  // Semantic tokens
  headerStyle: "dense" | "balanced" | "warm" | "playful";
  iconStyle: "sharp" | "outlined" | "soft" | "filled";

  // Layout
  gridCols: string;        // e.g., "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
  contentWidth: string;    // e.g., "max-w-theme"
}
```

### Usage

```tsx
function MyComponent() {
  const roleStyles = useRoleStyles();

  return (
    <div className={`${roleStyles.gridCols} gap-theme`}>
      <Card className={roleStyles.cardClass}>
        {/* Content */}
      </Card>
    </div>
  );
}
```

---

## Component Implementation

### Card Component

`src/components/ui/Card.tsx`:

```tsx
const baseStyles = "rounded-theme transition-all duration-theme ease-theme";

const variantStyles = {
  default: "bg-surface-0 shadow-theme",
  elevated: "bg-surface-0 shadow-theme hover:shadow-lg",
  outlined: "bg-surface-0 border-2 border-surface-3",
};

// Optional role accent border
{roleAccent && (
  <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-theme ${roleStyles.bg}`} />
)}
```

### Button Component

`src/components/ui/Button.tsx`:

```tsx
const baseStyles = `
  inline-flex items-center justify-center gap-2
  font-heebo font-medium
  rounded-theme
  transition-all duration-theme ease-theme
  focus:outline-none focus:ring-2 focus:ring-offset-2
  disabled:opacity-50 disabled:cursor-not-allowed
  cursor-pointer
`;
```

---

## Sidebar Theming

`src/components/dashboard/Sidebar.tsx`:

Each role has a complete visual theme defined in `sidebarThemes`:

### Theme Interface

```typescript
interface SidebarTheme {
  // Container
  bg: string;           // Background gradient/color
  border: string;       // Border color

  // Header
  headerBg: string;     // Logo area background
  headerBorder: string; // Header bottom border
  logoBg: string;       // Logo icon background
  logoIcon: LucideIcon; // Role-specific icon
  logoColor: string;    // Icon color
  titleColor: string;   // "חוקרי STEM" color
  subtitleColor: string;// "מרחב למידה" color

  // Navigation
  navItemDefault: string;    // Inactive item color
  navItemHover: string;      // Hover state
  navItemActive: string;     // Active item background
  navItemActiveText: string; // Active item text
  indicatorBg: string;       // Active indicator bar

  // Section
  dividerColor: string;      // Section divider
  sectionLabelColor: string; // "ניהול" label

  // Footer
  footerBorder: string;      // Footer top border
  footerIconColor: string;   // STEM icons color
}
```

### Role Themes

| Property | Admin | Teacher | Parent | Student |
|----------|-------|---------|--------|---------|
| Background | `bg-slate-900` | `from-blue-50 to-white` | `from-amber-50/80 to-orange-50/30` | `from-emerald-50 to-teal-50/30` |
| Logo Icon | Shield | GraduationCap | Heart | Rocket |
| Active Indicator | Indigo | Blue | Amber | Emerald |

---

## Header Theming

`src/components/dashboard/Header.tsx`:

Mirrors sidebar theming for visual consistency:

### Theme Interface

```typescript
interface HeaderTheme {
  // Container
  bg: string;              // Header background
  border: string;          // Bottom border

  // Text
  greetingColor: string;   // "שלום, " color
  nameColor: string;       // User name color

  // Badge
  badgeBg: string;         // Role badge background
  badgeText: string;       // Badge text color
  badgeBorder: string;     // Badge border
  badgeIcon: LucideIcon;   // Role icon in badge

  // Buttons
  menuBtnHover: string;    // Mobile menu hover
  menuBtnText: string;     // Menu button color
  logoutHover: string;     // Logout hover state
  logoutText: string;      // Logout text color
}
```

### Visual Consistency

Admin header uses dark theme (`bg-slate-800`) to match dark sidebar, while other roles use light gradients that complement their sidebar gradients.

---

## WelcomeHeader Component

`src/components/dashboard/WelcomeHeader.tsx`:

Role-specific welcome experiences:

### Student Experience
- Large playful greeting with Rocket icon
- Streak counter (simulated)
- Encouragement card with Sparkles
- Bouncy animations

### Parent Experience
- Warm greeting with Heart icon
- Child's name prominently displayed
- Progress indicator showing child's activity
- Gentle, reassuring tone

### Teacher Experience
- Professional greeting with GraduationCap
- Current date display
- Balanced layout
- Focus on productivity

### Admin Experience
- Compact header with Shield icon
- Quick stats overview
- Dense information display
- Efficiency-focused design

---

## Background Patterns

### Admin Grid Pattern
`public/patterns/grid.svg`:
```svg
<svg width="40" height="40" viewBox="0 0 40 40">
  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor"
        stroke-width="0.5" opacity="0.1"/>
</svg>
```

Applied via CSS:
```css
.theme-admin .dashboard-pattern {
  background-image: url('/patterns/grid.svg');
  background-size: 40px 40px;
}
```

### Student Dots Pattern
`public/patterns/dots.svg`:
```svg
<svg width="20" height="20" viewBox="0 0 20 20">
  <circle cx="10" cy="10" r="1.5" fill="currentColor" opacity="0.15"/>
</svg>
```

---

## Animation System

### Theme-Aware Animations

```typescript
// tailwind.config.ts
keyframes: {
  'bounce-playful': {
    '0%, 100%': { transform: 'translateY(0)' },
    '50%': { transform: 'translateY(-8px)' },
  },
  'pulse-glow': {
    '0%, 100%': { boxShadow: '0 0 0 0 var(--color-role-student)' },
    '50%': { boxShadow: '0 0 20px 4px rgba(16,185,129,0.3)' },
  },
  'wiggle': {
    '0%, 100%': { transform: 'rotate(-3deg)' },
    '50%': { transform: 'rotate(3deg)' },
  },
},
animation: {
  'bounce-playful': 'bounce-playful 600ms var(--theme-animation-easing) infinite',
  'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
  'wiggle': 'wiggle 300ms ease-in-out',
},
```

### Role-Specific Animation Usage

| Animation | Primary Use | Roles |
|-----------|-------------|-------|
| `bounce-playful` | Achievement celebrations | Student |
| `pulse-glow` | Focus attention | Student |
| `wiggle` | Interactive feedback | Student, Parent |
| `slide-up` | Page transitions | All |
| `scale-in` | Modal appearance | All |

---

## Implementation Checklist

### Adding Theme Support to a New Component

1. **Use theme utilities instead of hardcoded values**
   ```tsx
   // Before
   className="rounded-xl shadow-md duration-200"

   // After
   className="rounded-theme shadow-theme duration-theme ease-theme"
   ```

2. **Use useRoleStyles for role-specific logic**
   ```tsx
   const roleStyles = useRoleStyles();
   // Use roleStyles.gridCols, roleStyles.headerStyle, etc.
   ```

3. **Add roleAccent prop if border accents make sense**
   ```tsx
   {roleAccent && <div className={`w-1 ${roleStyles.bg}`} />}
   ```

### Testing Theme Implementation

1. **Login as each role** and verify visual consistency
2. **Check animation timing** - Admin should feel snappy, Student bouncy
3. **Verify responsive behavior** at mobile/tablet/desktop
4. **Confirm RTL layout** is maintained
5. **Test sidebar/header color harmony** per role

---

## Rollback Plan

All theme changes use CSS variables and optional props. To rollback:

1. Remove theme variable overrides from `globals.css`
2. Replace `rounded-theme` → `rounded-xl` in Card
3. Replace `duration-theme ease-theme` → `duration-200 ease-out` in Button
4. Remove `roleAccent` prop usage

No database changes. No breaking API changes.

---

## Future Enhancements

- [ ] Dark mode support per role
- [ ] User preference overrides
- [ ] Reduced motion support
- [ ] High contrast mode
- [ ] Theme preview in settings

---

*Last updated: January 2026*
