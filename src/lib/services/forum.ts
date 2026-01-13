import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  arrayUnion,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { handleFirebaseError } from "@/lib/utils/errors";
import type { ForumPost, ForumRoom, ForumReply } from "@/types";

const COLLECTION = "forum";

export async function getPostsByRoom(room: ForumRoom): Promise<ForumPost[]> {
  try {
    const q = query(
      collection(db, COLLECTION),
      where("room", "==", room),
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
    handleFirebaseError(error, "getPostsByRoom");
  }
}

export async function createPost(
  data: Omit<ForumPost, "id" | "createdAt" | "replies">
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, COLLECTION), {
      ...data,
      replies: [],
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    handleFirebaseError(error, "createPost");
  }
}

export async function addReply(
  postId: string,
  reply: Omit<ForumReply, "id" | "createdAt">
): Promise<void> {
  try {
    const replyId = `reply_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    await updateDoc(doc(db, COLLECTION, postId), {
      replies: arrayUnion({
        id: replyId,
        ...reply,
        createdAt: new Date(),
      }),
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
