import {
  collection,
  query,
  orderBy,
  getDocs,
  getDoc,
  doc,
  addDoc,
  deleteDoc,
  updateDoc,
  arrayUnion,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { handleFirebaseError } from "@/lib/utils/errors";
import type { Announcement, AnnouncementComment, Grade } from "@/types";

const COLLECTION = "announcements";

// Input validation constants
const MAX_CONTENT_LENGTH = 5000;
const MAX_AUTHOR_LENGTH = 100;

function sanitizeString(str: string, maxLength: number): string {
  return str.trim().slice(0, maxLength);
}

// Get all announcements (for admin)
export async function getAllAnnouncements(): Promise<Announcement[]> {
  try {
    const q = query(
      collection(db, COLLECTION),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      allowedCommentGrades: doc.data().allowedCommentGrades || [],
      comments: doc.data().comments?.map((c: { createdAt?: { toDate: () => Date } }) => ({
        ...c,
        createdAt: c.createdAt instanceof Date ? c.createdAt : c.createdAt?.toDate?.() || new Date(),
      })) || [],
    })) as Announcement[];
  } catch (error) {
    handleFirebaseError(error, "getAllAnnouncements");
    throw error;
  }
}

// Get announcements for a specific grade (for students)
export async function getAnnouncementsByGrade(grade: Grade): Promise<Announcement[]> {
  try {
    const q = query(
      collection(db, COLLECTION),
      where("targetGrade", "in", [grade, "all"]),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      allowedCommentGrades: doc.data().allowedCommentGrades || [],
      comments: doc.data().comments?.map((c: { createdAt?: { toDate: () => Date } }) => ({
        ...c,
        createdAt: c.createdAt instanceof Date ? c.createdAt : c.createdAt?.toDate?.() || new Date(),
      })) || [],
    })) as Announcement[];
  } catch (error) {
    handleFirebaseError(error, "getAnnouncementsByGrade");
    throw error;
  }
}

// Create a new announcement (admin only)
export async function createAnnouncement(
  data: Omit<Announcement, "id" | "createdAt" | "comments" | "allowedCommentGrades">
): Promise<string> {
  try {
    const sanitizedData = {
      content: sanitizeString(data.content, MAX_CONTENT_LENGTH),
      authorName: sanitizeString(data.authorName, MAX_AUTHOR_LENGTH),
      targetGrade: data.targetGrade,
      imageUrl: data.imageUrl || null,
      allowedCommentGrades: [], // Default: no one can comment
      comments: [],
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, COLLECTION), sanitizedData);
    return docRef.id;
  } catch (error) {
    handleFirebaseError(error, "createAnnouncement");
    throw error;
  }
}

// Update an announcement (admin only)
export async function updateAnnouncement(
  id: string,
  data: Partial<Pick<Announcement, "content" | "imageUrl" | "targetGrade" | "allowedCommentGrades">>
): Promise<void> {
  try {
    const updateData: Record<string, unknown> = {};

    if (data.content !== undefined) {
      updateData.content = sanitizeString(data.content, MAX_CONTENT_LENGTH);
    }
    if (data.imageUrl !== undefined) {
      updateData.imageUrl = data.imageUrl || null;
    }
    if (data.targetGrade !== undefined) {
      updateData.targetGrade = data.targetGrade;
    }
    if (data.allowedCommentGrades !== undefined) {
      updateData.allowedCommentGrades = data.allowedCommentGrades;
    }

    await updateDoc(doc(db, COLLECTION, id), updateData);
  } catch (error) {
    handleFirebaseError(error, "updateAnnouncement");
    throw error;
  }
}

// Add a comment to an announcement (students)
export async function addAnnouncementComment(
  announcementId: string,
  comment: Omit<AnnouncementComment, "id" | "createdAt">
): Promise<void> {
  try {
    const commentId = `comment_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const sanitizedComment = {
      id: commentId,
      content: sanitizeString(comment.content, MAX_CONTENT_LENGTH),
      authorName: sanitizeString(comment.authorName, MAX_AUTHOR_LENGTH),
      authorGrade: comment.authorGrade,
      createdAt: new Date(),
    };

    await updateDoc(doc(db, COLLECTION, announcementId), {
      comments: arrayUnion(sanitizedComment),
    });
  } catch (error) {
    handleFirebaseError(error, "addAnnouncementComment");
    throw error;
  }
}

// Delete an announcement (admin only)
export async function deleteAnnouncement(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, COLLECTION, id));
  } catch (error) {
    handleFirebaseError(error, "deleteAnnouncement");
    throw error;
  }
}

// Delete a comment from an announcement (admin only)
export async function deleteAnnouncementComment(
  announcementId: string,
  commentId: string
): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION, announcementId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error("Announcement not found");
    }

    const data = docSnap.data();
    const updatedComments = (data.comments || []).filter(
      (c: { id: string }) => c.id !== commentId
    );

    await updateDoc(docRef, {
      comments: updatedComments.map((c: { createdAt?: Date }) => ({
        ...c,
        createdAt: c.createdAt instanceof Date ? c.createdAt : new Date(),
      })),
    });
  } catch (error) {
    handleFirebaseError(error, "deleteAnnouncementComment");
    throw error;
  }
}
