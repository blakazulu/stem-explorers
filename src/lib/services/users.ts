import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { handleFirebaseError } from "@/lib/utils/errors";
import type { UserRole, Grade } from "@/types";

export interface UserDocument {
  password: string; // Document ID
  role: UserRole;
  grade: Grade | null;
  canSubmitGlobeMonitor?: boolean;
  createdAt: Date;
}

export async function getAllUsers(): Promise<UserDocument[]> {
  try {
    const snapshot = await getDocs(collection(db, "users"));
    return snapshot.docs.map((d) => ({
      password: d.id,
      role: d.data().role as UserRole,
      grade: d.data().grade as Grade | null,
      canSubmitGlobeMonitor: d.data().canSubmitGlobeMonitor ?? false,
      createdAt: d.data().createdAt?.toDate() || new Date(),
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
    // Use a transaction to ensure atomicity - prevents duplicate records on crash
    await runTransaction(db, async (transaction) => {
      const newDocRef = doc(db, "users", newPassword);
      const oldDocRef = doc(db, "users", oldPassword);

      // Check if new password already exists
      const newDoc = await transaction.get(newDocRef);
      if (newDoc.exists()) {
        throw new Error("PASSWORD_EXISTS");
      }

      // Create new document with new password
      transaction.set(newDocRef, {
        role,
        grade,
        createdAt: serverTimestamp(),
      });

      // Delete old document
      transaction.delete(oldDocRef);
    });
  } catch (error) {
    if (error instanceof Error && error.message === "PASSWORD_EXISTS") {
      throw new Error("סיסמה זו כבר קיימת במערכת");
    }
    handleFirebaseError(error, "updateUserPassword");
  }
}
