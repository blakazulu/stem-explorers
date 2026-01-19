import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { handleFirebaseError } from "@/lib/utils/errors";
import type { PersonalPageConfig, PersonalMedia, Grade } from "@/types";

const CONFIG_COLLECTION = "settings";
const CONFIG_DOC_ID = "personalPageConfig";
const MEDIA_COLLECTION = "personalMedia";

// Helper to extract storage path from Firebase download URL
function getStoragePathFromUrl(url: string): string | null {
  // Firebase Storage URLs: https://firebasestorage.googleapis.com/v0/b/bucket/o/path%2Fto%2Ffile?...
  const match = url.match(/\/o\/(.+?)\?/);
  if (match) {
    return decodeURIComponent(match[1]);
  }
  return null;
}

// ============ Config Operations ============

export async function getPersonalPageConfig(): Promise<PersonalPageConfig | null> {
  try {
    const docRef = doc(db, CONFIG_COLLECTION, CONFIG_DOC_ID);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) {
      return null;
    }

    const data = snapshot.data();
    return {
      id: snapshot.id,
      introText: data.introText || "",
      bannerUrl: data.bannerUrl,
      updatedAt: data.updatedAt?.toDate(),
      updatedBy: data.updatedBy || "",
    } as PersonalPageConfig;
  } catch (error) {
    handleFirebaseError(error, "getPersonalPageConfig");
    throw error;
  }
}

export async function savePersonalPageConfig(
  data: Omit<PersonalPageConfig, "id" | "updatedAt">
): Promise<void> {
  try {
    const docRef = doc(db, CONFIG_COLLECTION, CONFIG_DOC_ID);
    await setDoc(
      docRef,
      {
        ...data,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirebaseError(error, "savePersonalPageConfig");
    throw error;
  }
}

// ============ Media Operations ============

export async function getAllPersonalMedia(): Promise<PersonalMedia[]> {
  try {
    const q = query(
      collection(db, MEDIA_COLLECTION),
      orderBy("order", "asc")
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
    })) as PersonalMedia[];
  } catch (error) {
    handleFirebaseError(error, "getAllPersonalMedia");
    throw error;
  }
}

export async function getPersonalMediaByGrade(
  grade: Grade
): Promise<PersonalMedia[]> {
  try {
    // Get all media and filter client-side (since we need "all" grades too)
    const allMedia = await getAllPersonalMedia();
    return allMedia.filter(
      (media) => media.grades === "all" || media.grades.includes(grade)
    );
  } catch (error) {
    handleFirebaseError(error, "getPersonalMediaByGrade");
    throw error;
  }
}

export async function createPersonalMedia(
  data: Omit<PersonalMedia, "id" | "createdAt">
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, MEDIA_COLLECTION), {
      ...data,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    handleFirebaseError(error, "createPersonalMedia");
    throw error;
  }
}

export async function updatePersonalMedia(
  id: string,
  data: Partial<Omit<PersonalMedia, "id" | "createdAt">>
): Promise<void> {
  try {
    const docRef = doc(db, MEDIA_COLLECTION, id);
    await updateDoc(docRef, data);
  } catch (error) {
    handleFirebaseError(error, "updatePersonalMedia");
    throw error;
  }
}

export async function deletePersonalMedia(
  id: string,
  url: string,
  thumbnailUrl?: string
): Promise<void> {
  try {
    // Delete files from storage (only for uploaded files, not YouTube)
    if (url && !url.includes("youtube") && !url.includes("youtu.be")) {
      const storagePath = getStoragePathFromUrl(url);
      if (storagePath) {
        try {
          const fileRef = ref(storage, storagePath);
          await deleteObject(fileRef);
        } catch (e) {
          console.error("Failed to delete media file:", e);
        }
      }
    }

    // Delete thumbnail if exists
    if (thumbnailUrl) {
      const thumbPath = getStoragePathFromUrl(thumbnailUrl);
      if (thumbPath) {
        try {
          const thumbRef = ref(storage, thumbPath);
          await deleteObject(thumbRef);
        } catch (e) {
          console.error("Failed to delete thumbnail:", e);
        }
      }
    }

    // Delete document
    await deleteDoc(doc(db, MEDIA_COLLECTION, id));
  } catch (error) {
    handleFirebaseError(error, "deletePersonalMedia");
    throw error;
  }
}

export async function reorderPersonalMedia(
  mediaItems: { id: string; order: number }[]
): Promise<void> {
  try {
    const batch = writeBatch(db);

    for (const item of mediaItems) {
      const docRef = doc(db, MEDIA_COLLECTION, item.id);
      batch.update(docRef, { order: item.order });
    }

    await batch.commit();
  } catch (error) {
    handleFirebaseError(error, "reorderPersonalMedia");
    throw error;
  }
}

export async function getNextMediaOrder(): Promise<number> {
  try {
    const allMedia = await getAllPersonalMedia();
    if (allMedia.length === 0) return 0;
    return Math.max(...allMedia.map((m) => m.order)) + 1;
  } catch (error) {
    handleFirebaseError(error, "getNextMediaOrder");
    throw error;
  }
}
