# Reports Refactor Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Refactor reports to be grade+questionnaire+date based instead of unit-based.

**Architecture:** Reports are now identified by `{gradeId}-{questionnaireId}-{YYYY-MM-DD}`. The UI shows a list of reports per grade (sorted by date, newest first) instead of a unit selector. Generation groups journals by grade AND questionnaire.

**Tech Stack:** Next.js 16, TypeScript, Firebase/Firestore, TanStack Query, Netlify Functions, Google Gemini AI

---

## Task 1: Update Report Type

**Files:**
- Modify: `src/types/index.ts:99-106`

**Step 1: Update the Report interface**

Replace lines 99-106:

```typescript
// AI-generated report
export interface Report {
  id: string;
  gradeId: Grade;
  questionnaireId: string;
  questionnaireName: string;
  journalCount: number;
  teacherContent: string;
  parentContent: string;
  generatedAt: Date;
}
```

**Step 2: Verify no TypeScript errors**

Run: `npm run build`

Expected: Build will fail with type errors in files still using `unitId` - this is expected and will be fixed in subsequent tasks.

**Step 3: Commit**

```bash
git add src/types/index.ts
git commit -m "refactor(types): update Report interface - remove unitId, add questionnaireId fields"
```

---

## Task 2: Update Query Keys

**Files:**
- Modify: `src/lib/queries/keys.ts:22-25`

**Step 1: Update report query keys**

Replace lines 22-25:

```typescript
  reports: {
    byGrade: (gradeId: Grade) => ["reports", "byGrade", gradeId] as const,
    single: (reportId: string) => ["reports", reportId] as const,
  },
```

**Step 2: Commit**

```bash
git add src/lib/queries/keys.ts
git commit -m "refactor(queries): update report query keys for grade-based model"
```

---

## Task 3: Update Reports Service

**Files:**
- Modify: `src/lib/services/reports.ts` (full rewrite)

**Step 1: Rewrite the reports service**

Replace entire file content:

```typescript
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  getDoc,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { handleFirebaseError } from "@/lib/utils/errors";
import type { Report, Grade, ResearchJournal } from "@/types";

const COLLECTION = "reports";

// Format date as YYYY-MM-DD
function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

// Generate report ID: {gradeId}-{questionnaireId}-{YYYY-MM-DD}
export function getReportId(
  gradeId: Grade,
  questionnaireId: string,
  date: Date
): string {
  const dateStr = formatDate(date);
  return `${gradeId}-${questionnaireId}-${dateStr}`;
}

// Get all reports for a grade, sorted by date (newest first)
export async function getReportsByGrade(gradeId: Grade): Promise<Report[]> {
  try {
    const q = query(
      collection(db, COLLECTION),
      where("gradeId", "==", gradeId),
      orderBy("generatedAt", "desc")
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      generatedAt: d.data().generatedAt?.toDate(),
    })) as Report[];
  } catch (error) {
    handleFirebaseError(error, "getReportsByGrade");
    return [];
  }
}

// Get a single report by ID
export async function getReportById(reportId: string): Promise<Report | null> {
  try {
    const docRef = doc(db, COLLECTION, reportId);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) return null;

    return {
      id: snapshot.id,
      ...snapshot.data(),
      generatedAt: snapshot.data().generatedAt?.toDate(),
    } as Report;
  } catch (error) {
    handleFirebaseError(error, "getReportById");
    return null;
  }
}

// Check if report exists for a specific grade+questionnaire+date
export async function checkReportExists(
  gradeId: Grade,
  questionnaireId: string,
  date: Date
): Promise<boolean> {
  try {
    const reportId = getReportId(gradeId, questionnaireId, date);
    const docRef = doc(db, COLLECTION, reportId);
    const snapshot = await getDoc(docRef);
    return snapshot.exists();
  } catch (error) {
    handleFirebaseError(error, "checkReportExists");
    return false;
  }
}

// Generate and save a report for a specific grade+questionnaire
export async function generateReport(
  gradeId: Grade,
  questionnaireId: string,
  questionnaireName: string,
  journals: ResearchJournal[],
  date: Date = new Date()
): Promise<Report> {
  try {
    const headers: HeadersInit = { "Content-Type": "application/json" };

    // Add API secret if configured
    const apiSecret = process.env.NEXT_PUBLIC_REPORT_API_SECRET;
    if (apiSecret) {
      headers["x-api-secret"] = apiSecret;
    }

    const response = await fetch("/.netlify/functions/generate-report", {
      method: "POST",
      headers,
      body: JSON.stringify({
        journals,
        questionnaireName,
        journalCount: journals.length,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to generate report");
    }

    const { teacherContent, parentContent } = await response.json();

    const reportId = getReportId(gradeId, questionnaireId, date);
    const report: Omit<Report, "id"> = {
      gradeId,
      questionnaireId,
      questionnaireName,
      journalCount: journals.length,
      teacherContent,
      parentContent,
      generatedAt: new Date(),
    };

    await setDoc(doc(db, COLLECTION, reportId), {
      ...report,
      generatedAt: serverTimestamp(),
    });

    return { id: reportId, ...report };
  } catch (error) {
    handleFirebaseError(error, "generateReport");
    throw error;
  }
}
```

