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
const ALL_GRADES: Grade[] = ["א", "ב", "ג", "ד", "ה", "ו"];

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

  // Only initialize if no app exists
  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  return getFirestore(app);
}

// Format date as YYYY-MM-DD
function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

// Get today's journals from Firestore
async function getTodaysJournals(db: ReturnType<typeof getFirestore>): Promise<ResearchJournal[]> {
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

// Check if daily report already exists
async function checkDailyReportExists(
  db: ReturnType<typeof getFirestore>,
  gradeId: Grade,
  date: Date
): Promise<boolean> {
  const dateStr = formatDate(date);
  const reportId = `${gradeId}-daily-${dateStr}`;
  const docRef = doc(db, "reports", reportId);
  const snapshot = await getDoc(docRef);
  return snapshot.exists();
}

// Save generated report to Firestore
async function saveReport(
  db: ReturnType<typeof getFirestore>,
  gradeId: Grade,
  teacherContent: string,
  parentContent: string,
  date: Date
): Promise<void> {
  const dateStr = formatDate(date);
  const reportId = `${gradeId}-daily-${dateStr}`;
  const unitId = `daily-${dateStr}`;

  await setDoc(doc(db, "reports", reportId), {
    unitId,
    gradeId,
    teacherContent,
    parentContent,
    generatedAt: Timestamp.now(),
  });
}

// Get report config for AI instructions
async function getReportConfig(db: ReturnType<typeof getFirestore>): Promise<string> {
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

/**
 * Scheduled function that runs daily at 23:00 Israel time (UTC+2/+3)
 * Generates AI reports for all research journals submitted that day
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

    // Group journals by grade
    const journalsByGrade: Record<Grade, ResearchJournal[]> = {} as Record<Grade, ResearchJournal[]>;
    for (const journal of journals) {
      const grade = journal.gradeId;
      if (!journalsByGrade[grade]) {
        journalsByGrade[grade] = [];
      }
      journalsByGrade[grade].push(journal);
    }

    // Get AI prompt instructions from settings
    const aiPromptInstructions = await getReportConfig(db);

    // Generate reports for each grade that has journals
    const results: { grade: Grade; status: "generated" | "skipped" | "error"; error?: string }[] = [];

    for (const grade of ALL_GRADES) {
      const gradeJournals = journalsByGrade[grade];

      if (!gradeJournals || gradeJournals.length === 0) {
        continue; // No journals for this grade
      }

      try {
        // Check if report already exists
        const exists = await checkDailyReportExists(db, grade, today);
        if (exists) {
          console.log(`Report for grade ${grade} already exists. Skipping.`);
          results.push({ grade, status: "skipped" });
          continue;
        }

        // Generate report using Gemini AI
        console.log(`Generating report for grade ${grade} (${gradeJournals.length} journals)...`);
        const unitName = `סיכום יומי - ${dateStr}`;
        const { teacherContent, parentContent } = await generateReportContent(
          gradeJournals,
          unitName,
          aiPromptInstructions
        );

        // Save to Firestore
        await saveReport(db, grade, teacherContent, parentContent, today);
        console.log(`Report for grade ${grade} saved successfully.`);
        results.push({ grade, status: "generated" });

      } catch (error) {
        console.error(`Failed to generate report for grade ${grade}:`, error);
        results.push({
          grade,
          status: "error",
          error: error instanceof Error ? error.message : "Unknown error"
        });
      }
    }

    const summary = {
      date: dateStr,
      totalJournals: journals.length,
      generated: results.filter(r => r.status === "generated").map(r => r.grade),
      skipped: results.filter(r => r.status === "skipped").map(r => r.grade),
      errors: results.filter(r => r.status === "error").map(r => ({ grade: r.grade, error: r.error })),
    };

    console.log("Daily report generation complete:", JSON.stringify(summary, null, 2));

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
        details: error instanceof Error ? error.message : "Unknown error"
      }),
    };
  }
});
