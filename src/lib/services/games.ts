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
  onSnapshot,
  Timestamp,
  Unsubscribe,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { handleFirebaseError } from "@/lib/utils/errors";
import type { Grade } from "@/types";
import type {
  GameType,
  Difficulty,
  GameContent,
  GameProgress,
  GameStats,
  PlayerBadges,
  EarnedBadge,
  HeadToHeadChallenge,
  ChallengePlayer,
} from "@/types/games";

// Collection names
const GAME_CONTENT_COLLECTION = "gameContent";
const GAME_PROGRESS_COLLECTION = "gameProgress";
const GAME_BADGES_COLLECTION = "gameBadges";
const HEAD_TO_HEAD_COLLECTION = "headToHead";

// Challenge expiry time in milliseconds (5 minutes)
const CHALLENGE_EXPIRY_MS = 5 * 60 * 1000;

// ============================================================
// Helper Functions
// ============================================================

/** Generate document ID for game progress */
function getProgressDocId(
  visitorId: string,
  visitorGrade: Grade,
  gameType: GameType
): string {
  return `${visitorId}_${visitorGrade}_${gameType}`;
}

/** Generate document ID for player badges */
function getBadgesDocId(visitorId: string, visitorGrade: Grade): string {
  return `${visitorId}_${visitorGrade}`;
}

/** Convert Firestore timestamp to Date */
function toDate(timestamp: Timestamp | Date | undefined): Date {
  if (!timestamp) return new Date();
  if (timestamp instanceof Date) return timestamp;
  return timestamp.toDate();
}

/** Check if two dates are the same day */
function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/** Check if date1 is the day after date2 */
function isConsecutiveDay(date1: Date, date2: Date): boolean {
  const nextDay = new Date(date2);
  nextDay.setDate(nextDay.getDate() + 1);
  return isSameDay(date1, nextDay);
}

// ============================================================
// Game Content (Admin CRUD)
// ============================================================

/** Get game content for a specific game type and grade with optional difficulty filter */
export async function getGameContent(
  gameType: GameType,
  grade: Grade,
  difficulty?: Difficulty
): Promise<GameContent[]> {
  try {
    let q = query(
      collection(db, GAME_CONTENT_COLLECTION),
      where("gameType", "==", gameType),
      where("grade", "==", grade)
    );

    if (difficulty) {
      q = query(
        collection(db, GAME_CONTENT_COLLECTION),
        where("gameType", "==", gameType),
        where("grade", "==", grade),
        where("difficulty", "==", difficulty)
      );
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnapshot) => {
      const data = docSnapshot.data();
      return {
        ...data,
        id: docSnapshot.id,
        createdAt: toDate(data.createdAt),
        updatedAt: toDate(data.updatedAt),
      } as GameContent;
    });
  } catch (error) {
    handleFirebaseError(error, "getGameContent");
  }
}

/** Get all game content with optional filters */
export async function getAllGameContent(
  gameType?: GameType,
  grade?: Grade
): Promise<GameContent[]> {
  try {
    let q;

    if (gameType && grade) {
      q = query(
        collection(db, GAME_CONTENT_COLLECTION),
        where("gameType", "==", gameType),
        where("grade", "==", grade),
        orderBy("createdAt", "desc")
      );
    } else if (gameType) {
      q = query(
        collection(db, GAME_CONTENT_COLLECTION),
        where("gameType", "==", gameType),
        orderBy("createdAt", "desc")
      );
    } else if (grade) {
      q = query(
        collection(db, GAME_CONTENT_COLLECTION),
        where("grade", "==", grade),
        orderBy("createdAt", "desc")
      );
    } else {
      q = query(
        collection(db, GAME_CONTENT_COLLECTION),
        orderBy("createdAt", "desc")
      );
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnapshot) => {
      const data = docSnapshot.data();
      return {
        ...data,
        id: docSnapshot.id,
        createdAt: toDate(data.createdAt),
        updatedAt: toDate(data.updatedAt),
      } as GameContent;
    });
  } catch (error) {
    handleFirebaseError(error, "getAllGameContent");
  }
}

/** Create new game content */
export async function createGameContent(
  data: Omit<GameContent, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, GAME_CONTENT_COLLECTION), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    handleFirebaseError(error, "createGameContent");
  }
}

