# Globe Monitor (גלוב-ניטורר) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement a weather/environment monitoring feature where admin manages global questions and students view submitted data in a calendar.

**Architecture:** Single route with role-based views - admin sees question management, students see calendar with submissions. Questions stored in `globeMonitorQuestions` collection, submissions in `globeMonitorSubmissions`. Auto-seeds default questions on first admin visit.

**Tech Stack:** Next.js 16 App Router, TypeScript, Firebase Firestore, TanStack Query, Tailwind CSS, Lucide Icons

---

## Task 1: Add Globe Monitor Types

**Files:**
- Create: `src/types/globeMonitor.ts`
- Modify: `src/types/index.ts`

**Step 1: Create the types file**

Create `src/types/globeMonitor.ts`:

```typescript
// Globe Monitor question types
export type GlobeMonitorQuestionType = "text" | "number" | "date" | "time" | "single" | "multi";

// Question definition
export interface GlobeMonitorQuestion {
  id: string;
  label: string;
  description?: string;
  type: GlobeMonitorQuestionType;
  options?: string[];      // For single/multi select
  unit?: string;           // For number type (e.g., "°C", "%")
  min?: number;            // For number type
  max?: number;            // For number type
  required: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

// Submission
export interface GlobeMonitorSubmission {
  id: string;
  answers: Record<string, string | number | string[]>;
  submittedBy: string;
  submittedByName: string;
  submittedAt: Date;
  date: string;            // YYYY-MM-DD for calendar grouping
}

// Default questions configuration
export const DEFAULT_GLOBE_MONITOR_QUESTIONS: Omit<GlobeMonitorQuestion, "id" | "createdAt" | "updatedAt">[] = [
  {
    label: "תאריך",
    type: "date",
    required: true,
    order: 0,
  },
  {
    label: "שעה",
    type: "time",
    required: true,
    order: 1,
  },
  {
    label: "טמפרטורה",
    type: "number",
    unit: "°C",
    required: false,
    order: 2,
  },
  {
    label: "לחות",
    type: "number",
    unit: "%",
    max: 100,
    required: false,
    order: 3,
  },
  {
    label: "עננות - סוגי העננים",
    type: "multi",
    options: ["קומולוס", "סטרטוס", "ציררוס", "קומולונימבוס", "ערפל", "שמיים בהירים"],
    required: false,
    order: 4,
  },
  {
    label: "אחוז כיסוי בשמים",
    type: "number",
    unit: "%",
    min: 0,
    max: 100,
    required: false,
    order: 5,
  },
  {
    label: "משקעים",
    type: "single",
    options: ["יש", "אין"],
    required: false,
    order: 6,
  },
  {
    label: "מצב הקרקע",
    type: "single",
    options: ["יבשה", "רטובה", "בוצית"],
    required: false,
    order: 7,
  },
];
```

**Step 2: Export from types index**

Add to `src/types/index.ts`:

```typescript
// Globe Monitor
export type {
  GlobeMonitorQuestionType,
  GlobeMonitorQuestion,
  GlobeMonitorSubmission,
} from "./globeMonitor";
export { DEFAULT_GLOBE_MONITOR_QUESTIONS } from "./globeMonitor";
```

**Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 4: Commit**

```bash
git add src/types/globeMonitor.ts src/types/index.ts
git commit -m "feat(globe-monitor): add type definitions"
```

---

## Task 2: Create Globe Monitor Firebase Service

**Files:**
- Create: `src/lib/services/globeMonitor.ts`

**Step 1: Create the service file**

Create `src/lib/services/globeMonitor.ts`:

```typescript
import {
  collection,
  query,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  orderBy,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { handleFirebaseError } from "@/lib/utils/errors";
import type { GlobeMonitorQuestion, GlobeMonitorSubmission } from "@/types";
import { DEFAULT_GLOBE_MONITOR_QUESTIONS } from "@/types";

const QUESTIONS_COLLECTION = "globeMonitorQuestions";
const SUBMISSIONS_COLLECTION = "globeMonitorSubmissions";

// ============ QUESTIONS ============

export async function getGlobeMonitorQuestions(): Promise<GlobeMonitorQuestion[]> {
  try {
    const q = query(
      collection(db, QUESTIONS_COLLECTION),
      orderBy("order", "asc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      createdAt: d.data().createdAt?.toDate(),
      updatedAt: d.data().updatedAt?.toDate(),
    })) as GlobeMonitorQuestion[];
  } catch (error) {
    handleFirebaseError(error, "getGlobeMonitorQuestions");
    return [];
  }
}

export async function getGlobeMonitorQuestion(id: string): Promise<GlobeMonitorQuestion | null> {
  try {
    const docRef = doc(db, QUESTIONS_COLLECTION, id);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;
    return {
      id: snapshot.id,
      ...snapshot.data(),
      createdAt: snapshot.data().createdAt?.toDate(),
      updatedAt: snapshot.data().updatedAt?.toDate(),
    } as GlobeMonitorQuestion;
  } catch (error) {
    handleFirebaseError(error, "getGlobeMonitorQuestion");
    return null;
  }
}

export async function createGlobeMonitorQuestion(
  data: Omit<GlobeMonitorQuestion, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, QUESTIONS_COLLECTION), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    handleFirebaseError(error, "createGlobeMonitorQuestion");
    throw error;
  }
}

export async function updateGlobeMonitorQuestion(
  id: string,
  data: Partial<Omit<GlobeMonitorQuestion, "id" | "createdAt" | "updatedAt">>
): Promise<void> {
  try {
    await updateDoc(doc(db, QUESTIONS_COLLECTION, id), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirebaseError(error, "updateGlobeMonitorQuestion");
    throw error;
  }
}

export async function deleteGlobeMonitorQuestion(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, QUESTIONS_COLLECTION, id));
  } catch (error) {
    handleFirebaseError(error, "deleteGlobeMonitorQuestion");
    throw error;
  }
}

export async function seedDefaultQuestions(): Promise<void> {
  try {
    const existing = await getGlobeMonitorQuestions();
    if (existing.length > 0) return; // Already seeded

    for (const questionData of DEFAULT_GLOBE_MONITOR_QUESTIONS) {
      await addDoc(collection(db, QUESTIONS_COLLECTION), {
        ...questionData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirebaseError(error, "seedDefaultQuestions");
    throw error;
  }
}

// ============ SUBMISSIONS ============

export async function getGlobeMonitorSubmissions(): Promise<GlobeMonitorSubmission[]> {
  try {
    const q = query(
      collection(db, SUBMISSIONS_COLLECTION),
      orderBy("submittedAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      submittedAt: d.data().submittedAt?.toDate(),
    })) as GlobeMonitorSubmission[];
  } catch (error) {
    handleFirebaseError(error, "getGlobeMonitorSubmissions");
    return [];
  }
}

export async function getGlobeMonitorSubmissionsByMonth(
  year: number,
  month: number
): Promise<GlobeMonitorSubmission[]> {
  try {
    // Create date range for the month (YYYY-MM format prefix)
    const monthStr = String(month).padStart(2, "0");
    const startDate = `${year}-${monthStr}-01`;
    const endDate = `${year}-${monthStr}-31`;

    const q = query(
      collection(db, SUBMISSIONS_COLLECTION),
      where("date", ">=", startDate),
      where("date", "<=", endDate),
      orderBy("date", "asc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      submittedAt: d.data().submittedAt?.toDate(),
    })) as GlobeMonitorSubmission[];
  } catch (error) {
    handleFirebaseError(error, "getGlobeMonitorSubmissionsByMonth");
    return [];
  }
}

export async function getGlobeMonitorSubmission(id: string): Promise<GlobeMonitorSubmission | null> {
  try {
    const docRef = doc(db, SUBMISSIONS_COLLECTION, id);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;
    return {
      id: snapshot.id,
      ...snapshot.data(),
      submittedAt: snapshot.data().submittedAt?.toDate(),
    } as GlobeMonitorSubmission;
  } catch (error) {
    handleFirebaseError(error, "getGlobeMonitorSubmission");
    return null;
  }
}
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/lib/services/globeMonitor.ts
git commit -m "feat(globe-monitor): add Firebase service for questions and submissions"
```

---

## Task 3: Add React Query Hooks

**Files:**
- Modify: `src/lib/queries/keys.ts`
- Create: `src/lib/queries/globeMonitor.ts`
- Modify: `src/lib/queries/index.ts`

**Step 1: Add query keys**

Add to `src/lib/queries/keys.ts`:

```typescript
  globeMonitor: {
    questions: ["globeMonitor", "questions"] as const,
    question: (id: string) => ["globeMonitor", "questions", id] as const,
    submissions: ["globeMonitor", "submissions"] as const,
    submissionsByMonth: (year: number, month: number) =>
      ["globeMonitor", "submissions", year, month] as const,
    submission: (id: string) => ["globeMonitor", "submissions", id] as const,
  },
```

**Step 2: Create hooks file**

Create `src/lib/queries/globeMonitor.ts`:

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./keys";
import {
  getGlobeMonitorQuestions,
  getGlobeMonitorQuestion,
  createGlobeMonitorQuestion,
  updateGlobeMonitorQuestion,
  deleteGlobeMonitorQuestion,
  seedDefaultQuestions,
  getGlobeMonitorSubmissionsByMonth,
  getGlobeMonitorSubmission,
} from "@/lib/services/globeMonitor";
import type { GlobeMonitorQuestion } from "@/types";

// ============ QUESTIONS ============

export function useGlobeMonitorQuestions() {
  return useQuery({
    queryKey: queryKeys.globeMonitor.questions,
    queryFn: getGlobeMonitorQuestions,
  });
}

export function useGlobeMonitorQuestion(id: string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.globeMonitor.question(id!),
    queryFn: () => getGlobeMonitorQuestion(id!),
    enabled: !!id,
  });
}

export function useCreateGlobeMonitorQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createGlobeMonitorQuestion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.globeMonitor.questions });
    },
  });
}

export function useUpdateGlobeMonitorQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Omit<GlobeMonitorQuestion, "id" | "createdAt" | "updatedAt">>;
    }) => updateGlobeMonitorQuestion(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.globeMonitor.questions });
    },
  });
}

export function useDeleteGlobeMonitorQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteGlobeMonitorQuestion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.globeMonitor.questions });
    },
  });
}

export function useSeedDefaultQuestions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: seedDefaultQuestions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.globeMonitor.questions });
    },
  });
}

// ============ SUBMISSIONS ============

export function useGlobeMonitorSubmissionsByMonth(year: number, month: number) {
  return useQuery({
    queryKey: queryKeys.globeMonitor.submissionsByMonth(year, month),
    queryFn: () => getGlobeMonitorSubmissionsByMonth(year, month),
  });
}

