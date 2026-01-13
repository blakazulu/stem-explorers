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
} from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { handleFirebaseError } from "@/lib/utils/errors";
import type { Documentation, Grade } from "@/types";

const COLLECTION = "documentation";

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
