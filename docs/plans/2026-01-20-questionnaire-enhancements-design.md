# Questionnaire Management Enhancements Design

## Overview

Enhance the admin questionnaire management page with improved UX and additional functionality.

## Features

### 1. Edit Questionnaire Name

**Current:** Name is displayed as static text in the page header.

**Change:** Add inline editing capability.

**UI Behavior:**
- Pencil icon button next to the questionnaire name
- Click → name becomes an Input field with Save/Cancel buttons
- Save calls `useUpdateQuestionnaire` mutation with new name
- Cancel reverts to display mode without changes

**Location:** `src/app/(dashboard)/[role]/questions/[grade]/[id]/page.tsx` header section

### 2. Copy Questionnaire to Other Grades

**Purpose:** Duplicate an existing questionnaire (with all its questions) to other grades.

**UI:**
- "העתק לכיתות" button in the edit page header
- Opens modal with checkboxes for grades א-ו (excluding current grade)
- User selects target grades → creates independent copies
- Toast confirms: "השאלון הועתק ל-X כיתות"

**Implementation:**
- New service function: `copyQuestionnaireToGrades(sourceId: string, targetGrades: Grade[])`
- Creates new questionnaire documents for each grade with:
  - Same `name` and `questions` array
  - New `gradeId` for each target
  - `isActive: false`
  - Fresh `createdAt`/`updatedAt` timestamps

### 3. Question Form Modal

**Current:** Question add/edit form appears inline inside the Card below the questions header.

**Change:** Move form to a wide modal dialog.

**Modal Specifications:**
- Max width: ~700px (wide enough for form elements)
- Title: "שאלה חדשה" or "עריכת שאלה"
- Contains: question type selector, text area, rating style (for rating), options (for choice types), "other" toggle
- Footer: "ביטול" and "שמור" buttons

**Component:** New `QuestionFormModal.tsx` component handling both add and edit modes.

### 4. "Other" Option for Choice Questions

**Purpose:** Allow single/multiple choice questions to include a free-text "other" option.

**Data Model Change:**
```typescript
// In EmbeddedQuestion (src/types/index.ts)
export interface EmbeddedQuestion {
  id: string;
  type: QuestionType;
  text: string;
  options?: string[];
  ratingStyle?: RatingStyle;
  hasOtherOption?: boolean;  // NEW - enables "אחר" with text input
  order: number;
}
```

**Admin UI:**
- For single/multiple choice types in the question modal
- Toggle/checkbox: "אפשר תשובה אחרת" (Allow other answer)
- Only visible when question type is "single" or "multiple"

**Student Experience:**
- Regular options shown as radio buttons (single) or checkboxes (multiple)
- When `hasOtherOption` is true, additional "אחר: ____" option appears at bottom
- Text input enabled when "אחר" is selected

**Answer Storage:**
- Single choice with other: `"אחר: [user text]"`
- Multiple choice with other: `["option1", "אחר: [user text]"]`

## Files to Modify

1. **`src/types/index.ts`**
   - Add `hasOtherOption?: boolean` to `EmbeddedQuestion` interface

2. **`src/lib/services/questionnaires.ts`**
   - Add `copyQuestionnaireToGrades(sourceId, targetGrades)` function

3. **`src/lib/queries/questionnaires.ts`**
   - Add `useCopyQuestionnaireToGrades` mutation hook

4. **`src/app/(dashboard)/[role]/questions/[grade]/[id]/page.tsx`**
   - Add inline name editing in header
   - Add "copy to grades" button and modal
   - Replace inline question form with modal trigger
   - Import and use new `QuestionFormModal`

5. **New: `src/components/QuestionFormModal.tsx`**
   - Modal component for add/edit question
   - Props: `isOpen`, `onClose`, `onSave`, `editingQuestion?`, `saving`
   - Contains all question form fields including new "hasOtherOption" toggle

6. **`src/app/(dashboard)/[role]/journal/questionnaire/page.tsx`** (if exists)
   - Update student questionnaire view to handle `hasOtherOption`
   - Render "אחר" option with text input when enabled

## UI Components Used

- Existing: `Button`, `Input`, `Card`, `ConfirmDialog`
- Modal: Use pattern similar to `ConfirmDialog` or create wrapper

## Notes

- All copies are independent - editing one does not affect others
- Copied questionnaires start as inactive (`isActive: false`)
- The "other" option text is stored with prefix "אחר: " for identification