export function useGlobeMonitorSubmission(id: string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.globeMonitor.submission(id!),
    queryFn: () => getGlobeMonitorSubmission(id!),
    enabled: !!id,
  });
}
```

**Step 3: Export from index**

Add to `src/lib/queries/index.ts`:

```typescript
// Globe Monitor
export {
  useGlobeMonitorQuestions,
  useGlobeMonitorQuestion,
  useCreateGlobeMonitorQuestion,
  useUpdateGlobeMonitorQuestion,
  useDeleteGlobeMonitorQuestion,
  useSeedDefaultQuestions,
  useGlobeMonitorSubmissionsByMonth,
  useGlobeMonitorSubmission,
} from "./globeMonitor";
```

**Step 4: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 5: Commit**

```bash
git add src/lib/queries/keys.ts src/lib/queries/globeMonitor.ts src/lib/queries/index.ts
git commit -m "feat(globe-monitor): add React Query hooks"
```

---

## Task 4: Add Sidebar Navigation

**Files:**
- Modify: `src/components/dashboard/Sidebar.tsx`

**Step 1: Add Globe icon import**

Add `Globe` to the lucide-react imports at the top of the file.

**Step 2: Add nav item**

Add to the `navItems` array (after "experts" item, before "questions"):

```typescript
{ label: "גלוב-ניטורר", href: "/globe-monitor", roles: ["admin", "student"], icon: Globe },
```

**Step 3: Verify the app builds**

Run: `npm run build`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add src/components/dashboard/Sidebar.tsx
git commit -m "feat(globe-monitor): add sidebar navigation link"
```

---

## Task 5: Add to Visibility Defaults

**Files:**
- Modify: `src/lib/constants/visibility-defaults.ts`

**Step 1: Add to ALL_DASHBOARD_CARDS**

Add to `ALL_DASHBOARD_CARDS` object:

```typescript
"globe-monitor": { label: "גלוב-ניטורר", description: "צפייה בנתוני ניטור סביבתי" },
```

**Step 2: Add to ALL_SIDEBAR_LINKS**

Add to `ALL_SIDEBAR_LINKS` object:

```typescript
"globe-monitor": { defaultLabel: "גלוב-ניטורר", href: "/globe-monitor" },
```

**Step 3: Add to DEFAULT_STUDENT_DASHBOARD cards**

Add to the `DEFAULT_STUDENT_DASHBOARD.cards` array:

```typescript
{ id: "globe-monitor", visible: true, order: 4 },
```

**Step 4: Add to DEFAULT_STUDENT_SIDEBAR links**

Add to the `DEFAULT_STUDENT_SIDEBAR.links` array:

```typescript
{ id: "globe-monitor", label: "גלוב-ניטורר", visible: true },
```

**Step 5: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 6: Commit**

```bash
git add src/lib/constants/visibility-defaults.ts
git commit -m "feat(globe-monitor): add to visibility defaults for student role"
```

---

## Task 6: Create Admin Question List Page

**Files:**
- Create: `src/app/(dashboard)/[role]/globe-monitor/page.tsx`

**Step 1: Create the main page with role-based routing**

Create `src/app/(dashboard)/[role]/globe-monitor/page.tsx`:

```typescript
"use client";

import { useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import type { UserRole } from "@/types";
import AdminQuestionList from "./components/AdminQuestionList";
import StudentCalendarView from "./components/StudentCalendarView";

export default function GlobeMonitorPage() {
  const { session } = useAuth();
  const params = useParams();
  const role = params.role as UserRole;

  if (!session) return null;

  // Role-based view
  if (role === "admin") {
    return <AdminQuestionList />;
  }

  return <StudentCalendarView />;
}
```

**Step 2: Commit**

```bash
git add src/app/(dashboard)/[role]/globe-monitor/page.tsx
git commit -m "feat(globe-monitor): add main page with role-based routing"
```

---

## Task 7: Create Admin Question List Component

**Files:**
- Create: `src/app/(dashboard)/[role]/globe-monitor/components/AdminQuestionList.tsx`

**Step 1: Create the component**

Create `src/app/(dashboard)/[role]/globe-monitor/components/AdminQuestionList.tsx`:

```typescript
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import {
  useGlobeMonitorQuestions,
  useSeedDefaultQuestions,
  useDeleteGlobeMonitorQuestion,
} from "@/lib/queries";
import { useToastActions } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  Globe,
  Plus,
  Edit2,
  Trash2,
  Hash,
  Type,
  Calendar,
  Clock,
  List,
  CheckSquare,
  AlertCircle,
} from "lucide-react";
import type { GlobeMonitorQuestion, GlobeMonitorQuestionType } from "@/types";

const questionTypeIcons: Record<GlobeMonitorQuestionType, typeof Type> = {
  text: Type,
  number: Hash,
  date: Calendar,
  time: Clock,
  single: List,
  multi: CheckSquare,
};

const questionTypeLabels: Record<GlobeMonitorQuestionType, string> = {
  text: "טקסט חופשי",
  number: "מספר",
  date: "תאריך",
  time: "שעה",
  single: "בחירה בודדת",
  multi: "בחירה מרובה",
};

export default function AdminQuestionList() {
  const { session } = useAuth();
  const router = useRouter();
  const toast = useToastActions();

  const { data: questions, isLoading } = useGlobeMonitorQuestions();
  const seedMutation = useSeedDefaultQuestions();
  const deleteMutation = useDeleteGlobeMonitorQuestion();

  const [deleteQuestionId, setDeleteQuestionId] = useState<string | null>(null);
  const [hasSeeded, setHasSeeded] = useState(false);

  const isAdmin = session?.user.role === "admin";

  // Redirect non-admins
  useEffect(() => {
    if (session && !isAdmin) {
      router.replace(`/${session.user.role}/globe-monitor`);
    }
  }, [session, isAdmin, router]);

  // Auto-seed default questions on first visit
  useEffect(() => {
    if (!isLoading && questions && questions.length === 0 && !hasSeeded && !seedMutation.isPending) {
      setHasSeeded(true);
      seedMutation.mutate(undefined, {
        onSuccess: () => {
          toast.success("שאלות ברירת מחדל נוצרו");
        },
        onError: () => {
          toast.error("שגיאה ביצירת שאלות ברירת מחדל");
        },
      });
    }
  }, [isLoading, questions, hasSeeded, seedMutation, toast]);

  const handleDelete = () => {
    if (!deleteQuestionId) return;
    deleteMutation.mutate(deleteQuestionId, {
      onSuccess: () => {
        toast.success("השאלה נמחקה");
        setDeleteQuestionId(null);
      },
      onError: () => {
        toast.error("שגיאה במחיקת השאלה");
      },
    });
  };

  if (!isAdmin) return null;

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex flex-col items-center gap-4">
        <Image
          src="/bg/globe.jpg"
          alt="Globe Monitor"
          width={120}
          height={120}
          className="rounded-full shadow-lg"
        />
        <div className="text-center">
          <h1 className="text-xl md:text-2xl font-rubik font-bold text-foreground flex items-center justify-center gap-2">
            <Globe className="text-role-admin" size={28} />
            גלוב-ניטורר
          </h1>
          <p className="text-sm text-gray-500 mt-1">ניהול שאלות הניטור</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end">
        <Link href={`/${session?.user.role}/globe-monitor/questions/new`}>
          <Button rightIcon={Plus}>הוסף שאלה חדשה</Button>
        </Link>
      </div>

      {/* Questions List */}
      {isLoading || seedMutation.isPending ? (
        <div className="space-y-3">
          <Skeleton variant="card" height={80} />
          <Skeleton variant="card" height={80} />
          <Skeleton variant="card" height={80} />
        </div>
      ) : questions && questions.length > 0 ? (
        <div className="space-y-3">
          {questions
            .sort((a, b) => a.order - b.order)
            .map((question) => (
              <QuestionCard
                key={question.id}
                question={question}
                onEdit={() =>
                  router.push(
                    `/${session?.user.role}/globe-monitor/questions/${question.id}`
                  )
                }
                onDelete={() => setDeleteQuestionId(question.id)}
                isDeleting={deleteMutation.isPending && deleteQuestionId === question.id}
              />
            ))}
        </div>
      ) : (
        <EmptyState
          icon={AlertCircle}
          title="אין שאלות"
          description="לא נמצאו שאלות. הוסף שאלה חדשה להתחיל."
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteQuestionId !== null}
        title="מחיקת שאלה"
        message="האם אתה בטוח שברצונך למחוק שאלה זו? פעולה זו לא ניתנת לביטול."
        confirmLabel="מחק"
        onConfirm={handleDelete}
        onCancel={() => setDeleteQuestionId(null)}
        variant="danger"
      />
    </div>
  );
}

interface QuestionCardProps {
  question: GlobeMonitorQuestion;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}

function QuestionCard({ question, onEdit, onDelete, isDeleting }: QuestionCardProps) {
  const TypeIcon = questionTypeIcons[question.type];
  const typeLabel = questionTypeLabels[question.type];

  return (
    <Card className="p-4">
      <div className="flex items-start gap-4">
        {/* Order Badge */}
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-surface-2 text-sm font-medium text-gray-500 shrink-0">
          {question.order + 1}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <TypeIcon size={16} className="text-primary" />
            <span className="text-xs text-gray-500">{typeLabel}</span>
            {question.required && (
              <span className="text-xs bg-error/10 text-error px-2 py-0.5 rounded">
                חובה
              </span>
            )}
            {question.unit && (
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                {question.unit}
              </span>
            )}
          </div>
          <p className="font-medium text-foreground">{question.label}</p>
          {question.description && (
            <p className="text-sm text-gray-500 mt-1">{question.description}</p>
          )}
          {question.options && question.options.length > 0 && (
            <p className="text-xs text-gray-400 mt-2">
              אפשרויות: {question.options.join(" • ")}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-1 shrink-0">
          <button
            onClick={onEdit}
            className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
            title="ערוך"
          >
            <Edit2 size={18} />
          </button>
          <button
            onClick={onDelete}
            disabled={isDeleting}
            className="p-2 text-gray-400 hover:text-error hover:bg-error/10 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            title="מחק"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </Card>
  );
}
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/app/(dashboard)/[role]/globe-monitor/components/AdminQuestionList.tsx
git commit -m "feat(globe-monitor): add admin question list component"
```

---

## Task 8: Create Question Form Component

**Files:**
- Create: `src/app/(dashboard)/[role]/globe-monitor/components/QuestionForm.tsx`

**Step 1: Create the shared form component**

Create `src/app/(dashboard)/[role]/globe-monitor/components/QuestionForm.tsx`:

```typescript
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import {
  Save,
  X,
  Plus,
  Hash,
  Type,
  Calendar,
  Clock,
  List,
  CheckSquare,
} from "lucide-react";
import type { GlobeMonitorQuestion, GlobeMonitorQuestionType } from "@/types";

const questionTypes: {
  value: GlobeMonitorQuestionType;
  label: string;
  icon: typeof Type;
  color: string;
}[] = [
  { value: "text", label: "טקסט חופשי", icon: Type, color: "text-role-student" },
  { value: "number", label: "מספר", icon: Hash, color: "text-primary" },
  { value: "date", label: "תאריך", icon: Calendar, color: "text-accent" },
  { value: "time", label: "שעה", icon: Clock, color: "text-secondary" },
  { value: "single", label: "בחירה בודדת", icon: List, color: "text-role-teacher" },
  { value: "multi", label: "בחירה מרובה", icon: CheckSquare, color: "text-role-parent" },
];

interface QuestionFormProps {
  initialData?: GlobeMonitorQuestion;
  onSubmit: (data: Omit<GlobeMonitorQuestion, "id" | "createdAt" | "updatedAt">) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  nextOrder: number;
}

export default function QuestionForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
  nextOrder,
}: QuestionFormProps) {
  const [label, setLabel] = useState(initialData?.label || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [type, setType] = useState<GlobeMonitorQuestionType>(initialData?.type || "text");
  const [options, setOptions] = useState<string[]>(initialData?.options || []);
  const [unit, setUnit] = useState(initialData?.unit || "");
  const [min, setMin] = useState<number | "">(initialData?.min ?? "");
  const [max, setMax] = useState<number | "">(initialData?.max ?? "");
  const [required, setRequired] = useState(initialData?.required || false);
  const [newOption, setNewOption] = useState("");

  const isChoiceType = type === "single" || type === "multi";
  const isNumberType = type === "number";
  const hasEnoughOptions = !isChoiceType || options.length >= 2;
  const isValid = label.trim().length > 0 && hasEnoughOptions;

  const addOption = () => {
    if (newOption.trim() && !options.includes(newOption.trim())) {
      setOptions([...options, newOption.trim()]);
      setNewOption("");
    }
  };

  const removeOption = (opt: string) => {
    setOptions(options.filter((o) => o !== opt));
  };

  const handleSubmit = () => {
    if (!isValid) return;

    const data: Omit<GlobeMonitorQuestion, "id" | "createdAt" | "updatedAt"> = {
      label: label.trim(),
      type,
      required,
      order: initialData?.order ?? nextOrder,
    };

    if (description.trim()) {
      data.description = description.trim();
    }

    if (isChoiceType && options.length > 0) {
      data.options = options;
    }

    if (isNumberType) {
      if (unit.trim()) data.unit = unit.trim();
      if (min !== "") data.min = Number(min);
      if (max !== "") data.max = Number(max);
    }

    onSubmit(data);
  };

  return (
    <Card className="p-6 space-y-6">
      {/* Question Type */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          סוג השאלה
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {questionTypes.map((t) => {
            const IconComponent = t.icon;
            const isSelected = type === t.value;
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => setType(t.value)}
                disabled={isSubmitting}
                className={`p-3 rounded-lg border-2 text-center transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-surface-3 hover:border-primary/50"
                }`}
              >
                <IconComponent
                  size={20}
                  className={`mx-auto mb-1 ${isSelected ? t.color : "text-gray-400"}`}
                />
                <span
                  className={`text-xs ${isSelected ? "text-foreground" : "text-gray-500"}`}
                >
                  {t.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Label */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          שם השאלה *
        </label>
        <Input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="לדוגמה: טמפרטורה"
          disabled={isSubmitting}
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          תיאור/הנחיה (אופציונלי)
        </label>
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="הסבר קצר למילוי השדה"
          disabled={isSubmitting}
        />
      </div>

      {/* Number type fields */}
      {isNumberType && (
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              יחידה
            </label>
            <Input
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="°C, %, מ'"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              מינימום
            </label>
            <Input
              type="number"
              value={min}
              onChange={(e) => setMin(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="0"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              מקסימום
            </label>
            <Input
              type="number"
              value={max}
              onChange={(e) => setMax(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="100"
              disabled={isSubmitting}
            />
          </div>
        </div>
      )}

      {/* Choice options */}
      {isChoiceType && (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-foreground">
            אפשרויות בחירה (לפחות 2) *
          </label>
          <div className="flex gap-2">
            <Input
              value={newOption}
              onChange={(e) => setNewOption(e.target.value)}
              placeholder="הוסף אפשרות"
              disabled={isSubmitting}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addOption();
                }
              }}
            />
            <Button onClick={addOption} disabled={isSubmitting || !newOption.trim()}>
              <Plus size={18} />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {options.map((opt) => (
              <span
                key={opt}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-surface-1 border border-surface-3 rounded-lg text-sm"
              >
                {opt}
                <button
                  onClick={() => removeOption(opt)}
                  disabled={isSubmitting}
                  className="text-gray-400 hover:text-error cursor-pointer"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
            {options.length === 0 && (
              <span className="text-sm text-gray-400">לא נוספו אפשרויות</span>
            )}
          </div>
        </div>
      )}

      {/* Required checkbox */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="required"
          checked={required}
          onChange={(e) => setRequired(e.target.checked)}
          disabled={isSubmitting}
          className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
        />
        <label htmlFor="required" className="text-sm text-foreground cursor-pointer">
          שדה חובה
        </label>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-surface-2">
        <Button variant="ghost" onClick={onCancel} disabled={isSubmitting}>
          ביטול
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!isValid || isSubmitting}
          loading={isSubmitting}
          rightIcon={Save}
        >
          {initialData ? "עדכן" : "צור שאלה"}
        </Button>
      </div>
    </Card>
  );
}
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/app/(dashboard)/[role]/globe-monitor/components/QuestionForm.tsx
git commit -m "feat(globe-monitor): add question form component"
```

---

## Task 9: Create New Question Page

