import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { handleFirebaseError } from "@/lib/utils/errors";
import type { Questionnaire, Grade } from "@/types";

const COLLECTION = "questionnaires";

export async function getQuestionnairesByGrade(
  grade: Grade
): Promise<Questionnaire[]> {
  try {
    const q = query(
      collection(db, COLLECTION),
      where("gradeId", "==", grade)
    );

    const snapshot = await getDocs(q);
    const results = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      createdAt: d.data().createdAt?.toDate(),
      updatedAt: d.data().updatedAt?.toDate(),
    })) as Questionnaire[];

    // Sort client-side to avoid requiring a composite index
    return results.sort((a, b) => {
      const aTime = a.updatedAt?.getTime() || 0;
      const bTime = b.updatedAt?.getTime() || 0;
      return bTime - aTime;
    });
  } catch (error) {
    handleFirebaseError(error, "getQuestionnairesByGrade");
  }
}

export async function getActiveQuestionnaire(
  gradeId: Grade,
  unitId: string
): Promise<Questionnaire | null> {
  try {
    const q = query(
      collection(db, COLLECTION),
      where("gradeId", "==", gradeId),
      where("unitId", "==", unitId),
      where("isActive", "==", true)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    const d = snapshot.docs[0];
    return {
      id: d.id,
      ...d.data(),
      createdAt: d.data().createdAt?.toDate(),
      updatedAt: d.data().updatedAt?.toDate(),
    } as Questionnaire;
  } catch (error) {
    handleFirebaseError(error, "getActiveQuestionnaire");
  }
}

export async function getQuestionnaire(
  id: string
): Promise<Questionnaire | null> {
  try {
    const docRef = doc(db, COLLECTION, id);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) return null;

    return {
      id: snapshot.id,
      ...snapshot.data(),
      createdAt: snapshot.data().createdAt?.toDate(),
      updatedAt: snapshot.data().updatedAt?.toDate(),
    } as Questionnaire;
  } catch (error) {
    handleFirebaseError(error, "getQuestionnaire");
  }
}

export async function createQuestionnaire(
  data: Omit<Questionnaire, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, COLLECTION), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    handleFirebaseError(error, "createQuestionnaire");
  }
}

export async function updateQuestionnaire(
  id: string,
  data: Partial<Omit<Questionnaire, "id" | "createdAt" | "updatedAt">>
): Promise<void> {
  try {
    await updateDoc(doc(db, COLLECTION, id), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirebaseError(error, "updateQuestionnaire");
  }
}

export async function deleteQuestionnaire(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, COLLECTION, id));
  } catch (error) {
    handleFirebaseError(error, "deleteQuestionnaire");
  }
}

export async function activateQuestionnaire(
  id: string,
  gradeId: Grade,
  unitId: string
): Promise<void> {
  try {
    const batch = writeBatch(db);

    // Find and deactivate all other active questionnaires for same grade+unit
    const q = query(
      collection(db, COLLECTION),
      where("gradeId", "==", gradeId),
      where("unitId", "==", unitId),
      where("isActive", "==", true)
    );
    const existing = await getDocs(q);
    existing.forEach((d) => {
      batch.update(d.ref, { isActive: false, updatedAt: serverTimestamp() });
    });

    // Activate the target questionnaire
    batch.update(doc(db, COLLECTION, id), {
      isActive: true,
      updatedAt: serverTimestamp(),
    });

    await batch.commit();
  } catch (error) {
    handleFirebaseError(error, "activateQuestionnaire");
  }
}

export async function deactivateQuestionnaire(id: string): Promise<void> {
  try {
    await updateDoc(doc(db, COLLECTION, id), {
      isActive: false,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirebaseError(error, "deactivateQuestionnaire");
  }
}