/** Update existing game content */
export async function updateGameContent(
  id: string,
  data: Partial<Omit<GameContent, "id" | "createdAt" | "updatedAt">>
): Promise<void> {
  try {
    await updateDoc(doc(db, GAME_CONTENT_COLLECTION, id), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirebaseError(error, "updateGameContent");
  }
}

/** Delete game content */
export async function deleteGameContent(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, GAME_CONTENT_COLLECTION, id));
  } catch (error) {
    handleFirebaseError(error, "deleteGameContent");
  }
}

// ============================================================
// Game Progress
// ============================================================

/** Get player progress, optionally filtered by game type */
export async function getGameProgress(
  visitorId: string,
  visitorGrade: Grade,
  gameType?: GameType
): Promise<GameProgress[]> {
  try {
    let q;

    if (gameType) {
      // Get specific game progress by document ID
      const docId = getProgressDocId(visitorId, visitorGrade, gameType);
      const docRef = doc(db, GAME_PROGRESS_COLLECTION, docId);
      const docSnapshot = await getDoc(docRef);

      if (!docSnapshot.exists()) return [];

      const data = docSnapshot.data();
      return [
        {
          ...data,
          id: docSnapshot.id,
          lastPlayed: toDate(data.lastPlayed),
        } as GameProgress,
      ];
    }

    // Get all progress for this visitor
    q = query(
      collection(db, GAME_PROGRESS_COLLECTION),
      where("visitorId", "==", visitorId),
      where("visitorGrade", "==", visitorGrade)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnapshot) => {
      const data = docSnapshot.data();
      return {
        ...data,
        id: docSnapshot.id,
        lastPlayed: toDate(data.lastPlayed),
      } as GameProgress;
    });
  } catch (error) {
    handleFirebaseError(error, "getGameProgress");
  }
}

/** Update or create player progress for a game */
export async function updateGameProgress(
  visitorId: string,
  visitorName: string,
  visitorGrade: Grade,
  gameType: GameType,
  score: number,
  stats?: Partial<GameStats>
): Promise<void> {
  try {
    const docId = getProgressDocId(visitorId, visitorGrade, gameType);
    const docRef = doc(db, GAME_PROGRESS_COLLECTION, docId);
    const docSnapshot = await getDoc(docRef);

    if (docSnapshot.exists()) {
      // Update existing progress
      const existingData = docSnapshot.data();
      const newGamesPlayed = (existingData.gamesPlayed || 0) + 1;
      const newHighScore = Math.max(existingData.highScore || 0, score);

      // Merge stats
      const existingStats = existingData.stats || {
        averageScore: 0,
        totalCorrect: 0,
        totalAttempts: 0,
      };
      const newStats: GameStats = {
        averageScore:
          (existingStats.averageScore * (newGamesPlayed - 1) + score) /
          newGamesPlayed,
        bestTime:
          stats?.bestTime !== undefined
            ? existingStats.bestTime !== undefined
              ? Math.min(existingStats.bestTime, stats.bestTime)
              : stats.bestTime
            : existingStats.bestTime,
        totalCorrect:
          existingStats.totalCorrect + (stats?.totalCorrect || 0),
        totalAttempts:
          existingStats.totalAttempts + (stats?.totalAttempts || 0),
      };

      await updateDoc(docRef, {
        visitorName,
        highScore: newHighScore,
        gamesPlayed: newGamesPlayed,
        lastPlayed: serverTimestamp(),
        stats: newStats,
      });
    } else {
      // Create new progress
      const newStats: GameStats = {
        averageScore: score,
        bestTime: stats?.bestTime,
        totalCorrect: stats?.totalCorrect || 0,
        totalAttempts: stats?.totalAttempts || 0,
      };

      await setDoc(docRef, {
        visitorId,
        visitorName,
        visitorGrade,
        gameType,
        highScore: score,
        gamesPlayed: 1,
        lastPlayed: serverTimestamp(),
        stats: newStats,
      });
    }
  } catch (error) {
    handleFirebaseError(error, "updateGameProgress");
  }
}

// ============================================================
// Badges
// ============================================================

