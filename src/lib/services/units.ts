import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { handleFirebaseError } from "@/lib/utils/errors";
import type { Unit, Grade } from "@/types";

const COLLECTION = "units";

export async function getUnitsByGrade(grade: Grade): Promise<Unit[]> {
  try {
    const q = query(
      collection(db, COLLECTION),
      where("gradeId", "==", grade),
      orderBy("order", "asc")
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
    })) as Unit[];
  } catch (error) {
    handleFirebaseError(error, "getUnitsByGrade");
  }
}

export async function getUnit(id: string): Promise<Unit | null> {
  try {
    const docRef = doc(db, COLLECTION, id);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) return null;

    return {
      id: snapshot.id,
      ...snapshot.data(),
      createdAt: snapshot.data().createdAt?.toDate(),
    } as Unit;
  } catch (error) {
    handleFirebaseError(error, "getUnit");
  }
}

export async function createUnit(
  data: Omit<Unit, "id" | "createdAt">
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, COLLECTION), {
      ...data,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    handleFirebaseError(error, "createUnit");
  }
}

export async function updateUnit(
  id: string,
  data: Partial<Omit<Unit, "id" | "createdAt">>
): Promise<void> {
  try {
    await updateDoc(doc(db, COLLECTION, id), data);
  } catch (error) {
    handleFirebaseError(error, "updateUnit");
  }
}

export async function deleteUnit(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, COLLECTION, id));
  } catch (error) {
    handleFirebaseError(error, "deleteUnit");
  }
}

export async function getAllUnits(): Promise<Unit[]> {
  try {
    const q = query(collection(db, COLLECTION), orderBy("gradeId", "asc"));

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
    })) as Unit[];
  } catch (error) {
    handleFirebaseError(error, "getAllUnits");
  }
}
