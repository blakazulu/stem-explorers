# Visibility Control System - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Allow admins to control what dashboard cards, sidebar links, and page elements each role sees.

**Architecture:** New VisibilityContext fetches config from Firestore, provides helper functions (`canSee`, `getDashboardConfig`, `getSidebarConfig`). Components consume via hooks. Falls back to defaults when no config exists.

**Tech Stack:** Next.js 16, TypeScript, Firebase Firestore, @dnd-kit for drag-and-drop, Tailwind CSS

---

## Phase 1: Foundation (Types, Defaults, Service)

### Task 1.1: Add Visibility Types

**Files:**
- Modify: `src/types/index.ts`

**Step 1: Add the new types at the end of the file**

```typescript
// Visibility configuration types
export type ConfigurableRole = 'teacher' | 'parent' | 'student';

export interface VisibilityConfig {
  dashboards: Record<ConfigurableRole, DashboardConfig>;
  sidebars: Record<ConfigurableRole, SidebarConfig>;
  pageElements: Record<ConfigurableRole, PageElementsConfig>;
}

export interface DashboardConfig {
  intro: string;
  cards: DashboardCardConfig[];
}

export interface DashboardCardConfig {
  id: string;
  visible: boolean;
  order: number;
}

export interface SidebarConfig {
  links: SidebarLinkConfig[];
}

export interface SidebarLinkConfig {
  id: string;
  label: string;
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

**Step 2: Commit**

```bash
git add src/types/index.ts
git commit -m "feat(visibility): add visibility config types"
```

---

### Task 1.2: Create Default Configuration Constants

**Files:**
- Create: `src/lib/constants/visibility-defaults.ts`

**Step 1: Create the defaults file**

```typescript
import type { VisibilityConfig, DashboardConfig, SidebarConfig, PageElementsConfig } from "@/types";

// All possible dashboard cards with their metadata
export const ALL_DASHBOARD_CARDS = {
  pedagogical: { label: "מודל פדגוגי", description: "צפה ביחידות הלימוד" },
  "teaching-resources": { label: "משאבי הוראה", description: "תוכניות לימודים וקישורים" },
  responses: { label: "תגובות תלמידים", description: "צפה בתגובות התלמידים ליומן" },
  reports: { label: "דוחות", description: "צפה בדוחות AI" },
  forum: { label: "במה אישית", description: "שתפו רעיונות והתייעצו" },
  documentation: { label: "תיעודים", description: "צפה בתיעודי פעילויות" },
  journal: { label: "יומן חוקר", description: "המשך לכתוב ביומן החקר שלך" },
} as const;

// All possible sidebar links with their metadata
export const ALL_SIDEBAR_LINKS = {
  pedagogical: { defaultLabel: "מודל פדגוגי ומו\"פ", href: "/pedagogical" },
  "teaching-resources": { defaultLabel: "משאבי הוראה", href: "/teaching-resources" },
  documentation: { defaultLabel: "תיעודים", href: "/documentation" },
  journal: { defaultLabel: "יומן חוקר", href: "/journal" },
  reports: { defaultLabel: "דוחות", href: "/reports" },
  responses: { defaultLabel: "תגובות תלמידים", href: "/responses" },
  forum: { defaultLabel: "במה אישית", href: "/forum" },
} as const;

// Page element labels for admin UI
export const PAGE_ELEMENT_LABELS = {
  teachingResources: {
    _title: "משאבי הוראה",
    curricula: "תוכניות לימודים",
    stemLinks: "קישורי STEM",
    equipment: "טופס הצטיידות",
    experts: "שאל את המומחה",
  },
  reports: {
    _title: "דוחות",
    summary: "סיכום",
    patterns: "דפוסים",
    challenges: "אתגרים",
    suggestions: "המלצות",
  },
  pedagogical: {
    _title: "מודל פדגוגי",
    unitCards: "כרטיסי יחידות",
    unitDetails: "פרטי יחידה",
  },
  documentation: {
    _title: "תיעודים",
    images: "תמונות",
    text: "טקסט",
    teacherName: "שם המורה",
  },
} as const;

const DEFAULT_TEACHER_DASHBOARD: DashboardConfig = {
  intro: "",
  cards: [
    { id: "pedagogical", visible: true, order: 0 },
    { id: "teaching-resources", visible: true, order: 1 },
    { id: "responses", visible: true, order: 2 },
    { id: "reports", visible: true, order: 3 },
    { id: "forum", visible: true, order: 4 },
    { id: "documentation", visible: true, order: 5 },
  ],
};

const DEFAULT_PARENT_DASHBOARD: DashboardConfig = {
  intro: "",
  cards: [
    { id: "pedagogical", visible: true, order: 0 },
    { id: "reports", visible: true, order: 1 },
    { id: "documentation", visible: true, order: 2 },
  ],
};

const DEFAULT_STUDENT_DASHBOARD: DashboardConfig = {
  intro: "",
  cards: [
    { id: "journal", visible: true, order: 0 },
    { id: "pedagogical", visible: true, order: 1 },
    { id: "documentation", visible: true, order: 2 },
  ],
};

const DEFAULT_TEACHER_SIDEBAR: SidebarConfig = {
  links: [
    { id: "pedagogical", label: "מודל פדגוגי ומו\"פ", visible: true },
    { id: "teaching-resources", label: "משאבי הוראה", visible: true },
    { id: "documentation", label: "תיעודים", visible: true },
    { id: "reports", label: "דוחות", visible: true },
    { id: "responses", label: "תגובות תלמידים", visible: true },
    { id: "forum", label: "במה אישית", visible: true },
  ],
};

const DEFAULT_PARENT_SIDEBAR: SidebarConfig = {
  links: [
    { id: "pedagogical", label: "מודל פדגוגי ומו\"פ", visible: true },
    { id: "documentation", label: "תיעודים", visible: true },
    { id: "reports", label: "דוחות", visible: true },
  ],
};

