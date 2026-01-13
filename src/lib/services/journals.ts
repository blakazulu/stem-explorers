import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { ResearchJournal, Grade, JournalAnswer } from "@/types";

const COLLECTION = "researchJournals";

export async function getJournalsByUnit(
  unitId: string,
  gradeId: Grade
): Promise<ResearchJournal[]> {
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
}

export async function submitJournal(data: {
  unitId: string;
  gradeId: Grade;
  studentName: string;
  answers: JournalAnswer[];
}): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}
