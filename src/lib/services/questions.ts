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
import type { Question, Grade } from "@/types";

const COLLECTION = "questions";

export async function getQuestionsForUnit(
  gradeId: Grade,
  unitId: string
): Promise<Question[]> {
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
}

export async function getAllQuestions(): Promise<Question[]> {
  const q = query(collection(db, COLLECTION), orderBy("order", "asc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Question[];
}

export async function createQuestion(
  data: Omit<Question, "id">
): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION), data);
  return docRef.id;
}

export async function updateQuestion(
  id: string,
  data: Partial<Omit<Question, "id">>
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), data);
}

export async function deleteQuestion(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}
