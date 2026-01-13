# Code Review Fixes Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix all security vulnerabilities, high-priority bugs, and add missing features identified in the code review.

**Architecture:** Systematic fixes organized by priority - Critical security issues first, then high-priority bugs, medium issues, and finally missing pages.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, Firebase Firestore/Storage, react-markdown for safe rendering

---

## Phase 1: Critical Security Fixes

### Task 1.1: Remove Password from Session Storage (C1)

**Files:**
- Modify: `src/types/index.ts`
- Modify: `src/contexts/AuthContext.tsx`

**Step 1: Update AuthSession type to remove password**

In `src/types/index.ts`, change:

```typescript
// Session/Auth context
export interface AuthSession {
  user: User;
  documentId: string; // Changed from password - stores the Firestore doc ID for re-validation
}
```

**Step 2: Update AuthContext to not store password in localStorage**

Replace the entire `src/contexts/AuthContext.tsx` with:

```typescript
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { User, AuthSession } from "@/types";

interface AuthContextType {
  session: AuthSession | null;
  loading: boolean;
  login: (name: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored session on mount and validate it still exists
    const validateSession = async () => {
      const stored = localStorage.getItem("stem-session");
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as AuthSession;
          // Validate the session by checking if the document still exists
          const userDoc = await getDoc(doc(db, "users", parsed.documentId));
          if (userDoc.exists()) {
            setSession(parsed);
          } else {
            localStorage.removeItem("stem-session");
          }
        } catch {
          localStorage.removeItem("stem-session");
        }
      }
      setLoading(false);
    };
    validateSession();
  }, []);

  const login = async (name: string, password: string) => {
    try {
      // Validate name - basic XSS prevention
      const sanitizedName = name.trim().slice(0, 100);
      if (!sanitizedName || sanitizedName !== name.trim()) {
        return { success: false, error: "שם לא תקין" };
      }

      const userDoc = await getDoc(doc(db, "users", password));

      if (!userDoc.exists()) {
        return { success: false, error: "סיסמה שגויה" };
      }

      const userData = userDoc.data() as Omit<User, "createdAt"> & { createdAt: { toDate: () => Date } };
      const user: User = {
        ...userData,
        name: sanitizedName,
        createdAt: userData.createdAt?.toDate() || new Date(),
      };

      // Store documentId instead of password
      const newSession: AuthSession = { user, documentId: password };
      setSession(newSession);
      localStorage.setItem("stem-session", JSON.stringify(newSession));

      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "שגיאה בהתחברות" };
    }
  };

  const logout = () => {
    setSession(null);
    localStorage.removeItem("stem-session");
  };

  return (
    <AuthContext.Provider value={{ session, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
```

**Step 3: Verify and commit**

Run: `npm run build`
Expected: Build succeeds

```bash
git add src/types/index.ts src/contexts/AuthContext.tsx
git commit -m "fix(security): remove password from session storage, add name validation"
```

---

### Task 1.2: Fix XSS Vulnerability in Reports Page (C2)

**Files:**
- Modify: `package.json` (add react-markdown)
- Modify: `src/app/(dashboard)/reports/page.tsx`

**Step 1: Install react-markdown for safe rendering**

Run: `npm install react-markdown`

**Step 2: Update reports page to use safe markdown rendering**

Replace the `dangerouslySetInnerHTML` section in `src/app/(dashboard)/reports/page.tsx`:

```typescript
"use client";

import { useState, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import { useAuth } from "@/contexts/AuthContext";
import { GradeSelector } from "@/components/ui/GradeSelector";
import { getUnitsByGrade } from "@/lib/services/units";
import { getReport } from "@/lib/services/reports";
import type { Grade, Unit, Report } from "@/types";

export default function ReportsPage() {
  const { session } = useAuth();
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(
    session?.user.grade || null
  );
  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isTeacherOrAdmin = session?.user.role === "teacher" || session?.user.role === "admin";
  const isParent = session?.user.role === "parent";

  const loadUnits = useCallback(async () => {
    if (!selectedGrade) return;
    try {
      setError(null);
      const data = await getUnitsByGrade(selectedGrade);
      setUnits(data);
    } catch (err) {
      setError("שגיאה בטעינת יחידות");
      console.error(err);
    }
  }, [selectedGrade]);

  useEffect(() => {
    loadUnits();
  }, [loadUnits]);

  async function loadReport(unit: Unit) {
    setSelectedUnit(unit);
    setLoading(true);
    setError(null);
    try {
      const data = await getReport(unit.id, selectedGrade!);
      setReport(data);
    } catch (err) {
      setError("שגיאה בטעינת דוח");
      console.error(err);
    }
    setLoading(false);
  }

  const reportContent = report
    ? isParent
      ? report.parentContent
      : report.teacherContent
    : null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-rubik font-bold">דוחות</h1>

      {error && (
        <div className="bg-error/10 text-error p-4 rounded-lg">{error}</div>
      )}

      {isTeacherOrAdmin && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            בחר שכבה
          </label>
          <GradeSelector selected={selectedGrade} onSelect={setSelectedGrade} />
        </div>
      )}

      {selectedGrade && !selectedUnit && (
        <div>
          <h2 className="text-lg font-rubik font-semibold mb-4">בחר יחידה</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {units.map((unit) => (
              <button
                key={unit.id}
                onClick={() => loadReport(unit)}
                className="text-right p-4 bg-white rounded-xl border-2 border-gray-100 hover:border-primary hover:shadow-md transition-all"
              >
                <h3 className="font-rubik font-semibold">{unit.name}</h3>
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedUnit && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-rubik font-bold">
              דוח - {selectedUnit.name}
            </h2>
            <button
              onClick={() => {
                setSelectedUnit(null);
                setReport(null);
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              חזור
            </button>
          </div>

          {loading ? (
            <div className="text-gray-500">טוען דוח...</div>
          ) : reportContent ? (
            <div className="prose prose-lg max-w-none" dir="rtl">
              <ReactMarkdown>{reportContent}</ReactMarkdown>
            </div>
          ) : (
            <p className="text-gray-500">אין דוח זמין ליחידה זו</p>
          )}
        </div>
      )}
    </div>
  );
}
```

**Step 3: Verify and commit**

Run: `npm run build`
Expected: Build succeeds

```bash
git add package.json package-lock.json src/app/\(dashboard\)/reports/page.tsx
git commit -m "fix(security): use react-markdown for safe report rendering, add error handling"
```

---

## Phase 2: High Priority Fixes

### Task 2.1: Fix Memory Leak in Image Upload (H3)

**Files:**
- Modify: `src/lib/utils/imageUpload.ts`

**Step 1: Add URL.revokeObjectURL to prevent memory leak**

Replace `src/lib/utils/imageUpload.ts`:

```typescript
export async function resizeImage(file: File, maxWidth: number = 800): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // Store the object URL so we can revoke it later
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      // Revoke the object URL to free memory
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;

      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;
      ctx?.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Failed to create blob"));
        },
        "image/webp",
        0.85
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load image"));
    };

    img.src = objectUrl;
  });
}

export async function uploadImage(
  file: File,
  path: string
): Promise<string> {
  const { ref, uploadBytes, getDownloadURL } = await import("firebase/storage");
  const { storage } = await import("@/lib/firebase");

  const resized = await resizeImage(file);
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, resized);
  return getDownloadURL(storageRef);
}
```

**Step 2: Commit**

```bash
git add src/lib/utils/imageUpload.ts
git commit -m "fix: prevent memory leak by revoking object URLs in image upload"
```

---

### Task 2.2: Add Error Handling to Firebase Services (H2)

**Files:**
- Modify: `src/lib/services/units.ts`
- Modify: `src/lib/services/documentation.ts`
- Modify: `src/lib/services/questions.ts`
- Modify: `src/lib/services/journals.ts`
- Modify: `src/lib/services/reports.ts`
- Modify: `src/lib/services/forum.ts`

