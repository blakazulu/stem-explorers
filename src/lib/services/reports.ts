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
