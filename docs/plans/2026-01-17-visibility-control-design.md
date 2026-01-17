# Visibility Control System (תצוגה) - Design Document

**Date:** 2026-01-17
**Status:** Approved
**Author:** Claude + Liraz

## Overview

A visibility control system that lets admins configure what each role (teacher/parent/student) sees across the platform. This includes dashboard cards, sidebar links, and page-level elements.

## Goals

1. Allow admins to control which dashboard cards each role sees, with custom ordering
2. Allow admins to add a welcome intro text per role on dashboards
3. Allow admins to toggle sidebar link visibility and edit link names per role
4. Allow admins to control granular element visibility within pages (e.g., hide STEM links from parents)
5. Keep admin's own sidebar fixed for safety

## Non-Goals

- Admin sidebar customization (too risky - could lock themselves out)
- Per-user customization (only per-role)
- Drag-and-drop for sidebar links (toggle + rename only)

---

## Data Structure

### Storage Location

Embedded in existing `/settings/general` Firestore document under a new `visibility` field.

### TypeScript Types

```typescript
// src/types/index.ts

export type ConfigurableRole = 'teacher' | 'parent' | 'student';

export interface VisibilityConfig {
  dashboards: Record<ConfigurableRole, DashboardConfig>;
  sidebars: Record<ConfigurableRole, SidebarConfig>;
  pageElements: Record<ConfigurableRole, PageElementsConfig>;
}

export interface DashboardConfig {
  intro: string;  // Welcome text displayed at top of dashboard
  cards: DashboardCardConfig[];
}

export interface DashboardCardConfig {
  id: string;       // e.g., "pedagogical", "reports", "journal"
  visible: boolean;
  order: number;
}

export interface SidebarConfig {
  links: SidebarLinkConfig[];
}

export interface SidebarLinkConfig {
  id: string;        // e.g., "pedagogical", "teaching-resources"
  label: string;     // Custom display name (editable by admin)
  visible: boolean;
}

export interface PageElementsConfig {
  teachingResources: {
    curricula: boolean;
    stemLinks: boolean;
    equipment: boolean;
    experts: boolean;
  };
  reports: {
    summary: boolean;
    patterns: boolean;
    challenges: boolean;
    suggestions: boolean;
  };
  pedagogical: {
    unitCards: boolean;
    unitDetails: boolean;
  };
  documentation: {
    images: boolean;
    text: boolean;
    teacherName: boolean;
  };
}
```

---

## Default Configuration

When no visibility config exists, the system uses these defaults (matching current hardcoded behavior):

### Teacher Defaults

**Dashboard Cards:**
1. מודל פדגוגי (pedagogical)
2. משאבי הוראה (teaching-resources)
3. תגובות תלמידים (responses)
4. דוחות (reports)
5. במה אישית (forum)
6. תיעוד פעילויות (documentation)

**Sidebar Links:** All visible with default Hebrew names

**Page Elements:** All visible

### Parent Defaults

**Dashboard Cards:**
1. מודל פדגוגי (pedagogical)
2. דוחות (reports)
3. תיעודים (documentation)

**Sidebar Links:** pedagogical, documentation, reports (visible)

**Page Elements:**
- Teaching Resources: curricula ✓, stemLinks ✗, equipment ✗, experts ✓
- Reports: summary ✓, patterns ✗, challenges ✗, suggestions ✓
- Others: all visible

### Student Defaults

**Dashboard Cards:**
1. יומן חוקר (journal)
2. מודל פדגוגי (pedagogical)
3. תיעודים (documentation)

**Sidebar Links:** pedagogical, journal, documentation (visible)

**Page Elements:** Limited access (mostly view-only content)

---

## Architecture

### New Context Provider

```typescript
// src/contexts/VisibilityContext.tsx

interface VisibilityContextValue {
  config: VisibilityConfig;
  isLoading: boolean;

  // Helper functions
  getDashboardConfig: (role: ConfigurableRole) => DashboardConfig;
  getSidebarConfig: (role: ConfigurableRole) => SidebarConfig;
  getPageElements: (role: ConfigurableRole, page: keyof PageElementsConfig) => Record<string, boolean>;
  canSee: (role: ConfigurableRole, page: keyof PageElementsConfig, element: string) => boolean;
}
```

### Data Flow

```
Firestore /settings/general (visibility field)
                ↓
    VisibilityContext (fetches & caches)
                ↓
        ┌───────┼───────┐
        ↓       ↓       ↓
    Sidebar  Dashboard  Pages
```

### Component Usage Patterns

**Sidebar.tsx:**
```tsx
const { getSidebarConfig } = useVisibility();
const sidebarConfig = getSidebarConfig(user.role);

const visibleLinks = sidebarConfig.links
  .filter(link => link.visible)
  .map(link => ({
    ...BASE_LINKS[link.id],
    label: link.label,  // Use custom label
  }));
```