**Step 2: Commit**

```bash
git add src/lib/services/reports.ts
git commit -m "refactor(services): rewrite reports service for grade+questionnaire model"
```

---

## Task 4: Update Reports Query Hooks

**Files:**
- Modify: `src/lib/queries/reports.ts` (full rewrite)

**Step 1: Rewrite the reports query hooks**

Replace entire file content:

```typescript
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "./keys";
import { getReportsByGrade, getReportById } from "@/lib/services/reports";
import type { Grade } from "@/types";

export function useReportsByGrade(gradeId: Grade | null | undefined) {
  return useQuery({
    queryKey: queryKeys.reports.byGrade(gradeId!),
    queryFn: () => getReportsByGrade(gradeId!),
    enabled: !!gradeId,
  });
}

export function useReport(reportId: string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.reports.single(reportId!),
    queryFn: () => getReportById(reportId!),
    enabled: !!reportId,
  });
}
```

**Step 2: Update exports in index**

Check `src/lib/queries/index.ts` and ensure `useReportsByGrade` and `useReport` are exported. The old `useGenerateReport` hook is no longer needed (generation happens via admin settings page).

**Step 3: Commit**

```bash
git add src/lib/queries/reports.ts src/lib/queries/index.ts
git commit -m "refactor(queries): update report hooks for grade-based model"
```

---

## Task 5: Update Netlify Generate Report Function

**Files:**
- Modify: `netlify/functions/generate-report.ts`

**Step 1: Update the function to accept questionnaireName**

Replace entire file content:

```typescript
import { Handler } from "@netlify/functions";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || "");

/**
 * Core report generation logic - used by both on-demand handler and scheduled function
 */
export async function generateReportContent(
  journals: Array<{ answers: unknown }>,
  questionnaireName: string,
  journalCount: number,
  aiPromptInstructions?: string
): Promise<{ teacherContent: string; parentContent: string }> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const journalSummary = journals
    .map((j, i: number) => `תלמיד ${i + 1}: ${JSON.stringify(j.answers)}`)
    .join("\n");

  const prompt = `
אתה מנתח נתונים חינוכיים. יש לך ${journalCount} תגובות לשאלון "${questionnaireName}".

נתוני התגובות:
${journalSummary}

${aiPromptInstructions || ""}

צור שני דוחות:
1. דוח למורים - מפורט, כולל ניתוח דפוסים, אתגרים, והמלצות פדגוגיות
2. דוח להורים - תמציתי וידידותי, מתמקד בהישגים והתקדמות

החזר בפורמט JSON:
{
  "teacherContent": "תוכן הדוח למורים בעברית (markdown)",
  "parentContent": "תוכן הדוח להורים בעברית (markdown)"
}
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  // Extract JSON from response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Failed to parse AI response");
  }

  return JSON.parse(jsonMatch[0]);
}

/**
 * On-demand report generation endpoint
 * Used by the admin settings page for manual report generation
 */