/** Get player's badges */
export async function getPlayerBadges(
  visitorId: string,
  visitorGrade: Grade
): Promise<PlayerBadges | null> {
  try {
    const docId = getBadgesDocId(visitorId, visitorGrade);
    const docRef = doc(db, GAME_BADGES_COLLECTION, docId);
    const docSnapshot = await getDoc(docRef);

    if (!docSnapshot.exists()) return null;

    const data = docSnapshot.data();
    return {
      ...data,
      id: docSnapshot.id,
      badges: (data.badges || []).map((b: { badgeId: string; earnedAt: Timestamp | Date }) => ({
        badgeId: b.badgeId,
        earnedAt: toDate(b.earnedAt),
      })),
      lastPlayDate: toDate(data.lastPlayDate),
    } as PlayerBadges;
  } catch (error) {
    handleFirebaseError(error, "getPlayerBadges");
  }
}

/** Award a badge to a player (idempotent - won't add if already earned) */
export async function awardBadge(
  visitorId: string,
  visitorName: string,
  visitorGrade: Grade,
  badgeId: string
): Promise<void> {
  try {
    const docId = getBadgesDocId(visitorId, visitorGrade);
    const docRef = doc(db, GAME_BADGES_COLLECTION, docId);
    const docSnapshot = await getDoc(docRef);

    const newBadge: EarnedBadge = {
      badgeId,
      earnedAt: new Date(),
    };

    if (docSnapshot.exists()) {
      const data = docSnapshot.data();
      const existingBadges: EarnedBadge[] = data.badges || [];

      // Check if badge already earned (idempotent)
      if (existingBadges.some((b) => b.badgeId === badgeId)) {
        return;
      }

      await updateDoc(docRef, {
        visitorName,
        badges: [...existingBadges, newBadge],
      });
    } else {
      // Create new badges document
      await setDoc(docRef, {
        visitorId,
        visitorName,
        visitorGrade,
        badges: [newBadge],
        streakDays: 0,
        lastPlayDate: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirebaseError(error, "awardBadge");
  }
}

/** Update play streak, returns new streak count */
export async function updateStreak(
  visitorId: string,
  visitorName: string,
  visitorGrade: Grade
): Promise<number> {
  try {
    const docId = getBadgesDocId(visitorId, visitorGrade);
    const docRef = doc(db, GAME_BADGES_COLLECTION, docId);
    const docSnapshot = await getDoc(docRef);

    const today = new Date();

    if (docSnapshot.exists()) {
      const data = docSnapshot.data();
      const lastPlayDate = toDate(data.lastPlayDate);
      const currentStreak = data.streakDays || 0;

      let newStreak: number;

      if (isSameDay(today, lastPlayDate)) {
        // Same day - no change
        newStreak = currentStreak;
      } else if (isConsecutiveDay(today, lastPlayDate)) {
        // Consecutive day - increment
        newStreak = currentStreak + 1;
      } else {
        // Gap in days - reset to 1
        newStreak = 1;
      }

      await updateDoc(docRef, {
        visitorName,
        streakDays: newStreak,
        lastPlayDate: serverTimestamp(),
      });

      return newStreak;
    } else {
      // Create new document with streak of 1
      await setDoc(docRef, {
        visitorId,
        visitorName,
        visitorGrade,
        badges: [],
        streakDays: 1,
        lastPlayDate: serverTimestamp(),
      });

      return 1;
    }
  } catch (error) {
    handleFirebaseError(error, "updateStreak");
  }
}

// ============================================================
// Head-to-Head Challenges
// ============================================================

/** Create a new challenge waiting for opponent */
export async function createChallenge(
  visitorGrade: Grade,
  gameType: GameType,
  player1Id: string,
  player1Name: string,
  contentIds: string[]
): Promise<string> {
  try {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + CHALLENGE_EXPIRY_MS);

    const player1: ChallengePlayer = {
      visitorId: player1Id,
      visitorName: player1Name,
      score: 0,
    };

    const docRef = await addDoc(collection(db, HEAD_TO_HEAD_COLLECTION), {
      visitorGrade,
      gameType,
      status: "pending",
      player1,
      player2: null,
      contentIds,
      createdAt: serverTimestamp(),
      expiresAt: Timestamp.fromDate(expiresAt),
    });

    return docRef.id;
  } catch (error) {
    handleFirebaseError(error, "createChallenge");
  }
}

/** Get available challenges to join */
export async function getWaitingChallenges(
  visitorGrade: Grade,
  gameType: GameType
): Promise<HeadToHeadChallenge[]> {
  try {
    const now = new Date();

    const q = query(
      collection(db, HEAD_TO_HEAD_COLLECTION),
      where("visitorGrade", "==", visitorGrade),
      where("gameType", "==", gameType),
      where("status", "==", "pending"),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);

    // Filter out expired challenges client-side
    return snapshot.docs
      .map((docSnapshot) => {
        const data = docSnapshot.data();
        return {
          ...data,
          id: docSnapshot.id,
          createdAt: toDate(data.createdAt),
          expiresAt: toDate(data.expiresAt),
          player1: {
            ...data.player1,
            completedAt: data.player1?.completedAt
              ? toDate(data.player1.completedAt)
              : undefined,
          },
          player2: data.player2
            ? {
                ...data.player2,
                completedAt: data.player2?.completedAt
                  ? toDate(data.player2.completedAt)
                  : undefined,
              }
            : null,
        } as HeadToHeadChallenge;
      })
      .filter((challenge) => challenge.expiresAt > now);
  } catch (error) {
    handleFirebaseError(error, "getWaitingChallenges");
  }
}

/** Join an existing challenge */
export async function joinChallenge(
  challengeId: string,
  player2Id: string,
  player2Name: string
): Promise<void> {
  try {
    const docRef = doc(db, HEAD_TO_HEAD_COLLECTION, challengeId);
    const docSnapshot = await getDoc(docRef);

    if (!docSnapshot.exists()) {
      throw new Error("Challenge not found");
    }

    const data = docSnapshot.data();

    if (data.status !== "pending") {
      throw new Error("Challenge is no longer available");
    }

    const expiresAt = toDate(data.expiresAt);
    if (expiresAt < new Date()) {
      throw new Error("Challenge has expired");
    }

    const player2: ChallengePlayer = {
      visitorId: player2Id,
      visitorName: player2Name,
      score: 0,
    };

    await updateDoc(docRef, {
      player2,
      status: "active",
    });
  } catch (error) {
    handleFirebaseError(error, "joinChallenge");
  }
}

/** Update a player's score in a challenge */
export async function updateChallengeScore(
  challengeId: string,
  playerId: string,
  score: number
): Promise<void> {
  try {
    const docRef = doc(db, HEAD_TO_HEAD_COLLECTION, challengeId);
    const docSnapshot = await getDoc(docRef);

    if (!docSnapshot.exists()) {
      throw new Error("Challenge not found");
    }

    const data = docSnapshot.data();

    if (data.player1?.visitorId === playerId) {
      await updateDoc(docRef, {
        "player1.score": score,
        "player1.completedAt": serverTimestamp(),
      });
    } else if (data.player2?.visitorId === playerId) {
      await updateDoc(docRef, {
        "player2.score": score,
        "player2.completedAt": serverTimestamp(),
      });
    } else {
      throw new Error("Player not found in challenge");
    }
  } catch (error) {
    handleFirebaseError(error, "updateChallengeScore");
  }
}

/** Mark a challenge as complete */
export async function completeChallenge(challengeId: string): Promise<void> {
  try {
    await updateDoc(doc(db, HEAD_TO_HEAD_COLLECTION, challengeId), {
      status: "completed",
    });
  } catch (error) {
    handleFirebaseError(error, "completeChallenge");
  }
}

/** Subscribe to real-time challenge updates */
export function subscribeToChallenge(
  challengeId: string,
  callback: (challenge: HeadToHeadChallenge | null) => void
): Unsubscribe {
  const docRef = doc(db, HEAD_TO_HEAD_COLLECTION, challengeId);

  return onSnapshot(
    docRef,
    (docSnapshot) => {
      if (!docSnapshot.exists()) {
        callback(null);
        return;
      }

      const data = docSnapshot.data();
      const challenge: HeadToHeadChallenge = {
        ...data,
        id: docSnapshot.id,
        createdAt: toDate(data.createdAt),
        expiresAt: toDate(data.expiresAt),
        player1: {
          ...data.player1,
          completedAt: data.player1?.completedAt
            ? toDate(data.player1.completedAt)
            : undefined,
        },
        player2: data.player2
          ? {
              ...data.player2,
              completedAt: data.player2?.completedAt
                ? toDate(data.player2.completedAt)
                : undefined,
            }
          : null,
      } as HeadToHeadChallenge;

      callback(challenge);
    },
    (error) => {
      console.error("Challenge subscription error:", error);
      callback(null);
    }
  );
}
