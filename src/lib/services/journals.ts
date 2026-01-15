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

export async function getJournalsByUnit(
  unitId: string,
  gradeId: Grade
): Promise<ResearchJournal[]> {
  try {
    const q = query(
      collection(db, COLLECTION),
      where("unitId", "==", unitId),
      where("gradeId", "==", gradeId)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
    })) as ResearchJournal[];
  } catch (error) {
    handleFirebaseError(error, "getJournalsByUnit");
  }
}

export async function submitJournal(data: {
  unitId: string;
  gradeId: Grade;
  studentName: string;
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