**Dashboard page.tsx:**
```tsx
const { getDashboardConfig } = useVisibility();
const config = getDashboardConfig(user.role);

// Show intro
{config.intro && <WelcomeIntro text={config.intro} />}

// Render cards in order
const visibleCards = config.cards
  .filter(c => c.visible)
  .sort((a, b) => a.order - b.order);
```

**Any page with elements:**
```tsx
const { canSee } = useVisibility();

{canSee(role, 'teachingResources', 'stemLinks') && <StemLinksCard />}
```

---

## Admin UI Design

### Page Location

`/admin/display` - New sidebar link "תצוגה" in admin section

### Layout: Role-First Approach

```
┌─────────────────────────────────────────────────────────────┐
│  תצוגה                                                      │
│                                                             │
│  [מורה]  [הורה]  [תלמיד]    ← Role selector tabs            │
│     ↑ selected                                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  תיאור לוח הבקרה (Dashboard Intro)                          │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Welcome message for this role...                      │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  כרטיסי לוח בקרה (Dashboard Cards)                          │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ ☰  ☑ מודל פדגוגי                                      │  │
│  │ ☰  ☑ דוחות                                            │  │
│  │ ☰  ☐ תיעודים                        ← drag + toggle   │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  קישורי תפריט (Sidebar Links)                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ ☑  [מודל פדגוגי_____________]                         │  │
│  │ ☑  [דוחות___________________]       ← toggle + edit   │  │
│  │ ☐  [משאבי הוראה_____________]  (מוסתר)                │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  אלמנטים בדפים (Page Elements)                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ משאבי הוראה                                           │  │
│  │   ☑ תוכניות לימודים    ☐ קישורי STEM                 │  │
│  │   ☑ טופס הצטיידות      ☑ שאל את המומחה               │  │
│  │                                                       │  │
│  │ דוחות                                                 │  │
│  │   ☑ סיכום    ☐ דפוסים    ☐ אתגרים    ☑ המלצות       │  │
│  │                                                       │  │
│  │ מודל פדגוגי                                           │  │
│  │   ☑ כרטיסי יחידות    ☑ פרטי יחידה                    │  │
│  │                                                       │  │
│  │ תיעודים                                               │  │
│  │   ☑ תמונות    ☑ טקסט    ☑ שם המורה                   │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│                                        [שמור שינויים]       │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation Plan

### New Files to Create

| File | Purpose |
|------|---------|
| `src/contexts/VisibilityContext.tsx` | Context provider with hooks |
| `src/lib/services/visibility.ts` | Firestore CRUD operations |
| `src/lib/constants/visibility-defaults.ts` | Default configuration values |
| `src/app/(dashboard)/[role]/display/page.tsx` | Admin settings page |
| `src/components/display/RoleTabs.tsx` | Role selector component |
| `src/components/display/DashboardSection.tsx` | Dashboard config UI |
| `src/components/display/SidebarSection.tsx` | Sidebar config UI |
| `src/components/display/PageElementsSection.tsx` | Page elements config UI |
| `src/components/display/DraggableCardList.tsx` | Reusable drag-and-drop list |

### Existing Files to Modify

| File | Changes |
|------|---------|
| `src/types/index.ts` | Add visibility-related types |
| `src/app/(dashboard)/layout.tsx` | Wrap with VisibilityProvider |
| `src/components/dashboard/Sidebar.tsx` | Use visibility config for links + add תצוגה link |
| `src/app/(dashboard)/[role]/page.tsx` | Use visibility config for cards + show intro |
| `src/app/(dashboard)/[role]/teaching-resources/[grade]/page.tsx` | Conditional element rendering |
| `src/app/(dashboard)/[role]/pedagogical/[grade]/page.tsx` | Conditional element rendering |
| `src/app/(dashboard)/[role]/documentation/[grade]/page.tsx` | Conditional element rendering |
| `src/app/(dashboard)/[role]/reports/[grade]/[unitId]/page.tsx` | Conditional element rendering |
| `package.json` | Add @dnd-kit/core and @dnd-kit/sortable |

### Dependencies to Add

```json
{
  "@dnd-kit/core": "^6.1.0",
  "@dnd-kit/sortable": "^8.0.0",
  "@dnd-kit/utilities": "^3.2.2"
}
```

---

## Migration Strategy

1. **No breaking changes** - System falls back to defaults when no config exists
2. **Gradual adoption** - Existing behavior preserved until admin makes changes
3. **Merge strategy** - New elements added in future get sensible defaults automatically

---

## Testing Considerations

1. **Default behavior** - Verify system works without any saved config
2. **Role switching** - Ensure each role sees correct content
3. **Edge cases** - All items hidden, empty intro, special characters in labels
4. **Persistence** - Config saves and loads correctly
5. **Real-time updates** - Changes reflect immediately after save

---

## Open Questions (Resolved)

1. ~~Should admin sidebar be configurable?~~ → No, fixed for safety
2. ~~Where to store config?~~ → Embedded in /settings/general
3. ~~UI layout approach?~~ → Role-first (select role, see all their settings)
4. ~~Can sidebar link names be edited?~~ → Yes
