// src/lib/services/parentContent.ts
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { handleFirebaseError } from "@/lib/utils/errors";
import type {
  ParentContentPageId,
  ParentContentDocument,
  ParentContentEvent,
} from "@/types";

const COLLECTION = "parentContent";

// Helper to extract storage path from Firebase download URL
function getStoragePathFromUrl(url: string): string | null {
  const match = url.match(/\/o\/(.+?)\?/);
  if (match) {
    return decodeURIComponent(match[1]);
  }
  return null;
}

// Convert Firestore document to typed object
function convertDocument(data: Record<string, unknown>): ParentContentDocument {
  const events = (data.events as Array<Record<string, unknown>> || []).map((e) => ({
    id: e.id as string,
    title: e.title as string,
    description: e.description as string,
    date: e.date as string | undefined,
    imageUrl: e.imageUrl as string | undefined,
    linkUrl: e.linkUrl as string | undefined,
    createdAt: (e.createdAt as Timestamp)?.toDate() || new Date(),
  }));

  return {
    intro: (data.intro as string) || "",
    events,
    updatedAt: (data.updatedAt as Timestamp)?.toDate() || new Date(),
  };
}

// Get content for a page (creates default if doesn't exist)
export async function getParentContent(
  pageId: ParentContentPageId
): Promise<ParentContentDocument> {
  try {
    const docRef = doc(db, COLLECTION, pageId);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) {
      // Create default document
      const defaultDoc: ParentContentDocument = {
        intro: "",
        events: [],
        updatedAt: new Date(),
      };
      await setDoc(docRef, {
        intro: "",
        events: [],
        updatedAt: serverTimestamp(),
      });
      return defaultDoc;
    }

    return convertDocument(snapshot.data());
  } catch (error) {
    handleFirebaseError(error, "getParentContent");
    throw error;
  }
}

// Update intro text
export async function updateParentContentIntro(
  pageId: ParentContentPageId,
  intro: string
): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION, pageId);
    await setDoc(
      docRef,
      {
        intro,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirebaseError(error, "updateParentContentIntro");
    throw error;
  }
}

// Update events array (for add, edit, delete, reorder)
export async function updateParentContentEvents(
  pageId: ParentContentPageId,
  events: ParentContentEvent[]
): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION, pageId);
    // Convert dates to Timestamps for Firestore
    const firestoreEvents = events.map((e) => ({
      ...e,
      createdAt: Timestamp.fromDate(e.createdAt),
    }));
    await setDoc(
      docRef,
      {
        events: firestoreEvents,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirebaseError(error, "updateParentContentEvents");
    throw error;
  }
}

// Delete image from storage (call when deleting event with image)
export async function deleteParentContentImage(imageUrl: string): Promise<void> {
  try {
    const storagePath = getStoragePathFromUrl(imageUrl);
    if (storagePath) {
      const fileRef = ref(storage, storagePath);
      await deleteObject(fileRef);
    }
  } catch (error) {
    // Log but don't throw - image might not exist
    console.error("Failed to delete parent content image:", error);
  }
}