**Step 1: Create error handling utility**

Create `src/lib/utils/errors.ts`:

```typescript
export class ServiceError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = "ServiceError";
  }
}

export function handleFirebaseError(error: unknown, operation: string): never {
  console.error(`Firebase ${operation} error:`, error);

  if (error instanceof Error) {
    if (error.message.includes("permission")) {
      throw new ServiceError("אין הרשאה לביצוע פעולה זו", "PERMISSION_DENIED");
    }
    if (error.message.includes("network")) {
      throw new ServiceError("שגיאת רשת, נסה שוב", "NETWORK_ERROR");
    }
  }

  throw new ServiceError("שגיאה בטעינת נתונים", "UNKNOWN_ERROR");
}
```

**Step 2: Update units.ts with error handling**

Replace `src/lib/services/units.ts`:

```typescript
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { handleFirebaseError } from "@/lib/utils/errors";
import type { Unit, Grade } from "@/types";

const COLLECTION = "units";

export async function getUnitsByGrade(grade: Grade): Promise<Unit[]> {
  try {
    const q = query(
      collection(db, COLLECTION),
      where("gradeId", "==", grade),
      orderBy("order", "asc")
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
    })) as Unit[];
  } catch (error) {
    handleFirebaseError(error, "getUnitsByGrade");
  }
}

export async function getUnit(id: string): Promise<Unit | null> {
  try {
    const docRef = doc(db, COLLECTION, id);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) return null;

    return {
      id: snapshot.id,
      ...snapshot.data(),
      createdAt: snapshot.data().createdAt?.toDate(),
    } as Unit;
  } catch (error) {
    handleFirebaseError(error, "getUnit");
  }
}

export async function createUnit(
  data: Omit<Unit, "id" | "createdAt">
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, COLLECTION), {
      ...data,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    handleFirebaseError(error, "createUnit");
  }
}

export async function updateUnit(
  id: string,
  data: Partial<Omit<Unit, "id" | "createdAt">>
): Promise<void> {
  try {
    await updateDoc(doc(db, COLLECTION, id), data);
  } catch (error) {
    handleFirebaseError(error, "updateUnit");
  }
}

export async function deleteUnit(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, COLLECTION, id));
  } catch (error) {
    handleFirebaseError(error, "deleteUnit");
  }
}
```

**Step 3: Update remaining services similarly**

Apply the same try-catch pattern to:
- `src/lib/services/documentation.ts`
- `src/lib/services/questions.ts`
- `src/lib/services/journals.ts`
- `src/lib/services/reports.ts`
- `src/lib/services/forum.ts`

**Step 4: Commit**

```bash
git add src/lib/utils/errors.ts src/lib/services/
git commit -m "feat: add error handling to all Firebase services"
```

---

### Task 2.3: Create Documentation Page (H1)

**Files:**
- Create: `src/app/(dashboard)/documentation/page.tsx`

**Step 1: Create the documentation page**

Create `src/app/(dashboard)/documentation/page.tsx`:

