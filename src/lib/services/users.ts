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

export async function updateUserPassword(
  oldPassword: string,
  newPassword: string,
  role: UserRole,
  grade: Grade | null
): Promise<void> {
  try {
    // Create new document with new password
    await setDoc(doc(db, "users", newPassword), {
      role,
      grade,
      createdAt: serverTimestamp(),
    });
    // Delete old document
    await deleteDoc(doc(db, "users", oldPassword));
  } catch (error) {
    handleFirebaseError(error, "updateUserPassword");
  }
}