const DEFAULT_STUDENT_SIDEBAR: SidebarConfig = {
  links: [
    { id: "pedagogical", label: "מודל פדגוגי ומו\"פ", visible: true },
    { id: "journal", label: "יומן חוקר", visible: true },
    { id: "documentation", label: "תיעודים", visible: true },
  ],
};

const DEFAULT_TEACHER_PAGE_ELEMENTS: PageElementsConfig = {
  teachingResources: { curricula: true, stemLinks: true, equipment: true, experts: true },
  reports: { summary: true, patterns: true, challenges: true, suggestions: true },
  pedagogical: { unitCards: true, unitDetails: true },
  documentation: { images: true, text: true, teacherName: true },
};

const DEFAULT_PARENT_PAGE_ELEMENTS: PageElementsConfig = {
  teachingResources: { curricula: true, stemLinks: false, equipment: false, experts: true },
  reports: { summary: true, patterns: false, challenges: false, suggestions: true },
  pedagogical: { unitCards: true, unitDetails: true },
  documentation: { images: true, text: true, teacherName: true },
};

const DEFAULT_STUDENT_PAGE_ELEMENTS: PageElementsConfig = {
  teachingResources: { curricula: false, stemLinks: false, equipment: false, experts: false },
  reports: { summary: false, patterns: false, challenges: false, suggestions: false },
  pedagogical: { unitCards: true, unitDetails: true },
  documentation: { images: true, text: true, teacherName: false },
};

export const DEFAULT_VISIBILITY_CONFIG: VisibilityConfig = {
  dashboards: {
    teacher: DEFAULT_TEACHER_DASHBOARD,
    parent: DEFAULT_PARENT_DASHBOARD,
    student: DEFAULT_STUDENT_DASHBOARD,
  },
  sidebars: {
    teacher: DEFAULT_TEACHER_SIDEBAR,
    parent: DEFAULT_PARENT_SIDEBAR,
    student: DEFAULT_STUDENT_SIDEBAR,
  },
  pageElements: {
    teacher: DEFAULT_TEACHER_PAGE_ELEMENTS,
    parent: DEFAULT_PARENT_PAGE_ELEMENTS,
    student: DEFAULT_STUDENT_PAGE_ELEMENTS,
  },
};
```

**Step 2: Commit**

```bash
git add src/lib/constants/visibility-defaults.ts
git commit -m "feat(visibility): add default configuration constants"
```

---

### Task 1.3: Create Visibility Service

**Files:**
- Create: `src/lib/services/visibility.ts`

**Step 1: Create the service file**

```typescript
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { handleFirebaseError } from "@/lib/utils/errors";
import type { VisibilityConfig } from "@/types";
import { DEFAULT_VISIBILITY_CONFIG } from "@/lib/constants/visibility-defaults";

const SETTINGS_DOC = "settings";
const VISIBILITY_DOC_ID = "visibility";

/**
 * Fetches visibility config from Firestore.
 * Returns null if no config exists (will use defaults).
 */
export async function getVisibilityConfig(): Promise<VisibilityConfig | null> {
  try {
    const docRef = doc(db, SETTINGS_DOC, VISIBILITY_DOC_ID);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    return docSnap.data() as VisibilityConfig;
  } catch (error) {
    handleFirebaseError(error, "getVisibilityConfig");
    throw error;
  }
}

/**
 * Saves visibility config to Firestore.
 */
export async function saveVisibilityConfig(config: VisibilityConfig): Promise<void> {
  try {
    await setDoc(doc(db, SETTINGS_DOC, VISIBILITY_DOC_ID), config);
  } catch (error) {
    handleFirebaseError(error, "saveVisibilityConfig");
    throw error;
  }
}

/**
 * Merges saved config with defaults to handle new features gracefully.
 * If saved config is missing properties, they get filled from defaults.
 */
export function mergeWithDefaults(saved: VisibilityConfig | null): VisibilityConfig {
  if (!saved) return DEFAULT_VISIBILITY_CONFIG;

  const merged: VisibilityConfig = {
    dashboards: {
      teacher: { ...DEFAULT_VISIBILITY_CONFIG.dashboards.teacher, ...saved.dashboards?.teacher },
      parent: { ...DEFAULT_VISIBILITY_CONFIG.dashboards.parent, ...saved.dashboards?.parent },
      student: { ...DEFAULT_VISIBILITY_CONFIG.dashboards.student, ...saved.dashboards?.student },
    },
    sidebars: {
      teacher: { ...DEFAULT_VISIBILITY_CONFIG.sidebars.teacher, ...saved.sidebars?.teacher },
      parent: { ...DEFAULT_VISIBILITY_CONFIG.sidebars.parent, ...saved.sidebars?.parent },
      student: { ...DEFAULT_VISIBILITY_CONFIG.sidebars.student, ...saved.sidebars?.student },
    },
    pageElements: {
      teacher: {
        ...DEFAULT_VISIBILITY_CONFIG.pageElements.teacher,
        ...saved.pageElements?.teacher,
        teachingResources: { ...DEFAULT_VISIBILITY_CONFIG.pageElements.teacher.teachingResources, ...saved.pageElements?.teacher?.teachingResources },
        reports: { ...DEFAULT_VISIBILITY_CONFIG.pageElements.teacher.reports, ...saved.pageElements?.teacher?.reports },
        pedagogical: { ...DEFAULT_VISIBILITY_CONFIG.pageElements.teacher.pedagogical, ...saved.pageElements?.teacher?.pedagogical },
        documentation: { ...DEFAULT_VISIBILITY_CONFIG.pageElements.teacher.documentation, ...saved.pageElements?.teacher?.documentation },
      },
      parent: {
        ...DEFAULT_VISIBILITY_CONFIG.pageElements.parent,
        ...saved.pageElements?.parent,
        teachingResources: { ...DEFAULT_VISIBILITY_CONFIG.pageElements.parent.teachingResources, ...saved.pageElements?.parent?.teachingResources },
        reports: { ...DEFAULT_VISIBILITY_CONFIG.pageElements.parent.reports, ...saved.pageElements?.parent?.reports },
        pedagogical: { ...DEFAULT_VISIBILITY_CONFIG.pageElements.parent.pedagogical, ...saved.pageElements?.parent?.pedagogical },
        documentation: { ...DEFAULT_VISIBILITY_CONFIG.pageElements.parent.documentation, ...saved.pageElements?.parent?.documentation },
      },
      student: {
        ...DEFAULT_VISIBILITY_CONFIG.pageElements.student,
        ...saved.pageElements?.student,
        teachingResources: { ...DEFAULT_VISIBILITY_CONFIG.pageElements.student.teachingResources, ...saved.pageElements?.student?.teachingResources },
        reports: { ...DEFAULT_VISIBILITY_CONFIG.pageElements.student.reports, ...saved.pageElements?.student?.reports },
        pedagogical: { ...DEFAULT_VISIBILITY_CONFIG.pageElements.student.pedagogical, ...saved.pageElements?.student?.pedagogical },
        documentation: { ...DEFAULT_VISIBILITY_CONFIG.pageElements.student.documentation, ...saved.pageElements?.student?.documentation },
      },
    },
  };

  return merged;
}
```

**Step 2: Commit**

```bash
git add src/lib/services/visibility.ts
git commit -m "feat(visibility): add Firestore service for visibility config"
```

---

### Task 1.4: Create Visibility Context

**Files:**
- Create: `src/contexts/VisibilityContext.tsx`

**Step 1: Create the context file**

```typescript
"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { VisibilityConfig, ConfigurableRole, DashboardConfig, SidebarConfig, PageElementsConfig } from "@/types";
import { getVisibilityConfig, mergeWithDefaults } from "@/lib/services/visibility";
import { DEFAULT_VISIBILITY_CONFIG } from "@/lib/constants/visibility-defaults";

