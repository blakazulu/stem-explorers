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
