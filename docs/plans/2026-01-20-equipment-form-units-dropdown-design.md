# Equipment Form Units Dropdown Design

## Overview

Modify the EquipmentFormModal to show units based on selected age group(s) instead of a free text input.

## Changes

### Field Reordering

New order:
1. שם המורה (teacher name)
2. שכבת גיל (age groups) - **moved up**
3. תוכנית / יחידה (units) - **converted to multi-select**
4. כיתה/ות (classes)
5. משאבים דרושים (resources)
6. אחר (other)

### Units Multi-Select Behavior

**Before age group selected:**
- Disabled state with message: "בחרו שכבת גיל קודם"

**After age group(s) selected:**
- Fetch units for all grades in selected age groups
- Display as checkboxes grouped under grade headers
- Example:
  ```
  כיתה א
  ☐ חקר הצמחים
  ☐ מעגל החיים

  כיתה ב
  אין יחידות
  ```

**When age group deselected:**
- Remove selected units belonging to deselected grades
- If all deselected, return to disabled state

**Empty grades:**
- Show grade header with "אין יחידות" message

### Technical Implementation

**Age group to grades mapping:**
```typescript
const AGE_GROUP_TO_GRADES: Record<string, Grade[]> = {
  "a-b": ["א", "ב"],
  "c-d": ["ג", "ד"],
  "e-f": ["ה", "ו"],
};
```

**State changes:**
- `program` (string) → `selectedUnits` (string[])
- Add loading state for unit fetching

**Data fetching:**
- Use existing `useUnitsByGrade` hook for each grade
- Combine and group results by grade

**Email payload:**
- Change from: `program: "text"`
- Change to: `units: ["חקר הצמחים (א)", "מעגל החיים (ב)"]`

**Validation:**
- Require at least one unit selected (if units exist for selected grades)
- Skip unit validation if no units exist (allow submission with "אחר" field)

## Files to Modify

1. `src/components/teaching-resources/EquipmentFormModal.tsx` - Main form changes
2. `src/app/api/send-equipment-request/route.ts` - Handle new payload format
