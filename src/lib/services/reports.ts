import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Report, Grade, ResearchJournal } from "@/types";

const COLLECTION = "reports";

export async function getReport(
  unitId: string,
  gradeId: Grade
): Promise<Report | null> {
  const q = query(
    collection(db, COLLECTION),
    where("unitId", "==", unitId),
    where("gradeId", "==", gradeId)
  );

  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;

  const doc = snapshot.docs[0];
  return {
    id: doc.id,
    ...doc.data(),
    generatedAt: doc.data().generatedAt?.toDate(),
  } as Report;
}

export async function generateReport(
  unitId: string,
  unitName: string,
  gradeId: Grade,
  journals: ResearchJournal[]
): Promise<Report> {
  const response = await fetch("/.netlify/functions/generate-report", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ journals, unitName }),
  });

  if (!response.ok) {
    throw new Error("Failed to generate report");
  }

  const { teacherContent, parentContent } = await response.json();

  const reportId = `${gradeId}-${unitId}`;
  const report: Omit<Report, "id"> = {
    unitId,
    gradeId,
    teacherContent,
    parentContent,
    generatedAt: new Date(),
  };

  await setDoc(doc(db, COLLECTION, reportId), {
    ...report,
    generatedAt: serverTimestamp(),
  });

  return { id: reportId, ...report };
}