```typescript
"use client";

import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { GradeSelector } from "@/components/ui/GradeSelector";
import { getUnitsByGrade } from "@/lib/services/units";
import { DocumentationGallery } from "@/components/documentation/DocumentationGallery";
import { createDocumentation } from "@/lib/services/documentation";
import { uploadImage } from "@/lib/utils/imageUpload";
import { Button } from "@/components/ui/Button";
import type { Grade, Unit } from "@/types";

export default function DocumentationPage() {
  const { session } = useAuth();
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(
    session?.user.grade || null
  );
  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [text, setText] = useState("");
  const [images, setImages] = useState<File[]>([]);

  const isTeacherOrAdmin = session?.user.role === "teacher" || session?.user.role === "admin";

  const loadUnits = useCallback(async () => {
    if (!selectedGrade) return;
    try {
      setError(null);
      const data = await getUnitsByGrade(selectedGrade);
      setUnits(data);
    } catch {
      setError("שגיאה בטעינת יחידות");
    }
  }, [selectedGrade]);

  useEffect(() => {
    loadUnits();
  }, [loadUnits]);

  async function handleAddDocumentation() {
    if (!selectedUnit || !selectedGrade || !session) return;
    if (images.length === 0 && !text.trim()) {
      setError("יש להוסיף תמונות או טקסט");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // Upload images
      const imageUrls: string[] = [];
      for (const image of images) {
        const path = `documentation/${selectedGrade}/${selectedUnit.id}/${Date.now()}-${image.name}`;
        const url = await uploadImage(image, path);
        imageUrls.push(url);
      }

      // Create documentation entry
      await createDocumentation({
        unitId: selectedUnit.id,
        gradeId: selectedGrade,
        images: imageUrls,
        text: text.trim(),
        teacherName: session.user.name,
      });

      // Reset form
      setText("");
      setImages([]);
      setShowAddForm(false);
    } catch {
      setError("שגיאה בהוספת תיעוד");
    }

    setUploading(false);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-rubik font-bold">תיעודים</h1>

      {error && (
        <div className="bg-error/10 text-error p-4 rounded-lg">{error}</div>
      )}

      {isTeacherOrAdmin && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            בחר שכבה
          </label>
          <GradeSelector selected={selectedGrade} onSelect={setSelectedGrade} />
        </div>
      )}

      {selectedGrade && !selectedUnit && (
        <div>
          <h2 className="text-lg font-rubik font-semibold mb-4">בחר יחידה</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {units.map((unit) => (
              <button
                key={unit.id}
                onClick={() => setSelectedUnit(unit)}
                className="text-right p-4 bg-white rounded-xl border-2 border-gray-100 hover:border-primary hover:shadow-md transition-all"
              >
                <h3 className="font-rubik font-semibold">{unit.name}</h3>
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedUnit && selectedGrade && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-rubik font-bold">
              תיעודים - {selectedUnit.name}
            </h2>
            <button
              onClick={() => setSelectedUnit(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              חזור לרשימה
            </button>
          </div>

          {showAddForm && isTeacherOrAdmin && (
            <div className="bg-white rounded-xl p-6 shadow-sm mb-6 space-y-4">
              <h3 className="font-rubik font-semibold">הוסף תיעוד חדש</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  תמונות
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => setImages(Array.from(e.target.files || []))}
                  className="w-full"
                />
                {images.length > 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    {images.length} תמונות נבחרו
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  תיאור
                </label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full p-3 border rounded-lg"
                  rows={3}
                  placeholder="הוסף תיאור לתיעוד..."
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleAddDocumentation} disabled={uploading}>
                  {uploading ? "מעלה..." : "שמור תיעוד"}
                </Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  ביטול
                </Button>
              </div>
            </div>
          )}

          <DocumentationGallery
            unitId={selectedUnit.id}
            gradeId={selectedGrade}
            onAddNew={isTeacherOrAdmin ? () => setShowAddForm(true) : undefined}
          />
        </div>
      )}
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/app/\(dashboard\)/documentation/page.tsx
git commit -m "feat: add documentation page with upload functionality"
```

---

### Task 2.4: Create Firestore Indexes File (H5)

**Files:**
- Create: `firestore.indexes.json`

**Step 1: Create the indexes file**

Create `firestore.indexes.json` in the project root:

```json
{
  "indexes": [
    {
      "collectionGroup": "units",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "gradeId", "order": "ASCENDING" },
        { "fieldPath": "order", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "documentation",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "unitId", "order": "ASCENDING" },
        { "fieldPath": "gradeId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "forum",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "room", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "researchJournals",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "unitId", "order": "ASCENDING" },
        { "fieldPath": "gradeId", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "reports",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "unitId", "order": "ASCENDING" },
        { "fieldPath": "gradeId", "order": "ASCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
```

