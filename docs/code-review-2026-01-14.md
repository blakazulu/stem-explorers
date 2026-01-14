# Code Review - January 14, 2026

Comprehensive code review of the STEM Explorers platform.

## Summary

| Severity | Total | Accepted Risk | To Fix |
|----------|-------|---------------|--------|
| Critical | 3 | 2 | 1 |
| Important | 6 | 1 | 5 |
| Minor | 6 | 0 | 6 |

---

## Accepted Risks

The following issues were reviewed and accepted given the deployment context (internal school platform with trusted users):

### 1. Open Firestore Security Rules (Critical - Accepted)

**File:** `firestore.rules`

**Issue:** All Firestore collections are readable and writable by anyone (`allow read, write: if true`).

**Why accepted:** Custom authentication is used instead of Firebase Auth. The platform is for internal school use with trusted access. Implementing proper rules would require migrating to Firebase Auth.

**Mitigation considered:** Firebase App Check could add a layer of protection but was deemed unnecessary for the current deployment context.

---

### 2. Insecure Auth - Password in localStorage (Critical - Accepted)

**File:** `src/contexts/AuthContext.tsx`

**Issue:** Password stored in plain text in localStorage as `documentId`.

**Why accepted:** Users are on dedicated school devices. The password is already the Firestore document ID, so exposure risk is consistent with accepted Firestore rules.

**Mitigation considered:** Session token approach (storing random UUID instead of password) - declined as unnecessary for current context.

---

### 3. Client-Only Authorization (Important - Accepted)

**File:** `src/app/(dashboard)/[role]/layout.tsx`

**Issue:** Role checks happen client-side only. Users could modify localStorage to change their role.

**Why accepted:** Consistent with accepted Firestore rules - if someone wants to access data, they can already do it directly. Client-side auth prevents accidental access, not malicious access.

---

## Issues To Fix

### Critical

#### 1. Unprotected API Endpoint

**File:** `netlify/functions/generate-report.ts`

**Issue:** The AI report generation endpoint has no authentication. Anyone can:
- Generate reports without authorization
- Exhaust Gemini API quotas
- Incur unexpected costs

**Recommendation:** Add a simple shared secret or validate the request origin:
```typescript
const API_SECRET = process.env.REPORT_API_SECRET;
if (event.headers['x-api-secret'] !== API_SECRET) {
  return { statusCode: 401, body: 'Unauthorized' };
}
```

**Effort:** Low-Medium

---

### Important

#### 2. Missing Input Validation

**Files:** `src/lib/services/journals.ts`, `src/lib/services/forum.ts`

**Issue:** No input sanitization or validation for:
- Student names (could contain malicious content)
- Journal answers (no length limits)
- Forum posts and replies

**Recommendation:** Add validation:
```typescript
const sanitizedName = studentName.trim().slice(0, 100);
const sanitizedAnswers = answers.map(a => ({
  ...a,
  answer: typeof a.answer === 'string' ? a.answer.slice(0, 5000) : a.answer
}));
```

**Effort:** Medium

---

#### 3. Missing Return Type on handleFirebaseError

**File:** `src/lib/utils/errors.ts`

**Issue:** `handleFirebaseError` always throws but doesn't have a `never` return type. This causes TypeScript to think functions calling it might return `undefined`.

**Recommendation:**
```typescript
export function handleFirebaseError(error: unknown, operation: string): never {
  // ... existing code
}
```

**Effort:** 5 minutes

---

#### 4. Race Condition in Password Updates

**File:** `src/lib/services/users.ts`

**Issue:** Password update creates new document then deletes old one. If crash occurs between operations, duplicate records exist.

**Recommendation:** Use Firestore transactions:
```typescript
import { runTransaction } from 'firebase/firestore';
await runTransaction(db, async (transaction) => {
  const newDocRef = doc(db, 'users', newPassword);
  const oldDocRef = doc(db, 'users', oldPassword);

  // Check new password doesn't exist
  const newDoc = await transaction.get(newDocRef);
  if (newDoc.exists()) throw new Error('Password already in use');

  // Create new, delete old
  transaction.set(newDocRef, { ...userData });
  transaction.delete(oldDocRef);
});
```

**Effort:** Low