export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  // Validate API secret to prevent unauthorized access
  const apiSecret = process.env.REPORT_API_SECRET;
  if (apiSecret && event.headers["x-api-secret"] !== apiSecret) {
    return { statusCode: 401, body: JSON.stringify({ error: "Unauthorized" }) };
  }

  try {
    const { journals, questionnaireName, journalCount, reportConfig } = JSON.parse(
      event.body || "{}"
    );

    if (!journals || journals.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "No journals provided" }),
      };
    }

    const { teacherContent, parentContent } = await generateReportContent(
      journals,
      questionnaireName || "שאלון",
      journalCount || journals.length,
      reportConfig?.aiPromptInstructions
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ teacherContent, parentContent }),
    };
  } catch (error) {
    console.error("Report generation error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Failed to generate report",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
    };
  }
};
```

**Step 2: Commit**

```bash
git add netlify/functions/generate-report.ts
git commit -m "refactor(netlify): update generate-report to use questionnaireName"
```

---

## Task 6: Update Netlify Scheduled Daily Reports Function

**Files:**
- Modify: `netlify/functions/generate-daily-reports.ts`

**Step 1: Update to group by grade AND questionnaire**

Replace entire file content:

```typescript
import { schedule } from "@netlify/functions";
import { initializeApp, getApps } from "firebase/app";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  getDoc,
  Timestamp,
} from "firebase/firestore";
import { generateReportContent } from "./generate-report";

// Types
type Grade = "א" | "ב" | "ג" | "ד" | "ה" | "ו";

interface ResearchJournal {
  id: string;
  gradeId: Grade;
  studentName: string;
  questionnaireId: string;
  answers: Array<{
    questionId: string;
    questionText: string;
    answer: string | number | string[];
  }>;
  createdAt: Date;
}

interface Questionnaire {
  id: string;
  name: string;
  gradeId: Grade;
}

// Initialize Firebase (singleton pattern for serverless)
function getFirebaseDb() {
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  const app =
    getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  return getFirestore(app);
}

// Format date as YYYY-MM-DD
function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

// Get today's journals from Firestore
async function getTodaysJournals(
  db: ReturnType<typeof getFirestore>
): Promise<ResearchJournal[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const q = query(
    collection(db, "researchJournals"),
    where("createdAt", ">=", Timestamp.fromDate(today))
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    createdAt: d.data().createdAt?.toDate(),
  })) as ResearchJournal[];
}

// Get questionnaire by ID
async function getQuestionnaire(
  db: ReturnType<typeof getFirestore>,
  questionnaireId: string
): Promise<Questionnaire | null> {
  try {
    const docRef = doc(db, "questionnaires", questionnaireId);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;
    return { id: snapshot.id, ...snapshot.data() } as Questionnaire;
  } catch {
    return null;
  }
}

// Check if report already exists
async function checkReportExists(
  db: ReturnType<typeof getFirestore>,
  gradeId: Grade,
  questionnaireId: string,
  date: Date
): Promise<boolean> {
  const dateStr = formatDate(date);
  const reportId = `${gradeId}-${questionnaireId}-${dateStr}`;
  const docRef = doc(db, "reports", reportId);
  const snapshot = await getDoc(docRef);
  return snapshot.exists();
}

// Save generated report to Firestore
async function saveReport(
  db: ReturnType<typeof getFirestore>,
  gradeId: Grade,
  questionnaireId: string,
  questionnaireName: string,
  journalCount: number,
  teacherContent: string,
  parentContent: string,
  date: Date
): Promise<void> {
  const dateStr = formatDate(date);
  const reportId = `${gradeId}-${questionnaireId}-${dateStr}`;

  await setDoc(doc(db, "reports", reportId), {
    gradeId,
    questionnaireId,
    questionnaireName,
    journalCount,
    teacherContent,
    parentContent,
    generatedAt: Timestamp.now(),
  });
}

// Get report config for AI instructions
async function getReportConfig(
  db: ReturnType<typeof getFirestore>
): Promise<string> {
  try {
    const docRef = doc(db, "settings", "reportConfig");
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return snapshot.data().aiPromptInstructions || "";
    }
  } catch (error) {
    console.error("Failed to get report config:", error);
  }
  return "";
}

// Group key for grade+questionnaire
function groupKey(gradeId: Grade, questionnaireId: string): string {
  return `${gradeId}|${questionnaireId}`;
}

/**
 * Scheduled function that runs daily at 23:00 Israel time (UTC+2/+3)
 * Generates AI reports for each grade+questionnaire combo that has submissions
 *
 * Cron: "0 21 * * *" = 21:00 UTC = ~23:00-00:00 Israel time
 */