**Step 2: Commit**

```bash
git add firestore.indexes.json
git commit -m "feat: add Firestore composite indexes configuration"
```

---

## Phase 3: Medium Priority Fixes

### Task 3.1: Fix Journal Wizard Multiple Choice Validation (M6)

**Files:**
- Modify: `src/components/journal/JournalWizard.tsx`

**Step 1: Update validation logic**

In `src/components/journal/JournalWizard.tsx`, replace line 21:

```typescript
// Old:
const canProceed = answers[currentQuestion?.id] !== undefined;

// New - proper validation for each question type:
const canProceed = (() => {
  const answer = answers[currentQuestion?.id];
  if (answer === undefined) return false;

  // For multiple choice, require at least one selection
  if (currentQuestion?.type === "multiple") {
    return Array.isArray(answer) && answer.length > 0;
  }

  // For open questions, require non-empty string
  if (currentQuestion?.type === "open") {
    return typeof answer === "string" && answer.trim().length > 0;
  }

  return true;
})();
```

**Step 2: Commit**

```bash
git add src/components/journal/JournalWizard.tsx
git commit -m "fix: require at least one selection for multiple choice questions"
```

---

### Task 3.2: Create Confirmation Dialog Component (M4)

**Files:**
- Create: `src/components/ui/ConfirmDialog.tsx`

**Step 1: Create the component**

Create `src/components/ui/ConfirmDialog.tsx`:

```typescript
"use client";

import { useEffect, useRef } from "react";
import { Button } from "./Button";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: "danger" | "default";
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = "אישור",
  cancelLabel = "ביטול",
  onConfirm,
  onCancel,
  variant = "default",
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onCancel}
      />
      <div
        ref={dialogRef}
        className="relative bg-white rounded-xl p-6 shadow-xl max-w-md w-full mx-4"
        tabIndex={-1}
      >
        <h2 className="text-xl font-rubik font-bold mb-2">{title}</h2>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button
            variant={variant === "danger" ? "primary" : "primary"}
            className={variant === "danger" ? "bg-error hover:bg-error/90" : ""}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Create a hook for easier usage**

Create `src/hooks/useConfirmDialog.ts`:

```typescript
"use client";

import { useState, useCallback } from "react";

interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "default";
}