**Files:**
- Create: `src/app/(dashboard)/[role]/globe-monitor/questions/new/page.tsx`

**Step 1: Create the page**

Create `src/app/(dashboard)/[role]/globe-monitor/questions/new/page.tsx`:

```typescript
"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { useGlobeMonitorQuestions, useCreateGlobeMonitorQuestion } from "@/lib/queries";
import { useToastActions } from "@/components/ui/Toast";
import QuestionForm from "../../components/QuestionForm";
import { Globe, ArrowRight } from "lucide-react";
import type { UserRole } from "@/types";

export default function NewQuestionPage() {
  const { session } = useAuth();
  const router = useRouter();
  const params = useParams();
  const toast = useToastActions();
  const role = params.role as UserRole;

  const { data: questions } = useGlobeMonitorQuestions();
  const createMutation = useCreateGlobeMonitorQuestion();

  const isAdmin = session?.user.role === "admin";
  const backUrl = `/${role}/globe-monitor`;

  // Redirect non-admins
  useEffect(() => {
    if (session && !isAdmin) {
      router.replace(`/${session.user.role}/globe-monitor`);
    }
  }, [session, isAdmin, router]);

  const handleSubmit = (data: Parameters<typeof createMutation.mutate>[0]) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        toast.success("השאלה נוצרה בהצלחה");
        router.push(backUrl);
      },
      onError: () => {
        toast.error("שגיאה ביצירת השאלה");
      },
    });
  };

  if (!isAdmin) return null;

  const nextOrder = questions ? Math.max(...questions.map((q) => q.order), -1) + 1 : 0;

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href={backUrl}
          className="p-2 hover:bg-surface-2 rounded-lg transition-colors cursor-pointer"
          title="חזרה"
        >
          <ArrowRight size={20} className="text-gray-500" />
        </Link>
        <Image
          src="/bg/globe.jpg"
          alt="Globe Monitor"
          width={48}
          height={48}
          className="rounded-full"
        />
        <div>
          <h1 className="text-xl font-rubik font-bold text-foreground flex items-center gap-2">
            <Globe className="text-role-admin" size={24} />
            שאלה חדשה
          </h1>
          <p className="text-sm text-gray-500">הוסף שאלה חדשה לטופס הניטור</p>
        </div>
      </div>

      {/* Form */}
      <QuestionForm
        onSubmit={handleSubmit}
        onCancel={() => router.push(backUrl)}
        isSubmitting={createMutation.isPending}
        nextOrder={nextOrder}
      />
    </div>
  );
}
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/app/(dashboard)/[role]/globe-monitor/questions/new/page.tsx
git commit -m "feat(globe-monitor): add new question page"
```

---

## Task 10: Create Edit Question Page

**Files:**
- Create: `src/app/(dashboard)/[role]/globe-monitor/questions/[id]/page.tsx`

**Step 1: Create the page**

Create `src/app/(dashboard)/[role]/globe-monitor/questions/[id]/page.tsx`:

```typescript
"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { useGlobeMonitorQuestion, useUpdateGlobeMonitorQuestion } from "@/lib/queries";
import { useToastActions } from "@/components/ui/Toast";
import { Skeleton } from "@/components/ui/Skeleton";
import QuestionForm from "../../components/QuestionForm";
import { Globe, ArrowRight } from "lucide-react";
import type { UserRole } from "@/types";

export default function EditQuestionPage() {
  const { session } = useAuth();
  const router = useRouter();
  const params = useParams();
  const toast = useToastActions();
  const role = params.role as UserRole;
  const questionId = params.id as string;

  const { data: question, isLoading } = useGlobeMonitorQuestion(questionId);
  const updateMutation = useUpdateGlobeMonitorQuestion();

  const isAdmin = session?.user.role === "admin";
  const backUrl = `/${role}/globe-monitor`;

  // Redirect non-admins
  useEffect(() => {
    if (session && !isAdmin) {
      router.replace(`/${session.user.role}/globe-monitor`);
    }
  }, [session, isAdmin, router]);

  // Redirect if question not found
  useEffect(() => {
    if (!isLoading && !question) {
      router.replace(backUrl);
    }
  }, [isLoading, question, backUrl, router]);

  const handleSubmit = (data: Parameters<typeof updateMutation.mutate>[0]["data"]) => {
    updateMutation.mutate(
      { id: questionId, data },
      {
        onSuccess: () => {
          toast.success("השאלה עודכנה בהצלחה");
          router.push(backUrl);
        },
        onError: () => {
          toast.error("שגיאה בעדכון השאלה");
        },
      }
    );
  };

  if (!isAdmin) return null;

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-2xl">
        <Skeleton variant="text" width={200} height={32} />
        <Skeleton variant="card" height={400} />
      </div>
    );
  }

  if (!question) return null;

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href={backUrl}
          className="p-2 hover:bg-surface-2 rounded-lg transition-colors cursor-pointer"
          title="חזרה"
        >
          <ArrowRight size={20} className="text-gray-500" />
        </Link>
        <Image
          src="/bg/globe.jpg"
          alt="Globe Monitor"
          width={48}
          height={48}
          className="rounded-full"
        />
        <div>
          <h1 className="text-xl font-rubik font-bold text-foreground flex items-center gap-2">
            <Globe className="text-role-admin" size={24} />
            עריכת שאלה
          </h1>
          <p className="text-sm text-gray-500">{question.label}</p>
        </div>
      </div>

      {/* Form */}
      <QuestionForm
        initialData={question}
        onSubmit={handleSubmit}
        onCancel={() => router.push(backUrl)}
        isSubmitting={updateMutation.isPending}
        nextOrder={question.order}
      />
    </div>
  );
}
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/app/(dashboard)/[role]/globe-monitor/questions/[id]/page.tsx
git commit -m "feat(globe-monitor): add edit question page"
```

