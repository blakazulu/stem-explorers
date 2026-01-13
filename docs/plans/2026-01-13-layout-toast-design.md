# Layout & Toast Design

## Overview

Two UI improvements:
1. Fixed sidebar/header with scrollable main content
2. Error messages displayed as bottom-left toasts

---

## 1. Layout Structure

### Current State
- Outer container uses `min-h-screen` - whole page scrolls together
- Sidebar and header scroll with content

### Target State
- Sidebar: fixed full viewport height (desktop only)
- Header: fixed at top of content area
- Main: only scrollable element

### Implementation

**File: `src/app/(dashboard)/layout.tsx`**

```tsx
// Before
<div className="min-h-screen bg-background flex">
  <Sidebar />
  <div className="flex-1 flex flex-col min-w-0">
    <Header />
    <main className="flex-1 p-4 md:p-6 overflow-x-hidden">

// After
<div className="h-screen bg-background flex overflow-hidden">
  <Sidebar />
  <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
    <Header />
    <main className="flex-1 p-4 md:p-6 overflow-y-auto overflow-x-hidden">
```

Key changes:
- Outer div: `h-screen` + `overflow-hidden`
- Content column: `h-screen` + `overflow-hidden`
- Main: `overflow-y-auto`

---

## 2. Toast Position

### Current State
- Position: `top-4 left-4`
- Animation: `animate-slide-in-right`

### Target State
- Position: `bottom-4 left-4`
- Animation: `animate-slide-up`

### Implementation

**File: `src/components/ui/Toast.tsx`**

```tsx
// Before
<div className="fixed top-4 left-4 z-50 flex flex-col gap-2 max-w-sm">

// After
<div className="fixed bottom-4 left-4 z-50 flex flex-col gap-2 max-w-sm">
```

Toast animation change:
```tsx
// Before
className={`... animate-slide-in-right ...`}

// After
className={`... animate-slide-up ...`}
```

---

## 3. Migrate Inline Errors to Toasts

### Files to Update

**Components:**
- `src/components/documentation/DocumentationGallery.tsx`
- `src/components/pedagogical/UnitTree.tsx`
- `src/components/forum/NewPostForm.tsx`
- `src/components/forum/PostCard.tsx`

**Pages:**
- `src/app/(dashboard)/[role]/passwords/page.tsx`
- `src/app/(dashboard)/[role]/forum/[room]/page.tsx`
- `src/app/(dashboard)/[role]/journal/page.tsx`
- `src/app/(dashboard)/[role]/journal/[unitId]/page.tsx`
- `src/app/(dashboard)/[role]/documentation/[grade]/[unitId]/page.tsx`
- `src/app/(dashboard)/[role]/work-plans/[grade]/page.tsx`

### Migration Pattern

```tsx
// Before
const [error, setError] = useState<string | null>(null);

// In catch block:
setError("הודעת שגיאה");

// In JSX:
{error && (
  <div className="...">
    <Icon name="alert-triangle" />
    <span>{error}</span>
  </div>
)}

// After
const toast = useToastActions();

// In catch block:
toast.error("שגיאה", "הודעת שגיאה");

// Remove error state and inline JSX entirely
```

### Exception

`src/components/ui/Input.tsx` - keep inline error for field validation (shows next to input field)

---

## Notes

- Toast already has auto-close (5 seconds default) and close button
- Mobile sidebar behavior unchanged (overlay with backdrop)
- Follows existing theme system conventions

*Created: 2026-01-13*
