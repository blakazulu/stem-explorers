import {
  collection,
  query,
  where,
  getDocs,
  doc,
  addDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { handleFirebaseError } from "@/lib/utils/errors";
import type { ResearchJournal, Grade, JournalAnswer } from "@/types";

const COLLECTION = "researchJournals";

// Input validation constants
const MAX_NAME_LENGTH = 100;
const MAX_ANSWER_LENGTH = 5000;

function sanitizeStudentName(name: string): string {
  return name.trim().slice(0, MAX_NAME_LENGTH);
}

function sanitizeAnswers(answers: JournalAnswer[]): JournalAnswer[] {
  return answers.map((a) => ({
    ...a,
    answer:
      typeof a.answer === "string"
        ? a.answer.slice(0, MAX_ANSWER_LENGTH)
        : Array.isArray(a.answer)
        ? a.answer.map((v) => String(v).slice(0, MAX_ANSWER_LENGTH))
        : a.answer,
  }));
}

export async function getJournalsByGrade(
  gradeId: Grade
): Promise<ResearchJournal[]> {
  try {
    const q = query(
      collection(db, COLLECTION),
      where("gradeId", "==", gradeId)
    );

    const snapshot = await getDocs(q);
    const results = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      createdAt: d.data().createdAt?.toDate(),
    })) as ResearchJournal[];

    // Sort by createdAt descending (newest first)
    return results.sort((a, b) => {
      const aTime = a.createdAt?.getTime() || 0;
      const bTime = b.createdAt?.getTime() || 0;
      return bTime - aTime;
    });
  } catch (error) {
    handleFirebaseError(error, "getJournalsByGrade");
  }
}

export async function getJournalsByQuestionnaire(
  questionnaireId: string
): Promise<ResearchJournal[]> {
  try {
    const q = query(
      collection(db, COLLECTION),
      where("questionnaireId", "==", questionnaireId)
    );

    const snapshot = await getDocs(q);
    const results = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      createdAt: d.data().createdAt?.toDate(),
    })) as ResearchJournal[];

    // Sort by createdAt descending (newest first)
    return results.sort((a, b) => {
      const aTime = a.createdAt?.getTime() || 0;
      const bTime = b.createdAt?.getTime() || 0;
      return bTime - aTime;
    });
  } catch (error) {
    handleFirebaseError(error, "getJournalsByQuestionnaire");
  }
}

export async function submitJournal(data: {
  gradeId: Grade;
  studentName: string;
  questionnaireId: string;
  answers: JournalAnswer[];
}): Promise<string> {
  try {
    // Sanitize inputs before saving
    const sanitizedData = {
      ...data,
      studentName: sanitizeStudentName(data.studentName),
      answers: sanitizeAnswers(data.answers),
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, COLLECTION), sanitizedData);
    return docRef.id;
  } catch (error) {
    handleFirebaseError(error, "submitJournal");
  }
}

export async function deleteJournal(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, COLLECTION, id));
  } catch (error) {
    handleFirebaseError(error, "deleteJournal");
  }
}

export async function getTodaysJournals(): Promise<ResearchJournal[]> {
  try {
    // Get start of today in local time
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const q = query(
      collection(db, COLLECTION),
      where("createdAt", ">=", today)
    );

    const snapshot = await getDocs(q);
    const results = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      createdAt: d.data().createdAt?.toDate(),
    })) as ResearchJournal[];

    // Sort by createdAt descending (newest first)
    return results.sort((a, b) => {
      const aTime = a.createdAt?.getTime() || 0;
      const bTime = b.createdAt?.getTime() || 0;
      return bTime - aTime;
    });
  } catch (error) {
    handleFirebaseError(error, "getTodaysJournals");
  }
}
