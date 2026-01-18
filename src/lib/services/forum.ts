import {
  collection,
  query,
  orderBy,
  getDocs,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  arrayUnion,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { handleFirebaseError } from "@/lib/utils/errors";
import type { ForumPost, ForumReply } from "@/types";

const COLLECTION = "forum";

// Input validation constants
const MAX_TITLE_LENGTH = 200;
const MAX_CONTENT_LENGTH = 10000;
const MAX_AUTHOR_LENGTH = 100;

function sanitizeString(str: string, maxLength: number): string {
  return str.trim().slice(0, maxLength);
}

export async function getPosts(): Promise<ForumPost[]> {
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
      replies: doc.data().replies?.map((r: { createdAt?: { toDate: () => Date } }) => ({
        ...r,
        createdAt: r.createdAt?.toDate(),
      })),
    })) as ForumPost[];
  } catch (error) {
    handleFirebaseError(error, "getPosts");
    throw error;
  }
}

export async function createPost(
  data: Omit<ForumPost, "id" | "createdAt" | "replies">
): Promise<string> {
  try {
    // Sanitize inputs before saving
    const sanitizedData = {
      title: sanitizeString(data.title, MAX_TITLE_LENGTH),
      content: sanitizeString(data.content, MAX_CONTENT_LENGTH),
      authorName: sanitizeString(data.authorName, MAX_AUTHOR_LENGTH),
      replies: [],
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, COLLECTION), sanitizedData);
    return docRef.id;
  } catch (error) {
    handleFirebaseError(error, "createPost");
    throw error;
  }
}

export async function addReply(
  postId: string,
  reply: Omit<ForumReply, "id" | "createdAt">
): Promise<void> {
  try {
    const replyId = `reply_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    // Sanitize inputs before saving
    const sanitizedReply = {
      id: replyId,
      content: sanitizeString(reply.content, MAX_CONTENT_LENGTH),
      authorName: sanitizeString(reply.authorName, MAX_AUTHOR_LENGTH),
      createdAt: new Date(),
    };

    await updateDoc(doc(db, COLLECTION, postId), {
      replies: arrayUnion(sanitizedReply),
    });
  } catch (error) {
    handleFirebaseError(error, "addReply");
  }
}

export async function deletePost(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, COLLECTION, id));
  } catch (error) {
    handleFirebaseError(error, "deletePost");
  }
}

export async function updatePost(
  id: string,
  data: { title: string; content: string }
): Promise<void> {
  try {
    const sanitizedData = {
      title: sanitizeString(data.title, MAX_TITLE_LENGTH),
      content: sanitizeString(data.content, MAX_CONTENT_LENGTH),
    };
    await updateDoc(doc(db, COLLECTION, id), sanitizedData);
  } catch (error) {
    handleFirebaseError(error, "updatePost");
    throw error;
  }
}

export async function pinPost(id: string, pinned: boolean): Promise<void> {
  try {
    const batch = writeBatch(db);

    // If pinning, first unpin any currently pinned post
    if (pinned) {
      const posts = await getPosts();
      const currentlyPinned = posts.find((p) => p.pinned && p.id !== id);
      if (currentlyPinned) {
        batch.update(doc(db, COLLECTION, currentlyPinned.id), { pinned: false });
      }
    }
    // Pin/unpin the target post
    batch.update(doc(db, COLLECTION, id), { pinned });

    // Commit both operations atomically
    await batch.commit();
  } catch (error) {
    handleFirebaseError(error, "pinPost");
    throw error;
  }
}
