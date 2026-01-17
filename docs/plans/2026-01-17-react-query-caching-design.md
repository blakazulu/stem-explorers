# React Query Caching Implementation Design

**Date:** 2026-01-17
**Status:** Approved for implementation

## Problem

Too many Firebase calls during navigation. Every page shows skeleton loading even for data that was just fetched. The experience feels slow despite data rarely changing.

## Solution

Add TanStack Query as a caching layer between components and Firebase services.

**Behavior:**
- First visit: Fetch from Firebase, cache result
- Subsequent visits: Show cached data immediately, refresh in background if stale (>5 min)
- After mutations: Automatically invalidate related caches
- Refresh button: Invalidates all caches, triggers refetch

## Architecture

```
src/
├── providers/
│   └── QueryProvider.tsx      # QueryClient setup
├── lib/
│   └── queries/
│       ├── keys.ts            # Centralized query keys
│       ├── units.ts           # useUnitsByGrade, useUnit, mutations
│       ├── settings.ts        # usePedagogicalIntro, useExperts, etc.
│       ├── questionnaires.ts  # useQuestionnairesByGrade, etc.
│       ├── journals.ts        # useJournalsByUnit
│       ├── reports.ts         # useReport
│       ├── documentation.ts   # useDocumentationByUnit
│       ├── visibility.ts      # useVisibilityConfig
│       ├── forum.ts           # usePosts
│       ├── staff.ts           # useStaffByGrade
│       ├── users.ts           # useAllUsers
│       └── index.ts           # Re-exports
```

## Default Cache Settings

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5 minutes - data considered fresh
      gcTime: 30 * 60 * 1000,         // 30 minutes - unused data kept
      retry: 1,                       // One retry on failure
      refetchOnWindowFocus: false,    // No auto-refetch on tab focus
    },
  },
});
```

## Query Keys Structure

```typescript
export const queryKeys = {
  units: {
    all: ['units'] as const,
    byGrade: (grade: Grade) => ['units', 'byGrade', grade] as const,
    single: (id: string) => ['units', id] as const,
  },
  questionnaires: {
    all: ['questionnaires'] as const,
    byGrade: (grade: Grade) => ['questionnaires', 'byGrade', grade] as const,
    active: (gradeId: Grade, unitId: string) => ['questionnaires', 'active', gradeId, unitId] as const,
    single: (id: string) => ['questionnaires', id] as const,
  },
  journals: {
    byUnit: (unitId: string, gradeId: Grade) => ['journals', unitId, gradeId] as const,
  },
  reports: {
    single: (unitId: string, gradeId: Grade) => ['reports', unitId, gradeId] as const,
  },
  documentation: {
    byUnit: (unitId: string, gradeId: Grade) => ['documentation', unitId, gradeId] as const,
  },
  visibility: ['visibility'] as const,
  settings: {
    pedagogicalIntro: (grade: Grade) => ['settings', 'pedagogicalIntro', grade] as const,
    resourceFile: (grade: Grade, type: string) => ['settings', 'resourceFile', grade, type] as const,
    experts: ['settings', 'experts'] as const,
    stemLinks: ['settings', 'stemLinks'] as const,
    emailConfig: ['settings', 'emailConfig'] as const,
    reportConfig: ['settings', 'reportConfig'] as const,
  },
  staff: {
    all: ['staff'] as const,
    byGrade: (grade: Grade) => ['staff', 'byGrade', grade] as const,
    single: (id: string) => ['staff', id] as const,
  },
  forum: {
    posts: ['forum', 'posts'] as const,
  },
  users: {
    all: ['users', 'all'] as const,
  },
};
```

## Cache Invalidation Map

| Action | Invalidate |
|--------|------------|
| Create/update/delete unit | `['units']` |
| Delete unit | `['units']`, `['questionnaires']`, `['journals']`, `['documentation']` (for that unit) |
| Create/update/delete questionnaire | `['questionnaires']` |
| Activate questionnaire | `['questionnaires', 'active', gradeId, unitId]` |
| Submit journal | `['journals', unitId, gradeId]` |
| Delete journal | `['journals', unitId, gradeId]` |
| Generate report | `['reports', unitId, gradeId]` |
| Save visibility config | `['visibility']` |
| Save pedagogical intro | `['settings', 'pedagogicalIntro', grade]` |
| Upload/delete resource file | `['settings', 'resourceFile', grade, type]` |
| Save experts | `['settings', 'experts']` |
| Save STEM links | `['settings', 'stemLinks']` |
| Create/delete documentation | `['documentation', unitId, gradeId]` |
| Create/update/delete staff | `['staff']` |
| Create/delete forum post | `['forum', 'posts']` |
| **Refresh button click** | All queries (global invalidation) |

## Hook Pattern

### Query Hook

```typescript
export function useUnitsByGrade(grade: Grade) {
  return useQuery({
    queryKey: queryKeys.units.byGrade(grade),
    queryFn: () => getUnitsByGrade(grade),
    enabled: !!grade,
  });
}
```

### Mutation Hook

```typescript
export function useCreateUnit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createUnit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.units.all });
    },
  });
}
```

### Global Refresh Hook

```typescript
export function useRefreshAll() {
  const queryClient = useQueryClient();
  return useCallback(() => {
    queryClient.invalidateQueries();
  }, [queryClient]);
}
```

## Page Migration

**Before:**
```typescript
const [units, setUnits] = useState<Unit[]>([]);
const [loading, setLoading] = useState(true);