interface VisibilityContextValue {
  config: VisibilityConfig;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  getDashboardConfig: (role: ConfigurableRole) => DashboardConfig;
  getSidebarConfig: (role: ConfigurableRole) => SidebarConfig;
  getPageElements: <K extends keyof PageElementsConfig>(role: ConfigurableRole, page: K) => PageElementsConfig[K];
  canSee: (role: ConfigurableRole, page: keyof PageElementsConfig, element: string) => boolean;
}

const VisibilityContext = createContext<VisibilityContextValue | null>(null);

export function VisibilityProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<VisibilityConfig>(DEFAULT_VISIBILITY_CONFIG);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchConfig = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const saved = await getVisibilityConfig();
      const merged = mergeWithDefaults(saved);
      setConfig(merged);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load visibility config"));
      // On error, use defaults
      setConfig(DEFAULT_VISIBILITY_CONFIG);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const getDashboardConfig = useCallback(
    (role: ConfigurableRole): DashboardConfig => {
      return config.dashboards[role] || DEFAULT_VISIBILITY_CONFIG.dashboards[role];
    },
    [config]
  );

  const getSidebarConfig = useCallback(
    (role: ConfigurableRole): SidebarConfig => {
      return config.sidebars[role] || DEFAULT_VISIBILITY_CONFIG.sidebars[role];
    },
    [config]
  );

  const getPageElements = useCallback(
    <K extends keyof PageElementsConfig>(role: ConfigurableRole, page: K): PageElementsConfig[K] => {
      return config.pageElements[role]?.[page] || DEFAULT_VISIBILITY_CONFIG.pageElements[role][page];
    },
    [config]
  );

  const canSee = useCallback(
    (role: ConfigurableRole, page: keyof PageElementsConfig, element: string): boolean => {
      const pageConfig = config.pageElements[role]?.[page];
      if (!pageConfig) return true; // Default to visible if no config
      return (pageConfig as Record<string, boolean>)[element] ?? true;
    },
    [config]
  );

  return (
    <VisibilityContext.Provider
      value={{
        config,
        isLoading,
        error,
        refetch: fetchConfig,
        getDashboardConfig,
        getSidebarConfig,
        getPageElements,
        canSee,
      }}
    >
      {children}
    </VisibilityContext.Provider>
  );
}