---

## Task 11: Create Student Calendar View Component

**Files:**
- Create: `src/app/(dashboard)/[role]/globe-monitor/components/StudentCalendarView.tsx`

**Step 1: Create the component**

Create `src/app/(dashboard)/[role]/globe-monitor/components/StudentCalendarView.tsx`:

```typescript
"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import {
  useGlobeMonitorSubmissionsByMonth,
  useGlobeMonitorQuestions,
} from "@/lib/queries";
import { Skeleton } from "@/components/ui/Skeleton";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  Globe,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Clock,
  Thermometer,
  Droplets,
  Cloud,
  Eye,
  X,
} from "lucide-react";
import type { GlobeMonitorSubmission, GlobeMonitorQuestion } from "@/types";

const HEBREW_MONTHS = [
  "ינואר",
  "פברואר",
  "מרץ",
  "אפריל",
  "מאי",
  "יוני",
  "יולי",
  "אוגוסט",
  "ספטמבר",
  "אוקטובר",
  "נובמבר",
  "דצמבר",
];

const HEBREW_DAYS = ["א'", "ב'", "ג'", "ד'", "ה'", "ו'", "ש'"];

export default function StudentCalendarView() {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<GlobeMonitorSubmission | null>(null);

  const { data: submissions, isLoading: submissionsLoading } =
    useGlobeMonitorSubmissionsByMonth(currentYear, currentMonth);
  const { data: questions, isLoading: questionsLoading } = useGlobeMonitorQuestions();

  const isLoading = submissionsLoading || questionsLoading;

  // Group submissions by date
  const submissionsByDate = useMemo(() => {
    if (!submissions) return {};
    return submissions.reduce((acc, sub) => {
      if (!acc[sub.date]) acc[sub.date] = [];
      acc[sub.date].push(sub);
      return acc;
    }, {} as Record<string, GlobeMonitorSubmission[]>);
  }, [submissions]);

  // Get days in month
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1).getDay();

  // Navigation
  const goToPrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelectedDate(null);
  };

  const goToNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelectedDate(null);
  };

  const handleDateClick = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    setSelectedDate(selectedDate === dateStr ? null : dateStr);
  };

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex flex-col items-center gap-4">
        <Image
          src="/bg/globe.jpg"
          alt="Globe Monitor"
          width={120}
          height={120}
          className="rounded-full shadow-lg"
        />
        <div className="text-center">
          <h1 className="text-xl md:text-2xl font-rubik font-bold text-foreground flex items-center justify-center gap-2">
            <Globe className="text-role-student" size={28} />
            גלוב-ניטורר
          </h1>
          <p className="text-sm text-gray-500 mt-1">צפייה בנתוני ניטור</p>
        </div>
      </div>

      {/* Calendar */}
      <Card className="p-4">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={goToNextMonth}
            className="p-2 hover:bg-surface-2 rounded-lg transition-colors cursor-pointer"
          >
            <ChevronRight size={20} />
          </button>
          <h2 className="text-lg font-rubik font-semibold">
            {HEBREW_MONTHS[currentMonth - 1]} {currentYear}
          </h2>
          <button
            onClick={goToPrevMonth}
            className="p-2 hover:bg-surface-2 rounded-lg transition-colors cursor-pointer"
          >
            <ChevronLeft size={20} />
          </button>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {HEBREW_DAYS.map((day) => (
            <div
              key={day}
              className="text-center text-xs font-medium text-gray-500 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        {isLoading ? (
          <Skeleton variant="card" height={250} />
        ) : (
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for days before the first of the month */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="h-12" />
            ))}

            {/* Days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const hasData = submissionsByDate[dateStr]?.length > 0;
              const isToday = dateStr === todayStr;
              const isSelected = dateStr === selectedDate;

              return (
                <button
                  key={day}
                  onClick={() => handleDateClick(day)}
                  className={`h-12 rounded-lg text-sm font-medium transition-all cursor-pointer relative ${
                    isSelected
                      ? "bg-primary text-white"
                      : isToday
                      ? "bg-primary/20 text-primary"
                      : hasData
                      ? "bg-success/10 hover:bg-success/20"
                      : "hover:bg-surface-2"
                  }`}
                >
                  {day}
                  {hasData && !isSelected && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-success" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </Card>

      {/* Submissions for Selected Date */}
      {selectedDate && (
        <div className="space-y-3 animate-slide-up">
          <h3 className="font-rubik font-semibold flex items-center gap-2">
            <Calendar size={18} className="text-primary" />
            {formatHebrewDate(selectedDate)}
          </h3>

          {submissionsByDate[selectedDate]?.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {submissionsByDate[selectedDate].map((submission) => (
                <SubmissionCard
                  key={submission.id}
                  submission={submission}
                  questions={questions || []}
                  onViewDetails={() => setSelectedSubmission(submission)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Calendar}
              title="אין נתונים"
              description="לא נרשמו נתוני ניטור בתאריך זה"
            />
          )}
        </div>
      )}

      {/* Submission Detail Modal */}
      {selectedSubmission && (
        <SubmissionDetailModal
          submission={selectedSubmission}
          questions={questions || []}
          onClose={() => setSelectedSubmission(null)}
        />
      )}
    </div>
  );
}

interface SubmissionCardProps {
  submission: GlobeMonitorSubmission;
  questions: GlobeMonitorQuestion[];
  onViewDetails: () => void;
}

function SubmissionCard({ submission, questions, onViewDetails }: SubmissionCardProps) {
  // Find common fields for summary display
  const timeQuestion = questions.find((q) => q.type === "time");
  const tempQuestion = questions.find((q) => q.label.includes("טמפרטורה"));
  const humidityQuestion = questions.find((q) => q.label.includes("לחות"));
  const cloudQuestion = questions.find((q) => q.label.includes("עננות"));

  const time = timeQuestion ? submission.answers[timeQuestion.id] : null;
  const temp = tempQuestion ? submission.answers[tempQuestion.id] : null;
  const humidity = humidityQuestion ? submission.answers[humidityQuestion.id] : null;
  const clouds = cloudQuestion ? submission.answers[cloudQuestion.id] : null;

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="space-y-2">
        {time && (
          <div className="flex items-center gap-2 text-sm">
            <Clock size={14} className="text-gray-400" />
            <span>{time}</span>
          </div>
        )}
        {temp !== null && temp !== undefined && (
          <div className="flex items-center gap-2 text-sm">
            <Thermometer size={14} className="text-error" />
            <span>{temp}°C</span>
          </div>
        )}
        {humidity !== null && humidity !== undefined && (
          <div className="flex items-center gap-2 text-sm">
            <Droplets size={14} className="text-primary" />
            <span>{humidity}%</span>
          </div>
        )}
        {clouds && (
          <div className="flex items-center gap-2 text-sm">
            <Cloud size={14} className="text-gray-400" />
            <span className="truncate">
              {Array.isArray(clouds) ? clouds.join(", ") : clouds}
            </span>
          </div>
        )}
      </div>
      <button
        onClick={onViewDetails}
        className="mt-3 w-full flex items-center justify-center gap-2 text-sm text-primary hover:bg-primary/10 py-2 rounded-lg transition-colors cursor-pointer"
      >
        <Eye size={16} />
        צפה בפרטים
      </button>
    </Card>
  );
}

interface SubmissionDetailModalProps {
  submission: GlobeMonitorSubmission;
  questions: GlobeMonitorQuestion[];
  onClose: () => void;
}

function SubmissionDetailModal({
  submission,
  questions,
  onClose,
}: SubmissionDetailModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <Card className="w-full max-w-md max-h-[80vh] overflow-y-auto animate-scale-in">
        {/* Header */}
        <div className="sticky top-0 bg-white p-4 border-b border-surface-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/bg/globe.jpg"
              alt="Globe"
              width={40}
              height={40}
              className="rounded-full"
            />
            <div>
              <h3 className="font-rubik font-semibold">פרטי ניטור</h3>
              <p className="text-xs text-gray-500">
                {formatHebrewDate(submission.date)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-surface-2 rounded-lg transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {questions
            .sort((a, b) => a.order - b.order)
            .map((question) => {
              const answer = submission.answers[question.id];
              if (answer === undefined || answer === null || answer === "") return null;

              return (
                <div key={question.id} className="border-b border-surface-2 pb-3 last:border-0">
                  <p className="text-sm text-gray-500 mb-1">{question.label}</p>
                  <p className="font-medium">
                    {Array.isArray(answer) ? answer.join(", ") : answer}
                    {question.unit && ` ${question.unit}`}
                  </p>
                </div>
              );
            })}

          <div className="pt-2 text-xs text-gray-400">
            נרשם על ידי: {submission.submittedByName}
          </div>
        </div>
      </Card>
    </div>
  );
}

function formatHebrewDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  return `${day} ב${HEBREW_MONTHS[month - 1]} ${year}`;
}
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/app/(dashboard)/[role]/globe-monitor/components/StudentCalendarView.tsx
git commit -m "feat(globe-monitor): add student calendar view component"
```