const loadData = useCallback(async () => {
  setLoading(true);
  try {
    const data = await getUnitsByGrade(grade);
    setUnits(data);
  } catch { /* error */ }
  setLoading(false);
}, [grade]);

useEffect(() => { loadData(); }, [loadData]);
```

**After:**
```typescript
const { data: units = [], isLoading } = useUnitsByGrade(grade);
```

## Files to Create

| File | Purpose |
|------|---------|
| `src/providers/QueryProvider.tsx` | QueryClient setup with defaults |
| `src/lib/queries/keys.ts` | Centralized query keys |
| `src/lib/queries/units.ts` | Unit query & mutation hooks |
| `src/lib/queries/questionnaires.ts` | Questionnaire hooks |
| `src/lib/queries/journals.ts` | Journal hooks |
| `src/lib/queries/reports.ts` | Report hooks |
| `src/lib/queries/documentation.ts` | Documentation hooks |
| `src/lib/queries/visibility.ts` | Visibility config hook |
| `src/lib/queries/settings.ts` | Settings hooks (intro, resources, experts, etc.) |
| `src/lib/queries/staff.ts` | Staff hooks |
| `src/lib/queries/forum.ts` | Forum hooks |
| `src/lib/queries/users.ts` | User hooks |
| `src/lib/queries/index.ts` | Barrel export |

## Files to Modify

| File | Change |
|------|--------|
| `package.json` | Add `@tanstack/react-query` |
| `src/app/layout.tsx` | Wrap with QueryProvider |
| `src/contexts/VisibilityContext.tsx` | Use `useVisibilityConfig` internally |
| All 30 dashboard pages | Replace useState/useEffect with query hooks |
| Components with refresh button | Use `useRefreshAll` hook |
| `CHANGELOG.md` | Document changes |

## Expected Results

- **70-80% fewer skeleton appearances** during navigation
- **Instant render** for previously visited pages/grades
- **Background refresh** keeps data fresh without blocking UI
- **Automatic updates** after admin edits via cache invalidation
- **Reduced Firebase reads** = lower costs

## Verification

1. `npm install` - install TanStack Query
2. `npm run build` - verify no type errors
3. `npm run dev` - test navigation
4. Open DevTools Network tab - verify reduced Firebase calls
5. Navigate: Page A → Page B → Page A - second visit should show no skeleton
6. Test refresh button - should refetch all visible data
7. Test mutations - creating/editing should update related views