export function useVisibility(): VisibilityContextValue {
  const context = useContext(VisibilityContext);
  if (!context) {
    throw new Error("useVisibility must be used within a VisibilityProvider");
  }
  return context;
}
```

**Step 2: Commit**

```bash
git add src/contexts/VisibilityContext.tsx
git commit -m "feat(visibility): add VisibilityContext provider and hooks"
```

---

### Task 1.5: Integrate VisibilityProvider into Layout

**Files:**
- Modify: `src/app/(dashboard)/layout.tsx`

**Step 1: Add import at top of file (after existing imports)**

```typescript
import { VisibilityProvider } from "@/contexts/VisibilityContext";
```

**Step 2: Wrap children with VisibilityProvider (inside ThemeProvider)**

Find this section:
```tsx
return (
    <ThemeProvider>
      <ToastProvider>
```

Change the return to:
```tsx
return (
    <ThemeProvider>
      <VisibilityProvider>
        <ToastProvider>
```

And at the end, close the provider:
```tsx
        </ToastProvider>
      </VisibilityProvider>
    </ThemeProvider>
```

**Step 3: Commit**

```bash
git add src/app/(dashboard)/layout.tsx
git commit -m "feat(visibility): integrate VisibilityProvider into dashboard layout"
```

---

## Phase 2: Consume Visibility in Components

### Task 2.1: Update Sidebar to Use Visibility Config

**Files:**
- Modify: `src/components/dashboard/Sidebar.tsx`

**Step 1: Add imports**

Add after existing imports:
```typescript
import { useVisibility } from "@/contexts/VisibilityContext";
import type { ConfigurableRole } from "@/types";
import { Eye } from "lucide-react";
```

**Step 2: Add "תצוגה" to admin navItems**

Find the `navItems` array and add after the `settings` item:
```typescript
  { label: "תצוגה", href: "/display", roles: ["admin"], icon: Eye },
```

**Step 3: Update Sidebar component to use visibility config**

Inside the `Sidebar` function, after getting the session and theme, add:
```typescript
  const { getSidebarConfig, isLoading: visibilityLoading } = useVisibility();
```

Then update how `visibleItems` is calculated. Replace:
```typescript
  const visibleItems = navItems.filter((item) => role && item.roles.includes(role));
```

With:
```typescript
  // For admin, show all items they have access to (fixed sidebar)
  // For other roles, filter based on visibility config
  const visibleItems = navItems.filter((item) => {
    if (!role || !item.roles.includes(role)) return false;

    // Admin items are always shown (admin sidebar is fixed)
    if (role === "admin") return true;

    // For configurable roles, check visibility config
    const configurableRole = role as ConfigurableRole;
    const sidebarConfig = getSidebarConfig(configurableRole);
    const linkConfig = sidebarConfig.links.find(l => l.id === item.href.slice(1));

    // If no config for this link, show it (backwards compatibility)
    if (!linkConfig) return true;

    return linkConfig.visible;
  });

  // Get custom labels for sidebar items (non-admin roles only)
  const getCustomLabel = (item: NavItem): string => {
    if (role === "admin") return item.label;

    const configurableRole = role as ConfigurableRole;
    const sidebarConfig = getSidebarConfig(configurableRole);
    const linkConfig = sidebarConfig.links.find(l => l.id === item.href.slice(1));

    return linkConfig?.label || item.label;
  };
```

**Step 4: Update link rendering to use custom labels**

In both `mainItems.map` and `adminItems.map`, replace:
```tsx
<span>{item.label}</span>
```

With:
```tsx
<span>{getCustomLabel(item)}</span>
```

**Step 5: Commit**

```bash
git add src/components/dashboard/Sidebar.tsx
git commit -m "feat(visibility): update Sidebar to use visibility config + add display link"
```

---

### Task 2.2: Update Dashboard Page to Use Visibility Config

**Files:**
- Modify: `src/app/(dashboard)/[role]/page.tsx`

**Step 1: Add imports**

Add after existing imports:
```typescript
import { useVisibility } from "@/contexts/VisibilityContext";
import type { ConfigurableRole } from "@/types";
```

**Step 2: Create a card metadata map**

Add after the imports, before the `QuickAction` interface:
```typescript
// Card metadata - icons, colors, hrefs
const CARD_METADATA: Record<string, { icon: LucideIcon; color: string; href: string }> = {
  pedagogical: { icon: BookOpen, color: "bg-primary", href: "/pedagogical" },
  "teaching-resources": { icon: FileText, color: "bg-primary", href: "/teaching-resources" },
  responses: { icon: Users, color: "bg-secondary", href: "/responses" },
  reports: { icon: BarChart2, color: "bg-accent", href: "/reports" },
  forum: { icon: MessageSquare, color: "bg-secondary", href: "/forum" },
  documentation: { icon: Image, color: "bg-secondary", href: "/documentation" },
  journal: { icon: PenTool, color: "bg-role-student", href: "/journal" },
  questions: { icon: HelpCircle, color: "bg-role-admin", href: "/questions" },
  passwords: { icon: Key, color: "bg-primary", href: "/passwords" },
  settings: { icon: Settings, color: "bg-secondary", href: "/settings" },
};
```

**Step 3: Update the component to use visibility config**

Inside `RoleDashboardPage`, after getting `roleStyles`, add:
```typescript
  const { getDashboardConfig, isLoading: visibilityLoading } = useVisibility();
```

**Step 4: Replace hardcoded quickActions with dynamic cards**

Replace:
```typescript
  const quickActions = quickActionsByRole[role];
```

With:
```typescript
  // Admin uses hardcoded actions (not configurable)
  // Other roles use visibility config
  const quickActions: QuickAction[] = role === "admin"
    ? quickActionsByRole.admin
    : (() => {
        const configurableRole = role as ConfigurableRole;
        const dashboardConfig = getDashboardConfig(configurableRole);

        return dashboardConfig.cards
          .filter(card => card.visible)
          .sort((a, b) => a.order - b.order)
          .map(card => {
            const metadata = CARD_METADATA[card.id];
            // Get label from ALL_DASHBOARD_CARDS if available
            const cardInfo = quickActionsByRole[role]?.find(a => a.href === `/${card.id}` || a.href.endsWith(`/${card.id}`));

            return {
              label: cardInfo?.label || card.id,
              description: cardInfo?.description || "",
              href: metadata?.href || `/${card.id}`,
              icon: metadata?.icon || BookOpen,
              color: metadata?.color || "bg-primary",
            };
          });
      })();

  // Get dashboard intro text
  const dashboardIntro = role !== "admin"
    ? getDashboardConfig(role as ConfigurableRole).intro
    : "";
```

**Step 5: Add intro text display**

After `<WelcomeHeader role={role} />`, add:
```tsx
      {/* Dashboard Intro - from visibility config */}
      {dashboardIntro && (
        <div className="bg-surface-1 border border-surface-2 rounded-xl p-4 text-gray-600">
          {dashboardIntro}
        </div>
      )}
```

**Step 6: Commit**

```bash
git add src/app/(dashboard)/[role]/page.tsx
git commit -m "feat(visibility): update Dashboard to use visibility config + show intro"
```

---

### Task 2.3: Update Teaching Resources Page to Use Visibility Config

**Files:**
- Modify: `src/app/(dashboard)/[role]/teaching-resources/[grade]/page.tsx`

**Step 1: Add imports**

Add after existing imports:
```typescript
import { useVisibility } from "@/contexts/VisibilityContext";
import type { ConfigurableRole } from "@/types";
```

**Step 2: Use visibility in component**

Inside the component, after the state declarations, add:
```typescript
  const { canSee } = useVisibility();
  const configurableRole = (role === "admin" ? "teacher" : role) as ConfigurableRole;
```

**Step 3: Filter resources based on visibility**

Replace the `resources` array definition with:
```typescript
  const allResources = [
    {
      id: "curricula",
      visibilityKey: "curricula",
      title: "תוכניות לימודים",
      description: "יחידות הלימוד, קבצים ומשאבים לכל נושא",
      icon: BookOpen,
      href: `/${role}/teaching-resources/${encodeURIComponent(grade)}/curricula`,
      featured: true,
      gradient: "from-primary via-primary/80 to-secondary",
      iconBg: "bg-white/20",
    },
    {
      id: "stem-links",
      visibilityKey: "stemLinks",
      title: "קישורים STEM",
      description: "אוסף קישורים שימושיים",
      icon: Link2,
      onClick: () => setStemLinksOpen(true),
      featured: false,
      gradient: "from-emerald-700 to-teal-700",
      iconBg: "bg-white/20",
    },
    {
      id: "equipment-form",
      visibilityKey: "equipment",
      title: "טופס הצטיידות",
      description: "בקשה למשאבי למידה",
      icon: ClipboardList,
      onClick: () => setEquipmentFormOpen(true),
      featured: false,
      gradient: "from-amber-700 to-orange-700",
      iconBg: "bg-white/20",
    },
  ];

  // Filter resources based on visibility config (admin sees everything)
  const resources = role === "admin"
    ? allResources
    : allResources.filter(r => canSee(configurableRole, "teachingResources", r.visibilityKey));
```

**Step 4: Conditionally render ExpertsSection**

Replace:
```tsx
      {/* Experts Section */}
      <ExpertsSection grade={grade} isAdmin={isAdmin} />
```

With:
```tsx
      {/* Experts Section - controlled by visibility */}
      {(role === "admin" || canSee(configurableRole, "teachingResources", "experts")) && (
        <ExpertsSection grade={grade} isAdmin={isAdmin} />
      )}
```

**Step 5: Commit**

```bash
git add src/app/(dashboard)/[role]/teaching-resources/[grade]/page.tsx
git commit -m "feat(visibility): update TeachingResources to use visibility config"
```

---

## Phase 3: Admin Display Settings Page

### Task 3.1: Install dnd-kit Dependencies

**Step 1: Install packages**

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

**Step 2: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add @dnd-kit dependencies for drag-and-drop"
```

---

### Task 3.2: Create RoleTabs Component

**Files:**
- Create: `src/components/display/RoleTabs.tsx`

**Step 1: Create the component**

```typescript
"use client";

import type { ConfigurableRole } from "@/types";

interface RoleTabsProps {
  selectedRole: ConfigurableRole;
  onRoleChange: (role: ConfigurableRole) => void;
}

const ROLES: { id: ConfigurableRole; label: string }[] = [
  { id: "teacher", label: "מורה" },
  { id: "parent", label: "הורה" },
  { id: "student", label: "תלמיד" },
];

export function RoleTabs({ selectedRole, onRoleChange }: RoleTabsProps) {
  return (
    <div className="flex gap-2 p-1 bg-surface-1 rounded-xl">
      {ROLES.map((role) => (
        <button
          key={role.id}
          onClick={() => onRoleChange(role.id)}
          className={`
            flex-1 px-4 py-2 rounded-lg font-medium transition-all cursor-pointer
            ${
              selectedRole === role.id
                ? "bg-primary text-white shadow-md"
                : "text-gray-600 hover:bg-surface-2"
            }
          `}
        >
          {role.label}
        </button>
      ))}
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/display/RoleTabs.tsx
git commit -m "feat(visibility): add RoleTabs component"
```

---

### Task 3.3: Create DraggableCardList Component

**Files:**
- Create: `src/components/display/DraggableCardList.tsx`

**Step 1: Create the component**

```typescript
"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import type { DashboardCardConfig } from "@/types";

interface DraggableCardListProps {
  cards: DashboardCardConfig[];
  cardLabels: Record<string, string>;
  onChange: (cards: DashboardCardConfig[]) => void;
}

interface SortableItemProps {
  card: DashboardCardConfig;
  label: string;
  onToggle: (id: string) => void;
}

function SortableItem({ card, label, onToggle }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        flex items-center gap-3 p-3 bg-white border rounded-lg
        ${isDragging ? "shadow-lg border-primary z-10" : "border-surface-2"}
        ${!card.visible ? "opacity-50" : ""}
      `}
    >
      <button
        {...attributes}
        {...listeners}
        className="p-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
        aria-label="גרור לשינוי סדר"
      >
        <GripVertical size={20} />
      </button>

      <label className="flex items-center gap-3 flex-1 cursor-pointer">
        <input
          type="checkbox"
          checked={card.visible}
          onChange={() => onToggle(card.id)}
          className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
        />
        <span className={card.visible ? "text-foreground" : "text-gray-400"}>
          {label}
        </span>
      </label>

      {!card.visible && (
        <span className="text-xs text-gray-400">(מוסתר)</span>
      )}
    </div>
  );
}

