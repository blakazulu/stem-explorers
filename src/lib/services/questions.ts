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
import type { Question, Grade } from "@/types";

const COLLECTION = "questions";

export async function getQuestionsForUnit(
  gradeId: Grade,
  unitId: string
): Promise<Question[]> {
  try {
    const q = query(
      collection(db, COLLECTION),
      orderBy("order", "asc")
    );

    const snapshot = await getDocs(q);
    const questions = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Question[];

    // Filter questions that target this grade and unit
    return questions.filter((question) => {
      const targetGrades = question.target.grades;
      const targetUnits = question.target.units;

      const gradeMatch = targetGrades.length === 0 || targetGrades.includes(gradeId);
      const unitMatch = targetUnits.length === 0 || targetUnits.includes(unitId);

      return gradeMatch && unitMatch;
    });
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
