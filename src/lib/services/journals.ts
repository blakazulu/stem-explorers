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
    const docRef = await addDoc(collection(db, COLLECTION), {
      ...data,
      createdAt: serverTimestamp(),
    });
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
