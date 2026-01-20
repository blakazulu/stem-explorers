import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  addDoc,
  deleteDoc,
  serverTimestamp,
  getCountFromServer,
} from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { handleFirebaseError } from "@/lib/utils/errors";
import type { Documentation, Grade } from "@/types";

const COLLECTION = "documentation";
const ALL_GRADES: Grade[] = ["א", "ב", "ג", "ד", "ה", "ו"];

export async function getDocumentationByUnit(
  unitId: string,
  gradeId: Grade
): Promise<Documentation[]> {
  try {
    const q = query(
      collection(db, COLLECTION),
      where("unitId", "==", unitId),
      where("gradeId", "==", gradeId),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
    })) as Documentation[];
  } catch (error) {
    handleFirebaseError(error, "getDocumentationByUnit");
  }
}

export async function createDocumentation(
  data: Omit<Documentation, "id" | "createdAt">
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, COLLECTION), {
      ...data,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    handleFirebaseError(error, "createDocumentation");
  }
}

export async function deleteDocumentation(
  id: string,
  imageUrls: string[]
): Promise<void> {
  try {
    // Delete images from storage
    for (const url of imageUrls) {
      try {
        const imageRef = ref(storage, url);
        await deleteObject(imageRef);
      } catch (e) {
        console.error("Failed to delete image:", e);
      }
    }

    // Delete document
    await deleteDoc(doc(db, COLLECTION, id));
  } catch (error) {
    handleFirebaseError(error, "deleteDocumentation");
  }
}

// Get total documentation count per grade
export async function getDocumentationCountsByGrade(): Promise<Record<Grade, number>> {
  try {
    const counts: Record<Grade, number> = {} as Record<Grade, number>;

    // Parallelize count queries for better performance
    const countPromises = ALL_GRADES.map(async (grade) => {
      const q = query(
        collection(db, COLLECTION),
        where("gradeId", "==", grade)
      );
      const snapshot = await getCountFromServer(q);
      return { grade, count: snapshot.data().count };
    });

    const results = await Promise.all(countPromises);
    results.forEach(({ grade, count }) => {
      counts[grade] = count;
    });

    return counts;
  } catch (error) {
    handleFirebaseError(error, "getDocumentationCountsByGrade");
    return {} as Record<Grade, number>;
  }
}

// Get documentation count per unit for a grade
export async function getDocumentationCountsByUnit(
  gradeId: Grade
): Promise<Record<string, number>> {
  try {
    // Get all docs for this grade and count by unitId
    const q = query(
      collection(db, COLLECTION),
      where("gradeId", "==", gradeId)
    );

    const snapshot = await getDocs(q);
    const counts: Record<string, number> = {};

    snapshot.docs.forEach((doc) => {
      const unitId = doc.data().unitId;
      counts[unitId] = (counts[unitId] || 0) + 1;
    });

    return counts;
  } catch (error) {
    handleFirebaseError(error, "getDocumentationCountsByUnit");
    return {};
  }
}
