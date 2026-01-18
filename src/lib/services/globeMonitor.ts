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