---

## Task 12: Update CHANGELOG

**Files:**
- Modify: `CHANGELOG.md`

**Step 1: Add changelog entry**

Add under `[Unreleased]` section:

```markdown
### Added
- Globe Monitor (גלוב-ניטורר) feature for weather/environment monitoring
  - Admin can manage global monitoring questions (CRUD)
  - Auto-seeds default questions on first admin visit
  - Question types: text, number, date, time, single-select, multi-select
  - Students can view submitted data in calendar format
  - Role-based sidebar visibility configuration
```

**Step 2: Commit**

```bash
git add CHANGELOG.md
git commit -m "docs: add globe-monitor feature to changelog"
```

---

## Task 13: Verify Build

**Step 1: Run full build**

Run: `npm run build`
Expected: Build succeeds without errors

**Step 2: Run lint**

Run: `npm run lint`
Expected: No lint errors

**Step 3: Final commit if needed**

If there are any fixes needed, commit them.

---

## Summary

This plan implements the Globe Monitor feature in 13 tasks:

1. **Types** - Data structures for questions and submissions
2. **Firebase Service** - CRUD operations for Firestore
3. **React Query Hooks** - Data fetching and mutations
4. **Sidebar Navigation** - Add nav link for admin and student
5. **Visibility Defaults** - Configure student sidebar/dashboard
6. **Main Page** - Role-based routing
7. **Admin Question List** - List, delete, auto-seed
8. **Question Form** - Shared create/edit form
9. **New Question Page** - Create new questions
10. **Edit Question Page** - Edit existing questions
11. **Student Calendar View** - Calendar with submission display
12. **CHANGELOG** - Document the feature
13. **Build Verification** - Ensure everything compiles

Each task is self-contained with clear steps for implementation and verification.
