import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { handleFirebaseError } from "@/lib/utils/errors";
import type { UserRole, Grade } from "@/types";

export interface UserDocument {
  password: string; // Document ID
  role: UserRole;
  grade: Grade | null;
  createdAt: Date;
}

export async function getAllUsers(): Promise<UserDocument[]> {
  try {
    const snapshot = await getDocs(collection(db, "users"));
    return snapshot.docs.map((doc) => ({
      password: doc.id,
      role: doc.data().role as UserRole,
      grade: doc.data().grade as Grade | null,
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    }));
  } catch (error) {
    handleFirebaseError(error, "getAllUsers");
  }
}

export async function createUser(
  password: string,
  role: UserRole,
  grade: Grade | null
): Promise<void> {
  try {
    await setDoc(doc(db, "users", password), {
      role,
      grade,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirebaseError(error, "createUser");
  }
}

export async function deleteUser(password: string): Promise<void> {
  try {
    await deleteDoc(doc(db, "users", password));
  } catch (error) {
    handleFirebaseError(error, "deleteUser");
  }
}