export const handler = schedule("0 21 * * *", async () => {
  console.log("Starting daily report generation...");

  const db = getFirebaseDb();
  const today = new Date();
  const dateStr = formatDate(today);

  try {
    // Fetch today's journals
    const journals = await getTodaysJournals(db);
    console.log(`Found ${journals.length} journals for ${dateStr}`);

    if (journals.length === 0) {
      console.log("No journals found for today. Skipping report generation.");
      return { statusCode: 200, body: "No journals to process" };
    }

    // Group journals by grade AND questionnaire
    const journalsByGroup: Map<string, ResearchJournal[]> = new Map();
    for (const journal of journals) {
      const key = groupKey(journal.gradeId, journal.questionnaireId);
      if (!journalsByGroup.has(key)) {
        journalsByGroup.set(key, []);
      }
      journalsByGroup.get(key)!.push(journal);
    }

    // Get AI prompt instructions from settings
    const aiPromptInstructions = await getReportConfig(db);

    // Generate reports for each grade+questionnaire combo
    const results: {
      grade: Grade;
      questionnaire: string;
      status: "generated" | "skipped" | "error";
      error?: string;
    }[] = [];

    for (const [key, groupJournals] of journalsByGroup) {
      const [gradeId, questionnaireId] = key.split("|") as [Grade, string];

      try {
        // Check if report already exists
        const exists = await checkReportExists(db, gradeId, questionnaireId, today);
        if (exists) {
          console.log(
            `Report for grade ${gradeId}, questionnaire ${questionnaireId} already exists. Skipping.`
          );
          results.push({
            grade: gradeId,
            questionnaire: questionnaireId,
            status: "skipped",
          });
          continue;
        }

        // Get questionnaire name
        const questionnaire = await getQuestionnaire(db, questionnaireId);
        const questionnaireName = questionnaire?.name || "שאלון";

        // Generate report using Gemini AI
        console.log(
          `Generating report for grade ${gradeId}, questionnaire "${questionnaireName}" (${groupJournals.length} journals)...`
        );

        const { teacherContent, parentContent } = await generateReportContent(
          groupJournals,
          questionnaireName,
          groupJournals.length,
          aiPromptInstructions
        );

        // Save to Firestore
        await saveReport(
          db,
          gradeId,
          questionnaireId,
          questionnaireName,
          groupJournals.length,
          teacherContent,
          parentContent,
          today
        );

        console.log(
          `Report for grade ${gradeId}, questionnaire "${questionnaireName}" saved successfully.`
        );
        results.push({
          grade: gradeId,
          questionnaire: questionnaireId,
          status: "generated",
        });
      } catch (error) {
        console.error(
          `Failed to generate report for grade ${gradeId}, questionnaire ${questionnaireId}:`,
          error
        );
        results.push({
          grade: gradeId,
          questionnaire: questionnaireId,
          status: "error",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    const summary = {
      date: dateStr,
      totalJournals: journals.length,
      totalGroups: journalsByGroup.size,
      generated: results.filter((r) => r.status === "generated").length,
      skipped: results.filter((r) => r.status === "skipped").length,
      errors: results
        .filter((r) => r.status === "error")
        .map((r) => ({
          grade: r.grade,
          questionnaire: r.questionnaire,
          error: r.error,
        })),
    };

    console.log(
      "Daily report generation complete:",
      JSON.stringify(summary, null, 2)
    );

    return {
      statusCode: 200,
      body: JSON.stringify(summary),
    };
  } catch (error) {
    console.error("Daily report generation failed:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Failed to generate daily reports",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
    };
  }
});
```

**Step 2: Commit**

```bash
git add netlify/functions/generate-daily-reports.ts
git commit -m "refactor(netlify): update scheduled reports to group by grade+questionnaire"
```

---

## Task 7: Rewrite Reports Grade Page (List View)

**Files:**
- Modify: `src/app/(dashboard)/[role]/reports/[grade]/page.tsx` (full rewrite)

**Step 1: Rewrite the page to show report list**

Replace entire file content:

```tsx
"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useReportsByGrade } from "@/lib/queries";
import { Card } from "@/components/ui/Card";
import { SkeletonGrid } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  BarChart2,
  ArrowRight,
  Calendar,
  FileText,
  Users,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import type { Grade, UserRole, Report } from "@/types";

const VALID_GRADES: Grade[] = ["א", "ב", "ג", "ד", "ה", "ו"];

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("he-IL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export default function ReportsListPage() {
  const { session } = useAuth();
  const params = useParams();
  const router = useRouter();

  const role = params.role as UserRole;
  const grade = decodeURIComponent(params.grade as string) as Grade;

  const isValidGrade = VALID_GRADES.includes(grade);
  const isAdmin = session?.user.role === "admin";
  const isTeacher = session?.user.role === "teacher";
  const isParent = session?.user.role === "parent";
  const showBackButton = isAdmin;

  const [expandedReportId, setExpandedReportId] = useState<string | null>(null);

  const { data: reports = [], isLoading } = useReportsByGrade(
    isValidGrade ? grade : null
  );

  // Redirect if invalid grade
  if (!isValidGrade) {
    router.replace(`/${role}/reports`);
    return null;
  }

  function toggleReport(reportId: string) {
    setExpandedReportId((prev) => (prev === reportId ? null : reportId));
  }

  // Determine which content to show based on role
  function getReportContent(report: Report): string {
    if (isParent) {
      return report.parentContent;
    }
    return report.teacherContent;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        {showBackButton && (
          <Link
            href={`/${role}/reports`}
            className="p-2 hover:bg-surface-2 rounded-lg transition-colors cursor-pointer"
            title="חזרה לבחירת כיתה"
          >
            <ArrowRight size={20} className="text-gray-500" />
          </Link>
        )}
        <div className="p-3 bg-secondary/10 rounded-xl">
          <BarChart2 size={24} className="text-secondary" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-rubik font-bold text-foreground">
            דוחות - כיתה {grade}
          </h1>
          <p className="text-sm text-gray-500">
            {reports.length} דוחות
          </p>
        </div>
      </div>

      {/* Reports List */}
      {isLoading ? (
        <SkeletonGrid count={4} columns={1} />
      ) : reports.length === 0 ? (
        <EmptyState
          icon="file-text"
          title="אין דוחות"
          description={`עדיין לא נוצרו דוחות לכיתה ${grade}`}
        />
      ) : (
        <div className="space-y-4">
          {reports.map((report, index) => {
            const isExpanded = expandedReportId === report.id;

            return (
              <Card
                key={report.id}
                className={`overflow-hidden animate-slide-up stagger-${Math.min(index + 1, 6)}`}
              >
                {/* Header - Always visible */}
                <button
                  onClick={() => toggleReport(report.id)}
                  className="w-full flex items-center justify-between p-4 text-right cursor-pointer hover:bg-surface-1 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-secondary/10 rounded-full">
                      <FileText size={20} className="text-secondary" />
                    </div>
                    <div>
                      <h3 className="font-rubik font-semibold text-foreground">
                        {report.questionnaireName}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {report.generatedAt
                            ? formatDate(report.generatedAt)
                            : "לא ידוע"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users size={14} />
                          {report.journalCount} תגובות
                        </span>
                      </div>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp size={20} className="text-gray-400" />
                  ) : (
                    <ChevronDown size={20} className="text-gray-400" />
                  )}
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-surface-2 p-4 animate-slide-up">
                    <div className="prose prose-sm max-w-none text-foreground">
                      <ReactMarkdown>{getReportContent(report)}</ReactMarkdown>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/app/(dashboard)/[role]/reports/[grade]/page.tsx
git commit -m "refactor(pages): rewrite reports grade page as list view"
```

---

## Task 8: Delete Old Unit-Based Report Page

**Files:**
- Delete: `src/app/(dashboard)/[role]/reports/[grade]/[unitId]/page.tsx`

**Step 1: Delete the file**

```bash
rm src/app/(dashboard)/[role]/reports/[grade]/[unitId]/page.tsx
```

**Step 2: Delete the directory if empty**

```bash
rmdir src/app/(dashboard)/[role]/reports/[grade]/[unitId]
```

**Step 3: Commit**

```bash
git add -A
git commit -m "refactor(pages): remove unit-based report viewer page"
```

---

## Task 9: Update Admin Settings Page - Report Generation

**Files:**
- Modify: `src/app/(dashboard)/[role]/settings/page.tsx`

**Step 1: Update imports**

Find the imports section and update:

```tsx
import {
  generateReport,
  checkReportExists,
  getReportId,
} from "@/lib/services/reports";
import { getQuestionnairesByGrade } from "@/lib/services/questionnaires";
```

Remove old imports:
- Remove `generateDailyReport`
- Remove `checkDailyReportExists`

**Step 2: Update the handleGenerateDailyReports function**

Find and replace the `handleGenerateDailyReports` function:

```tsx
async function handleGenerateDailyReports() {
  if (gradesWithJournals.length === 0) return;

  setIsGenerating(true);
  setGenerationError(null);
  setGenerationProgress({
    current: 0,
    total: 0,
    completedGrades: [],
    skippedGrades: [],
  });

  const today = new Date();
  const completedItems: string[] = [];
  const skippedItems: string[] = [];

  // Group today's journals by grade AND questionnaire
  const journalsByGroup: Map<string, { gradeId: Grade; questionnaireId: string; journals: typeof todaysJournals }> = new Map();

  for (const journal of todaysJournals) {
    const key = `${journal.gradeId}|${journal.questionnaireId}`;
    if (!journalsByGroup.has(key)) {
      journalsByGroup.set(key, {
        gradeId: journal.gradeId,
        questionnaireId: journal.questionnaireId,
        journals: [],
      });
    }
    journalsByGroup.get(key)!.journals.push(journal);
  }

  const totalGroups = journalsByGroup.size;
  let currentIndex = 0;

  setGenerationProgress((prev) => ({ ...prev, total: totalGroups }));

  for (const [key, group] of journalsByGroup) {
    currentIndex++;
    setGenerationProgress((prev) => ({ ...prev, current: currentIndex }));

    try {
      // Check if report already exists
      const exists = await checkReportExists(group.gradeId, group.questionnaireId, today);
      if (exists) {
        skippedItems.push(`${group.gradeId}-${group.questionnaireId}`);
        setGenerationProgress((prev) => ({
          ...prev,
          skippedGrades: [...prev.skippedGrades, group.gradeId],
        }));
        continue;
      }

      // Get questionnaire name
      const questionnaires = await getQuestionnairesByGrade(group.gradeId);
      const questionnaire = questionnaires.find((q) => q.id === group.questionnaireId);
      const questionnaireName = questionnaire?.name || "שאלון";

      // Generate report
      await generateReport(
        group.gradeId,
        group.questionnaireId,
        questionnaireName,
        group.journals,
        today
      );

      completedItems.push(`${group.gradeId}-${questionnaireName}`);
      setGenerationProgress((prev) => ({
        ...prev,
        completedGrades: [...prev.completedGrades, group.gradeId],
      }));
    } catch (error) {
      console.error(`Failed to generate report for ${key}:`, error);
      setGenerationError(`שגיאה ביצירת דוח עבור ${group.gradeId}`);
    }
  }

  setIsGenerating(false);
}
```

**Step 3: Commit**

```bash
git add src/app/(dashboard)/[role]/settings/page.tsx
git commit -m "refactor(settings): update report generation to group by questionnaire"
```

---

## Task 10: Update CHANGELOG

**Files:**
- Modify: `CHANGELOG.md`

**Step 1: Add entry under [Unreleased]**

Add under the appropriate section:

```markdown
### Changed
- Reports are now generated per grade+questionnaire+date instead of per unit
- Reports page shows a list of reports sorted by date (newest first)
- Each report card displays questionnaire name, date, and response count
- Removed unit selector from reports navigation

### Removed
- Removed unitId from Report type (legacy field)
- Removed unit-based report viewer page
```

**Step 2: Commit**

```bash
git add CHANGELOG.md
git commit -m "docs: update CHANGELOG for reports refactor"
```

---

## Task 11: Build and Verify

**Step 1: Run TypeScript check**

Run: `npm run build`

Expected: Build succeeds with no type errors.

**Step 2: Run linter**

Run: `npm run lint`

Expected: No lint errors.

**Step 3: Manual testing checklist**

- [ ] Admin can view grade selector on reports page
- [ ] Teacher sees reports list for their grade directly
- [ ] Parent sees reports list for their grade
- [ ] Reports show questionnaire name, date, journal count
- [ ] Clicking report expands to show content
- [ ] Teachers see teacherContent, parents see parentContent
- [ ] Admin settings "generate reports" works (groups by questionnaire)

**Step 4: Final commit if any fixes needed**

```bash
git add -A
git commit -m "fix: address any issues found during testing"
```

---

## Task 12: Create Firestore Index (if needed)

The query `getReportsByGrade` uses `where("gradeId", "==", ...)` with `orderBy("generatedAt", "desc")`.

If Firestore throws an index error, create a composite index:

**Collection:** `reports`
**Fields:**
- `gradeId` (Ascending)
- `generatedAt` (Descending)

This can be done via the Firebase Console or by clicking the link in the error message.

---

## Summary

Total tasks: 12
Estimated commits: 11

Key changes:
1. Report type updated (removed unitId, added questionnaire fields)
2. Services/queries rewritten for new model
3. Netlify functions updated to group by questionnaire
4. UI simplified to list view (no unit selector)
5. Role-based content display preserved
