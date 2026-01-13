import {
  collection,
  query,
  orderBy,
  getDocs,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { handleFirebaseError } from "@/lib/utils/errors";
import { getActiveQuestionnaire } from "./questionnaires";
import type { Question, Grade } from "@/types";

const COLLECTION = "questions";

export async function getQuestionsForUnit(
  gradeId: Grade,
  unitId: string
): Promise<Question[]> {
  try {
    const activeQuestionnaire = await getActiveQuestionnaire(gradeId, unitId);

    if (!activeQuestionnaire || activeQuestionnaire.questions.length === 0) {
      return [];
    }

    // Map embedded questions to Question format
    return activeQuestionnaire.questions
      .sort((a, b) => a.order - b.order)
      .map((eq) => ({
        id: eq.id,
        type: eq.type,
        text: eq.text,
        options: eq.options,
        target: { grades: [gradeId], units: [unitId] },
        order: eq.order,
      }));
  } catch (error) {
    handleFirebaseError(error, "getQuestionsForUnit");
  }
}

export async function getAllQuestions(): Promise<Question[]> {
  try {
    const q = query(collection(db, COLLECTION), orderBy("order", "asc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Question[];
  } catch (error) {
    handleFirebaseError(error, "getAllQuestions");
  }
}

export async function createQuestion(
  data: Omit<Question, "id">
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, COLLECTION), data);
    return docRef.id;
  } catch (error) {
    handleFirebaseError(error, "createQuestion");
  }
}

export async function updateQuestion(
  id: string,
  data: Partial<Omit<Question, "id">>
): Promise<void> {
  try {
    await updateDoc(doc(db, COLLECTION, id), data);
  } catch (error) {
    handleFirebaseError(error, "updateQuestion");
  }
}

export async function deleteQuestion(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, COLLECTION, id));
  } catch (error) {
    handleFirebaseError(error, "deleteQuestion");
  }
}
