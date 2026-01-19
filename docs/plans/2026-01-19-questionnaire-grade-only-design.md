# Questionnaire Grade-Only Design

## Overview

Remove the unit dependency from questionnaires. Currently questionnaires are tied to a specific unit within a grade. After this change, questionnaires will only be tied to a grade.

## Current vs New Flow

### Current Flow
1. Admin creates questionnaire for grade + unit
2. Student selects unit → fills questionnaire for that unit
3. One active questionnaire per grade+unit combination
4. Responses viewed per grade+unit

### New Flow
1. Admin creates questionnaire for grade only
2. Student clicks "יומן חוקר" → fills questionnaire for their grade directly
3. One active questionnaire per grade
4. Multiple submissions allowed per student
5. Responses viewed per grade with questionnaire filter dropdown

## Data Model Changes

### Questionnaire Type
```typescript
// Before
interface Questionnaire {
  id: string;
  name: string;
  gradeId: Grade;
  unitId: string;        // REMOVE
  questions: EmbeddedQuestion[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// After
interface Questionnaire {
  id: string;
  name: string;
  gradeId: Grade;
  questions: EmbeddedQuestion[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### ResearchJournal Type
```typescript
// Before
interface ResearchJournal {
  id: string;
  unitId: string;           // REMOVE from type
  gradeId: Grade;
  studentName: string;
  questionnaireId?: string; // Make REQUIRED
  answers: JournalAnswer[];
  createdAt: Date;
}

// After
interface ResearchJournal {
  id: string;
  gradeId: Grade;
  studentName: string;
  questionnaireId: string;  // Required
  answers: JournalAnswer[];
  createdAt: Date;
}
```

**Note:** Existing journal documents in Firestore may still have `unitId` - this is fine, the code will simply ignore it.

## Route Changes

| Current Route | New Route | Change |
|--------------|-----------|--------|
| `/[role]/journal/[unitId]` | `/[role]/journal` | Remove unit param, show grade's questionnaire directly |
| `/[role]/responses/[grade]/[unitId]` | `/[role]/responses/[grade]` | Remove unit param, add questionnaire dropdown filter |
| `/[role]/questions/[grade]/new` | (same) | Remove unit selection from form |
| `/[role]/questions/[grade]/[id]` | (same) | Remove unit display/edit |

### Pages to Delete
- `src/app/(dashboard)/[role]/journal/[unitId]/page.tsx` - merge into parent

### Student Journal Flow
```
Student clicks "יומן חוקר" in sidebar
    → /[role]/journal page
    → If active questionnaire exists for grade → Show wizard directly
    → If no active questionnaire → Show "אין שאלון פעיל" message
```

## Service Layer Changes

### `src/lib/services/questionnaires.ts`

```typescript
// Change: Remove unitId parameter
export async function getActiveQuestionnaire(
  gradeId: Grade
): Promise<Questionnaire | null>

// Change: Remove unitId from activation - one active per grade
export async function activateQuestionnaire(
  id: string,
  gradeId: Grade
): Promise<void>

// Change: createQuestionnaire no longer accepts unitId
```

### `src/lib/services/journals.ts`

```typescript
// Change: Remove unitId from submission
export async function submitJournal(data: {
  gradeId: Grade;
  studentName: string;
  questionnaireId: string;
  answers: JournalAnswer[];
}): Promise<string>

// Add: New function for responses page filter
export async function getJournalsByQuestionnaire(
  questionnaireId: string
): Promise<ResearchJournal[]>
```

### React Query Hooks (`src/lib/queries/`)

- `useActiveQuestionnaire(gradeId)` - remove unitId param
- `useJournalsByQuestionnaire(questionnaireId)` - new hook
- Update `questionnaires.ts` and `journals.ts` query files

## Migration Script

Create `scripts/migrate-questionnaires.ts`:

1. Fetch all documents from 'questionnaires' collection
2. For each document:
   - Remove `unitId` field using `FieldValue.delete()`
3. Handle duplicate active questionnaires per grade:
   - If multiple questionnaires have `isActive=true` for same grade
   - Keep only the most recently updated one active
4. Log results

**Existing journal entries:** Leave untouched. Old `unitId` fields remain but are ignored by the code.

## Files to Modify

### Types
- `src/types/index.ts` - Update Questionnaire and ResearchJournal interfaces

### Services
- `src/lib/services/questionnaires.ts` - Remove unitId from all functions
- `src/lib/services/journals.ts` - Remove unitId, add getJournalsByQuestionnaire

### React Query
- `src/lib/queries/questionnaires.ts` - Update hooks
- `src/lib/queries/journals.ts` - Update/add hooks
- `src/lib/queries/keys.ts` - Update query keys

### Pages
- `src/app/(dashboard)/[role]/journal/page.tsx` - Rewrite to show wizard directly
- `src/app/(dashboard)/[role]/journal/[unitId]/page.tsx` - DELETE
- `src/app/(dashboard)/[role]/responses/[grade]/page.tsx` - New page with questionnaire filter
- `src/app/(dashboard)/[role]/responses/[grade]/[unitId]/page.tsx` - DELETE
- `src/app/(dashboard)/[role]/questions/[grade]/new/page.tsx` - Remove unit selection
- `src/app/(dashboard)/[role]/questions/[grade]/[id]/page.tsx` - Remove unit display
- `src/app/(dashboard)/[role]/questions/[grade]/page.tsx` - Remove unit column from list

### New Files
- `scripts/migrate-questionnaires.ts` - Migration script
