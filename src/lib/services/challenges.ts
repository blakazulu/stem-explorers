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
  writeBatch,
} from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { handleFirebaseError } from "@/lib/utils/errors";
import type { Challenge, ChallengeComment, Grade } from "@/types";

const COLLECTION = "challenges";

// Input validation constants
const MAX_TITLE_LENGTH = 200;
const MAX_DESCRIPTION_LENGTH = 5000;
const MAX_COMMENT_LENGTH = 2000;
const MAX_AUTHOR_LENGTH = 100;

function sanitizeString(str: string, maxLength: number): string {
  return str.trim().slice(0, maxLength);
}

// Helper to extract storage path from Firebase download URL
function getStoragePathFromUrl(url: string): string | null {
  const match = url.match(/\/o\/(.+?)\?/);
  if (match) {
    return decodeURIComponent(match[1]);
  }
  return null;
}

// Helper to convert Firestore data to Challenge type
function mapDocToChallenge(docSnapshot: { id: string; data: () => Record<string, unknown> }): Challenge {
  const data = docSnapshot.data();
  return {
    id: docSnapshot.id,
    title: data.title as string,
    description: data.description as string,
    imageUrl: data.imageUrl as string | undefined,
    videoUrl: data.videoUrl as string | undefined,
    videoStorageUrl: data.videoStorageUrl as string | undefined,
    targetGrades: data.targetGrades as Grade[] | "all",
    isActive: data.isActive as boolean,
    authorName: data.authorName as string,
    createdAt: (data.createdAt as { toDate: () => Date })?.toDate(),
    updatedAt: (data.updatedAt as { toDate: () => Date })?.toDate(),
    comments: ((data.comments as Array<Record<string, unknown>>) || []).map((c) => ({
      id: c.id as string,
      authorName: c.authorName as string,
      authorGrade: c.authorGrade as Grade,
      content: c.content as string,
      imageUrl: c.imageUrl as string | undefined,
      createdAt: c.createdAt instanceof Date ? c.createdAt : (c.createdAt as { toDate?: () => Date })?.toDate?.() || new Date(),
    })),
  };
}