export function useConfirmDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [resolvePromise, setResolvePromise] = useState<((value: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    setOptions(opts);
    setIsOpen(true);
    return new Promise((resolve) => {
      setResolvePromise(() => resolve);
    });
  }, []);

  const handleConfirm = useCallback(() => {
    setIsOpen(false);
    resolvePromise?.(true);
  }, [resolvePromise]);

  const handleCancel = useCallback(() => {
    setIsOpen(false);
    resolvePromise?.(false);
  }, [resolvePromise]);

  return {
    isOpen,
    options,
    confirm,
    handleConfirm,
    handleCancel,
  };
}
```

**Step 3: Commit**

```bash
git add src/components/ui/ConfirmDialog.tsx src/hooks/useConfirmDialog.ts
git commit -m "feat: add RTL-friendly confirmation dialog component"
```

---

### Task 3.3: Add Forum Reply Unique IDs (M3)

**Files:**
- Modify: `src/types/index.ts`
- Modify: `src/lib/services/forum.ts`
- Modify: `src/components/forum/PostCard.tsx`

**Step 1: Update ForumReply type**

In `src/types/index.ts`, update:

```typescript
export interface ForumReply {
  id: string; // Add unique ID
  authorName: string;
  content: string;
  createdAt: Date;
}
```

**Step 2: Update forum service to generate IDs**

In `src/lib/services/forum.ts`, update `addReply`:

```typescript
export async function addReply(
  postId: string,
  reply: Omit<ForumReply, "createdAt" | "id">
): Promise<void> {
  try {
    await updateDoc(doc(db, COLLECTION, postId), {
      replies: arrayUnion({
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...reply,
        createdAt: new Date(),
      }),
    });
  } catch (error) {
    handleFirebaseError(error, "addReply");
  }
}
```

**Step 3: Update PostCard to use reply.id as key**

In `src/components/forum/PostCard.tsx`, change:

```typescript
// Old:
{post.replies.map((reply, i) => (
  <div key={i} ...>

// New:
{post.replies.map((reply) => (
  <div key={reply.id} ...>
```

**Step 4: Commit**

```bash
git add src/types/index.ts src/lib/services/forum.ts src/components/forum/PostCard.tsx
git commit -m "feat: add unique IDs to forum replies"
```

---

## Phase 4: Missing Admin Pages

### Task 4.1: Create Admin Settings Page

**Files:**
- Create: `src/app/(dashboard)/settings/page.tsx`

**Step 1: Create settings page**

Create `src/app/(dashboard)/settings/page.tsx`:

```typescript
"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SettingsPage() {
  const { session } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (session?.user.role !== "admin") {
      router.push("/dashboard");
    }
  }, [session, router]);

  if (session?.user.role !== "admin") {
    return null;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-rubik font-bold">הגדרות</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="font-rubik font-semibold text-lg mb-4">הגדרות כלליות</h2>
          <p className="text-gray-500">הגדרות המערכת יהיו זמינות בקרוב</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="font-rubik font-semibold text-lg mb-4">הגדרות דוחות AI</h2>
          <p className="text-gray-500">הגדרות הפקת דוחות יהיו זמינות בקרוב</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="font-rubik font-semibold text-lg mb-4">ניהול משתמשים</h2>
          <p className="text-gray-500">ניהול משתמשים יהיה זמין בקרוב</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="font-rubik font-semibold text-lg mb-4">הגדרות התראות</h2>
          <p className="text-gray-500">הגדרות התראות יהיו זמינות בקרוב</p>
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/app/\(dashboard\)/settings/page.tsx
git commit -m "feat: add admin settings page placeholder"
```

---

### Task 4.2: Create Questions Management Page

**Files:**
- Create: `src/app/(dashboard)/questions/page.tsx`

**Step 1: Create questions management page**

Create `src/app/(dashboard)/questions/page.tsx`:

```typescript
"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { getAllQuestions, createQuestion, deleteQuestion } from "@/lib/services/questions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { Question, QuestionType, Grade } from "@/types";

const questionTypes: { value: QuestionType; label: string }[] = [
  { value: "rating", label: "דירוג (1-5)" },
  { value: "single", label: "בחירה יחידה" },
  { value: "multiple", label: "בחירה מרובה" },
  { value: "open", label: "שאלה פתוחה" },
];

const grades: Grade[] = ["א", "ב", "ג", "ד", "ה", "ו"];

export default function QuestionsPage() {
  const { session } = useAuth();
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [newQuestion, setNewQuestion] = useState({
    text: "",
    type: "rating" as QuestionType,
    options: "",
    targetGrades: [] as Grade[],
  });

  useEffect(() => {
    if (session?.user.role !== "admin") {
      router.push("/dashboard");
    }
  }, [session, router]);

  const loadQuestions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllQuestions();
      setQuestions(data);
    } catch {
      setError("שגיאה בטעינת שאלות");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  async function handleCreateQuestion() {
    if (!newQuestion.text.trim()) {
      setError("יש להזין טקסט לשאלה");
      return;
    }

    try {
      const options = newQuestion.options
        .split(",")
        .map((o) => o.trim())
        .filter(Boolean);

      await createQuestion({
        text: newQuestion.text,
        type: newQuestion.type,
        options: options.length > 0 ? options : undefined,
        target: {
          grades: newQuestion.targetGrades,
          units: [],
        },
        order: questions.length + 1,
      });

      setNewQuestion({ text: "", type: "rating", options: "", targetGrades: [] });
      setShowForm(false);
      loadQuestions();
    } catch {
      setError("שגיאה ביצירת שאלה");
    }
  }

  async function handleDeleteQuestion(id: string) {
    if (!confirm("האם למחוק שאלה זו?")) return;
    try {
      await deleteQuestion(id);
      loadQuestions();
    } catch {
      setError("שגיאה במחיקת שאלה");
    }
  }

  if (session?.user.role !== "admin") {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-rubik font-bold">ניהול שאלות</h1>
        <Button onClick={() => setShowForm(true)}>שאלה חדשה</Button>
      </div>

      {error && (
        <div className="bg-error/10 text-error p-4 rounded-lg">{error}</div>
      )}

      {showForm && (
        <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="font-rubik font-semibold">שאלה חדשה</h2>

          <Input
            label="טקסט השאלה"
            value={newQuestion.text}
            onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              סוג שאלה
            </label>
            <select
              value={newQuestion.type}
              onChange={(e) => setNewQuestion({ ...newQuestion, type: e.target.value as QuestionType })}
              className="w-full p-2 border rounded-lg"
            >
              {questionTypes.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {(newQuestion.type === "single" || newQuestion.type === "multiple") && (
            <Input
              label="אפשרויות (מופרדות בפסיק)"
              value={newQuestion.options}
              onChange={(e) => setNewQuestion({ ...newQuestion, options: e.target.value })}
              placeholder="אפשרות 1, אפשרות 2, אפשרות 3"
            />
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              שכבות יעד (השאר ריק לכל השכבות)
            </label>
            <div className="flex gap-2 flex-wrap">
              {grades.map((grade) => (
                <button
                  key={grade}
                  type="button"
                  onClick={() => {
                    const current = newQuestion.targetGrades;
                    setNewQuestion({
                      ...newQuestion,
                      targetGrades: current.includes(grade)
                        ? current.filter((g) => g !== grade)
                        : [...current, grade],
                    });
                  }}
                  className={`w-10 h-10 rounded-lg font-medium ${
                    newQuestion.targetGrades.includes(grade)
                      ? "bg-primary text-white"
                      : "bg-gray-100"
                  }`}
                >
                  {grade}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleCreateQuestion}>שמור</Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>ביטול</Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-gray-500">טוען שאלות...</div>
      ) : questions.length === 0 ? (
        <p className="text-gray-500 text-center py-8">אין שאלות במערכת</p>
      ) : (
        <div className="space-y-4">
          {questions.map((q, i) => (
            <div key={q.id} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-sm text-gray-500">#{i + 1}</span>
                  <h3 className="font-medium">{q.text}</h3>
                  <p className="text-sm text-gray-500">
                    סוג: {questionTypes.find((t) => t.value === q.type)?.label}
                    {q.target.grades.length > 0 && ` | שכבות: ${q.target.grades.join(", ")}`}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteQuestion(q.id)}
                  className="text-error text-sm hover:underline"
                >
                  מחק
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/app/\(dashboard\)/questions/page.tsx
git commit -m "feat: add questions management page for admins"
```

---

### Task 4.3: Create Work Plans Page

**Files:**
- Create: `src/lib/services/workPlans.ts`
- Create: `src/app/(dashboard)/work-plans/page.tsx`

**Step 1: Create work plans service**

Create `src/lib/services/workPlans.ts`:

```typescript
import {
  collection,
  query,
  orderBy,
  getDocs,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { handleFirebaseError } from "@/lib/utils/errors";

export interface WorkPlan {
  id: string;
  title: string;
  description: string;
  fileUrl?: string;
  createdAt: Date;
}

const COLLECTION = "workPlans";

export async function getAllWorkPlans(): Promise<WorkPlan[]> {
  try {
    const q = query(collection(db, COLLECTION), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
    })) as WorkPlan[];
  } catch (error) {
    handleFirebaseError(error, "getAllWorkPlans");
  }
}

export async function createWorkPlan(
  data: Omit<WorkPlan, "id" | "createdAt">
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, COLLECTION), {
      ...data,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    handleFirebaseError(error, "createWorkPlan");
  }
}

export async function deleteWorkPlan(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, COLLECTION, id));
  } catch (error) {
    handleFirebaseError(error, "deleteWorkPlan");
  }
}
```

**Step 2: Create work plans page**

Create `src/app/(dashboard)/work-plans/page.tsx`:

```typescript
"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { getAllWorkPlans, createWorkPlan, deleteWorkPlan, WorkPlan } from "@/lib/services/workPlans";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function WorkPlansPage() {
  const { session } = useAuth();
  const router = useRouter();
  const [plans, setPlans] = useState<WorkPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newPlan, setNewPlan] = useState({ title: "", description: "" });

  useEffect(() => {
    if (session?.user.role !== "admin") {
      router.push("/dashboard");
    }
  }, [session, router]);

  const loadPlans = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllWorkPlans();
      setPlans(data);
    } catch {
      setError("שגיאה בטעינת תוכניות");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  async function handleCreate() {
    if (!newPlan.title.trim()) {
      setError("יש להזין כותרת");
      return;
    }

    try {
      await createWorkPlan({
        title: newPlan.title,
        description: newPlan.description,
      });
      setNewPlan({ title: "", description: "" });
      setShowForm(false);
      loadPlans();
    } catch {
      setError("שגיאה ביצירת תוכנית");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("האם למחוק תוכנית זו?")) return;
    try {
      await deleteWorkPlan(id);
      loadPlans();
    } catch {
      setError("שגיאה במחיקת תוכנית");
    }
  }

  if (session?.user.role !== "admin") {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-rubik font-bold">תוכניות עבודה</h1>
        <Button onClick={() => setShowForm(true)}>תוכנית חדשה</Button>
      </div>

      {error && (
        <div className="bg-error/10 text-error p-4 rounded-lg">{error}</div>
      )}

      {showForm && (
        <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="font-rubik font-semibold">תוכנית חדשה</h2>

          <Input
            label="כותרת"
            value={newPlan.title}
            onChange={(e) => setNewPlan({ ...newPlan, title: e.target.value })}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              תיאור
            </label>
            <textarea
              value={newPlan.description}
              onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })}
              className="w-full p-3 border rounded-lg"
              rows={4}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleCreate}>שמור</Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>ביטול</Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-gray-500">טוען תוכניות...</div>
      ) : plans.length === 0 ? (
        <p className="text-gray-500 text-center py-8">אין תוכניות עבודה</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {plans.map((plan) => (
            <div key={plan.id} className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-rubik font-semibold text-lg">{plan.title}</h3>
                <button
                  onClick={() => handleDelete(plan.id)}
                  className="text-error text-sm hover:underline"
                >
                  מחק
                </button>
              </div>
              <p className="text-gray-600">{plan.description || "אין תיאור"}</p>
              <p className="text-sm text-gray-400 mt-2">
                {plan.createdAt?.toLocaleDateString("he-IL")}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

**Step 3: Commit**

```bash
git add src/lib/services/workPlans.ts src/app/\(dashboard\)/work-plans/page.tsx
git commit -m "feat: add work plans page for admins"
```

---

## Phase 5: Final Verification

### Task 5.1: Build and Verify

**Step 1: Run build**

Run: `npm run build`
Expected: Build succeeds with no errors

**Step 2: Run lint**

Run: `npm run lint` or `npx eslint ./src`
Expected: No errors (warnings acceptable)

**Step 3: Final commit**

```bash
git add .
git commit -m "chore: code review fixes complete"
```

---

## Summary

This plan addresses:

| Category | Issues Fixed |
|----------|--------------|
| Critical Security | C1 (password storage), C2 (XSS), C3 (name validation) |
| High Priority | H1 (documentation page), H2 (error handling), H3 (memory leak), H5 (indexes) |
| Medium Priority | M3 (reply IDs), M4 (confirm dialog), M6 (validation) |
| Missing Pages | /documentation, /settings, /questions, /work-plans |

Total tasks: 12
Estimated commits: 12