---

#### 5. XSS Risk with ReactMarkdown

**File:** `src/app/(dashboard)/[role]/reports/[grade]/[unitId]/page.tsx`

**Issue:** AI-generated content is rendered as markdown without sanitization.

**Recommendation:** Install and use `rehype-sanitize`:
```bash
npm install rehype-sanitize
```
```typescript
import rehypeSanitize from 'rehype-sanitize';
<ReactMarkdown rehypePlugins={[rehypeSanitize]}>{reportContent}</ReactMarkdown>
```

**Effort:** 5 minutes

---

#### 6. No Error Boundaries

**Issue:** No React Error Boundaries implemented. Unhandled errors crash the entire application.

**Recommendation:** Add error boundary component:
```typescript
// src/components/ErrorBoundary.tsx
'use client';
import { Component, ReactNode } from 'react';

interface Props { children: ReactNode; fallback?: ReactNode; }
interface State { hasError: boolean; }

export class ErrorBoundary extends Component<Props, State> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <div>משהו השתבש. נסה לרענן את הדף.</div>;
    }
    return this.props.children;
  }
}
```

**Effort:** Medium

---

### Minor

#### 7. String-Based Error Detection

**File:** `src/lib/utils/errors.ts`

**Issue:** Error categorization relies on string matching (`error.message.includes("permission")`) which is fragile.

**Recommendation:** Use Firebase error codes:
```typescript
if (error.code === 'permission-denied') {...}
```

**Effort:** Low

---

#### 8. Missing Accessibility (ARIA) Labels

**Files:** Multiple UI components

**Examples:**
- `src/components/journal/QuestionRenderer.tsx` - Rating buttons lack proper ARIA labels
- `src/components/dashboard/Sidebar.tsx` - Navigation links missing `aria-current`

**Recommendation:** Add ARIA attributes:
```typescript
<button
  aria-label={`דירוג ${n} מתוך 5`}
  aria-pressed={isSelected}
>
```

**Effort:** Medium

---

#### 9. Hardcoded Configuration Values

**File:** `src/lib/utils/imageUpload.ts`

**Issue:** Image processing parameters (max width 800px) are hardcoded.

**Recommendation:** Move to environment variables or config file.

**Effort:** Low

---

#### 10. Inconsistent Loading States

**Files:** Various pages

**Issue:** Some pages use `<Skeleton>` components, others return `null` during loading.

**Examples:**
- `src/app/(dashboard)/[role]/layout.tsx` - Returns `null`
- `src/app/(dashboard)/[role]/forum/page.tsx` - Returns `null`

**Recommendation:** Standardize to use Skeleton components everywhere.

**Effort:** Low

---

#### 11. Empty Interface Definitions

**File:** `src/components/ui/Card.tsx`

**Issue:** Empty interfaces add no type safety:
```typescript
interface CardContentProps extends HTMLAttributes<HTMLDivElement> {}
```

**Recommendation:** Use type alias instead:
```typescript
type CardContentProps = HTMLAttributes<HTMLDivElement>;
```

**Effort:** 2 minutes

---

#### 12. No Test Coverage

**Issue:** No test files found in the project.

**Recommendation:** Add unit tests for:
- Service functions (Firestore operations)
- Utility functions (image upload, error handling)
- Critical UI components (auth flow, journal wizard)

**Effort:** High (ongoing)

---

## Positive Findings

- Good service layer separation in `src/lib/services/`
- Well-designed TypeScript types in `src/types/index.ts`
- Elegant role-based theming with CSS variables
- Proper RTL/Hebrew implementation
- Correct memory leak prevention in image upload (URL.revokeObjectURL)
- Consistent component patterns with `forwardRef`

---

## Quick Wins (Can fix in ~15 minutes)

1. Add `never` return type to `handleFirebaseError`
2. Add `rehype-sanitize` to ReactMarkdown
3. Fix empty interface definitions

---

## Recommended Priority

1. **Unprotected API** - Prevents cost/quota issues
2. **XSS Protection** - Quick security win
3. **Return types** - Improves type safety
4. **Input validation** - Data integrity
5. **Error boundaries** - Better UX
6. **Race condition fix** - Data integrity
7. **Minor issues** - As time permits
