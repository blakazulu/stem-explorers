import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { handleFirebaseError } from "@/lib/utils/errors";
import type { StaffMember } from "@/types";

const COLLECTION = "staff";

export async function getAllStaff(): Promise<StaffMember[]> {
  try {
    const q = query(
      collection(db, COLLECTION),
      orderBy("order", "asc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    })) as StaffMember[];
  } catch (error) {
    handleFirebaseError(error, "getAllStaff");
    throw error;
  }
}

export async function getStaffMember(id: string): Promise<StaffMember | null> {
  try {
    const docRef = doc(db, COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    return {
      id: docSnap.id,
      ...docSnap.data(),
      createdAt: docSnap.data().createdAt?.toDate() || new Date(),
    } as StaffMember;
  } catch (error) {
    handleFirebaseError(error, "getStaffMember");
    throw error;
  }
}

export async function createStaffMember(
  data: Omit<StaffMember, "id" | "createdAt">
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, COLLECTION), {
      ...data,
      createdAt: new Date(),
    });
    return docRef.id;
  } catch (error) {
    handleFirebaseError(error, "createStaffMember");
    throw error;
  }
}

export async function updateStaffMember(
  id: string,
  data: Partial<Omit<StaffMember, "id" | "createdAt">>
): Promise<void> {
  try {
    await updateDoc(doc(db, COLLECTION, id), data);
  } catch (error) {
    handleFirebaseError(error, "updateStaffMember");
    throw error;
  }
}

export async function deleteStaffMember(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, COLLECTION, id));
  } catch (error) {
    handleFirebaseError(error, "deleteStaffMember");
    throw error;
  }
}

export async function getNextStaffOrder(): Promise<number> {
  try {
    const staff = await getAllStaff();
    if (!staff || staff.length === 0) return 1;
    return Math.max(...staff.map((s) => s.order)) + 1;
  } catch {
    return 1;
  }
}

export async function reorderStaff(
  orderedIds: string[]
): Promise<void> {
  try {
    const batch = writeBatch(db);
    orderedIds.forEach((id, index) => {
      const docRef = doc(db, COLLECTION, id);
      batch.update(docRef, { order: index });
    });
    await batch.commit();
  } catch (error) {
    handleFirebaseError(error, "reorderStaff");
    throw error;
  }
}