export function DraggableCardList({ cards, cardLabels, onChange }: DraggableCardListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = cards.findIndex((c) => c.id === active.id);
      const newIndex = cards.findIndex((c) => c.id === over.id);

      const newCards = arrayMove(cards, oldIndex, newIndex).map((card, index) => ({
        ...card,
        order: index,
      }));

      onChange(newCards);
    }
  };

  const handleToggle = (id: string) => {
    const newCards = cards.map((card) =>
      card.id === id ? { ...card, visible: !card.visible } : card
    );
    onChange(newCards);
  };

  // Sort cards by order for display
  const sortedCards = [...cards].sort((a, b) => a.order - b.order);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={sortedCards.map((c) => c.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2">
          {sortedCards.map((card) => (
            <SortableItem
              key={card.id}
              card={card}
              label={cardLabels[card.id] || card.id}
              onToggle={handleToggle}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/display/DraggableCardList.tsx
git commit -m "feat(visibility): add DraggableCardList component with dnd-kit"
```

---

### Task 3.4: Create DashboardSection Component

**Files:**
- Create: `src/components/display/DashboardSection.tsx`

**Step 1: Create the component**

```typescript
"use client";

import { DraggableCardList } from "./DraggableCardList";
import type { DashboardConfig, ConfigurableRole } from "@/types";
import { ALL_DASHBOARD_CARDS } from "@/lib/constants/visibility-defaults";

interface DashboardSectionProps {
  role: ConfigurableRole;
  config: DashboardConfig;
  onChange: (config: DashboardConfig) => void;
}

export function DashboardSection({ role, config, onChange }: DashboardSectionProps) {
  const cardLabels = Object.fromEntries(
    Object.entries(ALL_DASHBOARD_CARDS).map(([id, meta]) => [id, meta.label])
  );

  return (
    <div className="space-y-6">
      {/* Dashboard Intro */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          תיאור לוח הבקרה
        </label>
        <textarea
          value={config.intro}
          onChange={(e) => onChange({ ...config, intro: e.target.value })}
          placeholder="טקסט פתיחה שיוצג בראש לוח הבקרה..."
          rows={3}
          className="w-full px-3 py-2 border border-surface-2 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
          dir="rtl"
        />
        <p className="mt-1 text-xs text-gray-400">
          הטקסט יוצג מעל הכרטיסים בלוח הבקרה
        </p>
      </div>

      {/* Dashboard Cards */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          כרטיסי לוח בקרה
        </label>
        <p className="text-xs text-gray-400 mb-3">
          גרור לשינוי סדר, סמן/בטל סימון להצגה/הסתרה
        </p>
        <DraggableCardList
          cards={config.cards}
          cardLabels={cardLabels}
          onChange={(cards) => onChange({ ...config, cards })}
        />
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/display/DashboardSection.tsx
git commit -m "feat(visibility): add DashboardSection component"
```

---

### Task 3.5: Create SidebarSection Component

**Files:**
- Create: `src/components/display/SidebarSection.tsx`

**Step 1: Create the component**

```typescript
"use client";

import type { SidebarConfig, ConfigurableRole } from "@/types";

interface SidebarSectionProps {
  role: ConfigurableRole;
  config: SidebarConfig;
  onChange: (config: SidebarConfig) => void;
}

export function SidebarSection({ role, config, onChange }: SidebarSectionProps) {
  const handleToggle = (id: string) => {
    const newLinks = config.links.map((link) =>
      link.id === id ? { ...link, visible: !link.visible } : link
    );
    onChange({ ...config, links: newLinks });
  };

  const handleLabelChange = (id: string, label: string) => {
    const newLinks = config.links.map((link) =>
      link.id === id ? { ...link, label } : link
    );
    onChange({ ...config, links: newLinks });
  };

  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-2">
        קישורי תפריט
      </label>
      <p className="text-xs text-gray-400 mb-3">
        סמן/בטל סימון להצגה/הסתרה, ערוך את שם הקישור
      </p>

      <div className="space-y-2">
        {config.links.map((link) => (
          <div
            key={link.id}
            className={`
              flex items-center gap-3 p-3 bg-white border rounded-lg
              ${!link.visible ? "opacity-50 border-surface-2" : "border-surface-2"}
            `}
          >
            <input
              type="checkbox"
              checked={link.visible}
              onChange={() => handleToggle(link.id)}
              className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
            />

            <input
              type="text"
              value={link.label}
              onChange={(e) => handleLabelChange(link.id, e.target.value)}
              className={`
                flex-1 px-2 py-1 border rounded focus:ring-2 focus:ring-primary/20 focus:border-primary
                ${link.visible ? "border-surface-2" : "border-transparent bg-surface-1"}
              `}
              dir="rtl"
            />

            {!link.visible && (
              <span className="text-xs text-gray-400">(מוסתר)</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/display/SidebarSection.tsx
git commit -m "feat(visibility): add SidebarSection component"
```

---

### Task 3.6: Create PageElementsSection Component

**Files:**
- Create: `src/components/display/PageElementsSection.tsx`

**Step 1: Create the component**

```typescript
"use client";

import type { PageElementsConfig, ConfigurableRole } from "@/types";
import { PAGE_ELEMENT_LABELS } from "@/lib/constants/visibility-defaults";

interface PageElementsSectionProps {
  role: ConfigurableRole;
  config: PageElementsConfig;
  onChange: (config: PageElementsConfig) => void;
}

type PageKey = keyof PageElementsConfig;

export function PageElementsSection({ role, config, onChange }: PageElementsSectionProps) {
  const handleToggle = (page: PageKey, element: string) => {
    const pageConfig = config[page] as Record<string, boolean>;
    const newPageConfig = {
      ...pageConfig,
      [element]: !pageConfig[element],
    };
    onChange({
      ...config,
      [page]: newPageConfig,
    });
  };

  const pages: PageKey[] = ["teachingResources", "reports", "pedagogical", "documentation"];

  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-2">
        אלמנטים בדפים
      </label>
      <p className="text-xs text-gray-400 mb-3">
        בחר אילו אלמנטים יוצגו בכל דף
      </p>

      <div className="space-y-4">
        {pages.map((pageKey) => {
          const labels = PAGE_ELEMENT_LABELS[pageKey];
          const pageConfig = config[pageKey] as Record<string, boolean>;
          const elements = Object.keys(pageConfig);

          return (
            <div key={pageKey} className="p-4 bg-white border border-surface-2 rounded-lg">
              <h4 className="font-medium text-foreground mb-3">
                {labels._title}
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {elements.map((element) => (
                  <label
                    key={element}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={pageConfig[element]}
                      onChange={() => handleToggle(pageKey, element)}
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                    />
                    <span className={pageConfig[element] ? "text-foreground" : "text-gray-400"}>
                      {labels[element as keyof typeof labels] || element}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/display/PageElementsSection.tsx
git commit -m "feat(visibility): add PageElementsSection component"
```

---

### Task 3.7: Create Display Settings Page

**Files:**
- Create: `src/app/(dashboard)/[role]/display/page.tsx`

**Step 1: Create the page**

```typescript
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useVisibility } from "@/contexts/VisibilityContext";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { RoleTabs } from "@/components/display/RoleTabs";
import { DashboardSection } from "@/components/display/DashboardSection";
import { SidebarSection } from "@/components/display/SidebarSection";
import { PageElementsSection } from "@/components/display/PageElementsSection";
import { saveVisibilityConfig } from "@/lib/services/visibility";
import { Eye, Save } from "lucide-react";
import type { ConfigurableRole, VisibilityConfig } from "@/types";

export default function DisplaySettingsPage() {
  const { session } = useAuth();
  const params = useParams();
  const router = useRouter();
  const { config: savedConfig, isLoading, refetch } = useVisibility();
  const { showToast } = useToast();

  const [selectedRole, setSelectedRole] = useState<ConfigurableRole>("teacher");
  const [localConfig, setLocalConfig] = useState<VisibilityConfig | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Redirect non-admins
  useEffect(() => {
    if (session && session.user.role !== "admin") {
      router.replace(`/${session.user.role}`);
    }
  }, [session, router]);

  // Initialize local config from saved config
  useEffect(() => {
    if (savedConfig && !localConfig) {
      setLocalConfig(savedConfig);
    }
  }, [savedConfig, localConfig]);

  // Track changes
  useEffect(() => {
    if (localConfig && savedConfig) {
      setHasChanges(JSON.stringify(localConfig) !== JSON.stringify(savedConfig));
    }
  }, [localConfig, savedConfig]);

  const handleSave = async () => {
    if (!localConfig) return;

    setIsSaving(true);
    try {
      await saveVisibilityConfig(localConfig);
      await refetch();
      setHasChanges(false);
      showToast("success", "הגדרות התצוגה נשמרו בהצלחה");
    } catch (error) {
      console.error("Failed to save visibility config:", error);
      showToast("error", "שגיאה בשמירת ההגדרות");
    } finally {
      setIsSaving(false);
    }
  };

  const updateDashboard = (dashboardConfig: VisibilityConfig["dashboards"][ConfigurableRole]) => {
    if (!localConfig) return;
    setLocalConfig({
      ...localConfig,
      dashboards: {
        ...localConfig.dashboards,
        [selectedRole]: dashboardConfig,
      },
    });
  };

  const updateSidebar = (sidebarConfig: VisibilityConfig["sidebars"][ConfigurableRole]) => {
    if (!localConfig) return;
    setLocalConfig({
      ...localConfig,
      sidebars: {
        ...localConfig.sidebars,
        [selectedRole]: sidebarConfig,
      },
    });
  };

  const updatePageElements = (pageElementsConfig: VisibilityConfig["pageElements"][ConfigurableRole]) => {
    if (!localConfig) return;
    setLocalConfig({
      ...localConfig,
      pageElements: {
        ...localConfig.pageElements,
        [selectedRole]: pageElementsConfig,
      },
    });
  };

  if (session?.user.role !== "admin") {
    return null;
  }

  if (isLoading || !localConfig) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Skeleton variant="text" width={200} height={32} />
        <Skeleton variant="card" height={60} />
        <Skeleton variant="card" height={300} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Eye size={24} className="text-primary" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-rubik font-bold text-foreground">
              תצוגה
            </h1>
            <p className="text-sm text-gray-500">
              התאם את התצוגה לכל תפקיד
            </p>
          </div>
        </div>

        <Button
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
          loading={isSaving}
        >
          <Save size={18} className="ml-2" />
          שמור שינויים
        </Button>
      </div>

      {/* Role Tabs */}
      <RoleTabs selectedRole={selectedRole} onRoleChange={setSelectedRole} />

      {/* Configuration Sections */}
      <div className="space-y-6">
        {/* Dashboard Section */}
        <Card padding="lg">
          <DashboardSection
            role={selectedRole}
            config={localConfig.dashboards[selectedRole]}
            onChange={updateDashboard}
          />
        </Card>

        {/* Sidebar Section */}
        <Card padding="lg">
          <SidebarSection
            role={selectedRole}
            config={localConfig.sidebars[selectedRole]}
            onChange={updateSidebar}
          />
        </Card>

        {/* Page Elements Section */}
        <Card padding="lg">
          <PageElementsSection
            role={selectedRole}
            config={localConfig.pageElements[selectedRole]}
            onChange={updatePageElements}
          />
        </Card>
      </div>

      {/* Unsaved Changes Warning */}
      {hasChanges && (
        <div className="fixed bottom-4 right-4 left-4 md:right-auto md:left-auto md:w-96 bg-amber-50 border border-amber-200 rounded-lg p-4 shadow-lg">
          <p className="text-amber-800 text-sm">
            יש שינויים שלא נשמרו. לחץ על &quot;שמור שינויים&quot; לשמירה.
          </p>
        </div>
      )}
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/app/(dashboard)/[role]/display/page.tsx
git commit -m "feat(visibility): add Display settings page for admin"
```

---

## Phase 4: Update Remaining Pages for Element Visibility

### Task 4.1: Update Documentation Page

**Files:**
- Find and modify: `src/app/(dashboard)/[role]/documentation/[grade]/page.tsx` or similar

**Step 1: Add visibility imports and usage**

Add imports:
```typescript
import { useVisibility } from "@/contexts/VisibilityContext";
import type { ConfigurableRole } from "@/types";
```

Inside the component:
```typescript
const { canSee } = useVisibility();
const configurableRole = (role === "admin" ? "teacher" : role) as ConfigurableRole;
```

**Step 2: Conditionally render elements based on visibility**

Wrap elements that should be configurable:
- Images section: `{canSee(configurableRole, "documentation", "images") && <ImagesSection />}`
- Text section: `{canSee(configurableRole, "documentation", "text") && <TextSection />}`
- Teacher name: `{canSee(configurableRole, "documentation", "teacherName") && <TeacherName />}`

**Step 3: Commit**

```bash
git add src/app/(dashboard)/[role]/documentation/
git commit -m "feat(visibility): add element visibility to Documentation page"
```

---

### Task 4.2: Update Reports Page

**Files:**
- Find and modify: `src/app/(dashboard)/[role]/reports/[grade]/[unitId]/page.tsx` or similar

**Step 1: Add visibility imports and usage**

Same pattern as Task 4.1.

**Step 2: Conditionally render report sections**

- Summary: `{canSee(configurableRole, "reports", "summary") && <SummarySection />}`
- Patterns: `{canSee(configurableRole, "reports", "patterns") && <PatternsSection />}`
- Challenges: `{canSee(configurableRole, "reports", "challenges") && <ChallengesSection />}`
- Suggestions: `{canSee(configurableRole, "reports", "suggestions") && <SuggestionsSection />}`

**Step 3: Commit**

```bash
git add src/app/(dashboard)/[role]/reports/
git commit -m "feat(visibility): add element visibility to Reports page"
```

---

### Task 4.3: Update Pedagogical Page

**Files:**
- Find and modify: `src/app/(dashboard)/[role]/pedagogical/[grade]/page.tsx` or similar

**Step 1: Add visibility imports and usage**

Same pattern as Task 4.1.

**Step 2: Conditionally render elements**

- Unit cards: `{canSee(configurableRole, "pedagogical", "unitCards") && <UnitCards />}`
- Unit details: `{canSee(configurableRole, "pedagogical", "unitDetails") && <UnitDetails />}`

**Step 3: Commit**

```bash
git add src/app/(dashboard)/[role]/pedagogical/
git commit -m "feat(visibility): add element visibility to Pedagogical page"
```

---

## Phase 5: Final Steps

### Task 5.1: Update CHANGELOG

**Files:**
- Modify: `CHANGELOG.md`

**Step 1: Add entry under [Unreleased] -> Added**

```markdown
- **Display settings (תצוגה)**: New admin page to control visibility per role
  - Dashboard: configure intro text, toggle/reorder cards
  - Sidebar: toggle visibility, edit link names
  - Page elements: granular show/hide for elements within pages
  - Affects: Teaching Resources, Reports, Pedagogical, Documentation pages
```

**Step 2: Commit**

```bash
git add CHANGELOG.md
git commit -m "docs: update CHANGELOG with visibility feature"
```

---

### Task 5.2: Test the Feature

**Manual Testing Checklist:**

1. **Admin Display Page:**
   - [ ] Navigate to `/admin/display`
   - [ ] Switch between role tabs (teacher/parent/student)
   - [ ] Edit dashboard intro text
   - [ ] Drag cards to reorder
   - [ ] Toggle card visibility
   - [ ] Edit sidebar link names
   - [ ] Toggle sidebar link visibility
   - [ ] Toggle page element visibility
   - [ ] Save changes
   - [ ] Verify save success toast

2. **Teacher Dashboard:**
   - [ ] Login as teacher
   - [ ] Verify intro text displays if set
   - [ ] Verify only visible cards show
   - [ ] Verify card order matches config

3. **Sidebar:**
   - [ ] Verify only visible links show
   - [ ] Verify custom labels display correctly

4. **Teaching Resources:**
   - [ ] Verify only visible elements show
   - [ ] Test as admin (should see everything)
   - [ ] Test as teacher with some elements hidden

5. **Default Behavior:**
   - [ ] Clear Firestore visibility doc
   - [ ] Verify app still works with defaults

---

### Task 5.3: Create Index Export for Display Components

**Files:**
- Create: `src/components/display/index.ts`

**Step 1: Create the index file**

```typescript
export { RoleTabs } from "./RoleTabs";
export { DashboardSection } from "./DashboardSection";
export { SidebarSection } from "./SidebarSection";
export { PageElementsSection } from "./PageElementsSection";
export { DraggableCardList } from "./DraggableCardList";
```

**Step 2: Commit**

```bash
git add src/components/display/index.ts
git commit -m "chore: add index export for display components"
```

---

## Summary

**Total Tasks:** 18 tasks across 5 phases

**Phase 1 (Foundation):** 5 tasks - Types, defaults, service, context, layout integration
**Phase 2 (Consume):** 3 tasks - Sidebar, Dashboard, Teaching Resources
**Phase 3 (Admin UI):** 7 tasks - Dependencies, components, settings page
**Phase 4 (Remaining Pages):** 3 tasks - Documentation, Reports, Pedagogical
**Phase 5 (Final):** 3 tasks - CHANGELOG, testing, cleanup

**Key Files Created:**
- `src/types/index.ts` (modified)
- `src/lib/constants/visibility-defaults.ts`
- `src/lib/services/visibility.ts`
- `src/contexts/VisibilityContext.tsx`
- `src/components/display/*.tsx` (5 components)
- `src/app/(dashboard)/[role]/display/page.tsx`

**Key Files Modified:**
- `src/app/(dashboard)/layout.tsx`
- `src/components/dashboard/Sidebar.tsx`
- `src/app/(dashboard)/[role]/page.tsx`
- `src/app/(dashboard)/[role]/teaching-resources/[grade]/page.tsx`
- `src/app/(dashboard)/[role]/documentation/...`
- `src/app/(dashboard)/[role]/reports/...`
- `src/app/(dashboard)/[role]/pedagogical/...`