// Get all challenges (for admin) - sorted by active first, then by creation date
export async function getChallenges(): Promise<Challenge[]> {
  try {
    const q = query(
      collection(db, COLLECTION),
      orderBy("isActive", "desc"),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(mapDocToChallenge);
  } catch (error) {
    handleFirebaseError(error, "getChallenges");
    throw error;
  }
}

// Get challenges for a specific grade (for parents)
export async function getChallengesByGrade(grade: Grade): Promise<Challenge[]> {
  try {
    // Get all challenges sorted by active status and date
    const allChallenges = await getChallenges();

    // Filter by grade client-side (since we need to check if grade is in array or "all")
    return allChallenges.filter(
      (challenge) =>
        challenge.targetGrades === "all" ||
        challenge.targetGrades.includes(grade)
    );
  } catch (error) {
    handleFirebaseError(error, "getChallengesByGrade");
    throw error;
  }
}

// Create a new challenge (admin only)
export async function createChallenge(
  data: Omit<Challenge, "id" | "createdAt" | "updatedAt" | "comments">
): Promise<string> {
  try {
    const sanitizedData = {
      title: sanitizeString(data.title, MAX_TITLE_LENGTH),
      description: sanitizeString(data.description, MAX_DESCRIPTION_LENGTH),
      authorName: sanitizeString(data.authorName, MAX_AUTHOR_LENGTH),
      targetGrades: data.targetGrades,
      isActive: data.isActive ?? false,
      imageUrl: data.imageUrl || null,
      videoUrl: data.videoUrl || null,
      videoStorageUrl: data.videoStorageUrl || null,
      comments: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // If this challenge is marked active, deactivate all others first
    if (sanitizedData.isActive) {
      await deactivateAllChallenges();
    }

    const docRef = await addDoc(collection(db, COLLECTION), sanitizedData);
    return docRef.id;
  } catch (error) {
    handleFirebaseError(error, "createChallenge");
    throw error;
  }
}

// Update a challenge (admin only)
export async function updateChallenge(
  id: string,
  data: Partial<Omit<Challenge, "id" | "createdAt" | "comments">>
): Promise<void> {
  try {
    const updateData: Record<string, unknown> = {
      updatedAt: serverTimestamp(),
    };

    if (data.title !== undefined) {
      updateData.title = sanitizeString(data.title, MAX_TITLE_LENGTH);
    }
    if (data.description !== undefined) {
      updateData.description = sanitizeString(data.description, MAX_DESCRIPTION_LENGTH);
    }
    if (data.authorName !== undefined) {
      updateData.authorName = sanitizeString(data.authorName, MAX_AUTHOR_LENGTH);
    }
    if (data.targetGrades !== undefined) {
      updateData.targetGrades = data.targetGrades;
    }
    if (data.imageUrl !== undefined) {
      updateData.imageUrl = data.imageUrl || null;
    }
    if (data.videoUrl !== undefined) {
      updateData.videoUrl = data.videoUrl || null;
    }
    if (data.videoStorageUrl !== undefined) {
      updateData.videoStorageUrl = data.videoStorageUrl || null;
    }

    // Handle isActive separately - need to deactivate others first
    if (data.isActive === true) {
      await deactivateAllChallenges();
      updateData.isActive = true;
    } else if (data.isActive === false) {
      updateData.isActive = false;
    }

    await updateDoc(doc(db, COLLECTION, id), updateData);
  } catch (error) {
    handleFirebaseError(error, "updateChallenge");
    throw error;
  }
}

// Delete a challenge (admin only) - includes storage cleanup
export async function deleteChallenge(id: string): Promise<void> {
  try {
    // Get the challenge first to clean up storage files
    const docRef = doc(db, COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();

      // Delete image from storage
      if (data.imageUrl) {
        const imagePath = getStoragePathFromUrl(data.imageUrl);
        if (imagePath) {
          try {
            await deleteObject(ref(storage, imagePath));
          } catch (e) {
            console.error("Failed to delete challenge image:", e);
          }
        }
      }

      // Delete uploaded video from storage
      if (data.videoStorageUrl) {
        const videoPath = getStoragePathFromUrl(data.videoStorageUrl);
        if (videoPath) {
          try {
            await deleteObject(ref(storage, videoPath));
          } catch (e) {
            console.error("Failed to delete challenge video:", e);
          }
        }
      }

      // Delete comment images from storage
      const comments = data.comments || [];
      for (const comment of comments) {
        if (comment.imageUrl) {
          const commentImagePath = getStoragePathFromUrl(comment.imageUrl);
          if (commentImagePath) {
            try {
              await deleteObject(ref(storage, commentImagePath));
            } catch (e) {
              console.error("Failed to delete comment image:", e);
            }
          }
        }
      }
    }

    await deleteDoc(docRef);
  } catch (error) {
    handleFirebaseError(error, "deleteChallenge");
    throw error;
  }
}

// Deactivate all challenges (internal helper)
async function deactivateAllChallenges(): Promise<void> {
  try {
    const q = query(collection(db, COLLECTION));
    const snapshot = await getDocs(q);

    const batch = writeBatch(db);
    snapshot.docs.forEach((docSnapshot) => {
      if (docSnapshot.data().isActive) {
        batch.update(docSnapshot.ref, { isActive: false });
      }
    });

    await batch.commit();
  } catch (error) {
    handleFirebaseError(error, "deactivateAllChallenges");
    throw error;
  }
}

// Set a specific challenge as active (deactivates all others)
export async function setActiveChallenge(id: string): Promise<void> {
  try {
    // Deactivate all first
    await deactivateAllChallenges();

    // Then activate the selected one
    await updateDoc(doc(db, COLLECTION, id), {
      isActive: true,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirebaseError(error, "setActiveChallenge");
    throw error;
  }
}

// Add a comment to a challenge (parents only - only on active challenges)
export async function addChallengeComment(
  challengeId: string,
  comment: Omit<ChallengeComment, "id" | "createdAt">
): Promise<void> {
  try {
    // Verify the challenge is active
    const docRef = doc(db, COLLECTION, challengeId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error("Challenge not found");
    }

    if (!docSnap.data().isActive) {
      throw new Error("Cannot comment on inactive challenge");
    }

    const commentId = `comment_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const sanitizedComment = {
      id: commentId,
      content: sanitizeString(comment.content, MAX_COMMENT_LENGTH),
      authorName: sanitizeString(comment.authorName, MAX_AUTHOR_LENGTH),
      authorGrade: comment.authorGrade,
      imageUrl: comment.imageUrl || null,
      createdAt: new Date(),
    };

    await updateDoc(docRef, {
      comments: arrayUnion(sanitizedComment),
    });
  } catch (error) {
    handleFirebaseError(error, "addChallengeComment");
    throw error;
  }
}

// Delete a comment from a challenge (admin only)
export async function deleteChallengeComment(
  challengeId: string,
  commentId: string
): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION, challengeId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error("Challenge not found");
    }

    const data = docSnap.data();
    const commentToDelete = (data.comments || []).find(
      (c: { id: string }) => c.id === commentId
    );

    // Delete comment image from storage if exists
    if (commentToDelete?.imageUrl) {
      const imagePath = getStoragePathFromUrl(commentToDelete.imageUrl);
      if (imagePath) {
        try {
          await deleteObject(ref(storage, imagePath));
        } catch (e) {
          console.error("Failed to delete comment image:", e);
        }
      }
    }

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
    handleFirebaseError(error, "deleteChallengeComment");
    throw error;
  }
}
