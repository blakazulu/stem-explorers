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
import type { ForumPost, ForumRoom, ForumReply } from "@/types";

const COLLECTION = "forum";

export async function getPostsByRoom(room: ForumRoom): Promise<ForumPost[]> {
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
}

export async function createPost(
  data: Omit<ForumPost, "id" | "createdAt" | "replies">
): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...data,
    replies: [],
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function addReply(
  postId: string,
  reply: Omit<ForumReply, "createdAt">
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, postId), {
    replies: arrayUnion({
      ...reply,
      createdAt: new Date(),
    }),
  });
}

export async function deletePost(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}
