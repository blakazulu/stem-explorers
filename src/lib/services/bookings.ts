import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { handleFirebaseError } from "@/lib/utils/errors";
import type { ExpertBooking } from "@/types";

const BOOKINGS_COLLECTION = "expert-bookings";

// Convert Firestore doc to ExpertBooking
function docToBooking(id: string, data: Record<string, unknown>): ExpertBooking {
  const createdAt = data.createdAt as { toDate?: () => Date } | undefined;
  return {
    id,
    expertId: data.expertId as string,
    date: data.date as string,
    startTime: data.startTime as string,
    endTime: data.endTime as string,
    userId: data.userId as string,
    userName: data.userName as string,
    userRole: data.userRole as ExpertBooking["userRole"],
    userGrade: data.userGrade as ExpertBooking["userGrade"],
    participants: (data.participants as string) || "",
    topic: data.topic as string,
    createdAt: createdAt?.toDate?.() || new Date(),
    sessionToken: data.sessionToken as string,
  };
}

// Get all bookings (admin use)
export async function getBookings(): Promise<ExpertBooking[]> {
  try {
    const q = query(
      collection(db, BOOKINGS_COLLECTION),
      orderBy("date", "asc"),
      orderBy("startTime", "asc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => docToBooking(doc.id, doc.data()));
  } catch (error) {
    handleFirebaseError(error, "getBookings");
    throw error;
  }
}

// Get bookings for a specific date
export async function getBookingsByDate(date: string): Promise<ExpertBooking[]> {
  try {
    const q = query(
      collection(db, BOOKINGS_COLLECTION),
      where("date", "==", date),
      orderBy("startTime", "asc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => docToBooking(doc.id, doc.data()));
  } catch (error) {
    handleFirebaseError(error, "getBookingsByDate");
    throw error;
  }
}

// Get bookings for a date range (e.g., month)
export async function getBookingsByDateRange(
  startDate: string,
  endDate: string
): Promise<ExpertBooking[]> {
  try {
    const q = query(
      collection(db, BOOKINGS_COLLECTION),
      where("date", ">=", startDate),
      where("date", "<=", endDate),
      orderBy("date", "asc"),
      orderBy("startTime", "asc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => docToBooking(doc.id, doc.data()));
  } catch (error) {
    handleFirebaseError(error, "getBookingsByDateRange");
    throw error;
  }
}

// Get bookings for a specific expert
export async function getBookingsByExpert(expertId: string): Promise<ExpertBooking[]> {
  try {
    const q = query(
      collection(db, BOOKINGS_COLLECTION),
      where("expertId", "==", expertId),
      orderBy("date", "asc"),
      orderBy("startTime", "asc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => docToBooking(doc.id, doc.data()));
  } catch (error) {
    handleFirebaseError(error, "getBookingsByExpert");
    throw error;
  }
}

// Get a single booking by ID
export async function getBooking(bookingId: string): Promise<ExpertBooking | null> {
  try {
    const docRef = doc(db, BOOKINGS_COLLECTION, bookingId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    return docToBooking(docSnap.id, docSnap.data());
  } catch (error) {
    handleFirebaseError(error, "getBooking");
    throw error;
  }
}

// Create a new booking (with slot availability check)
export async function createBooking(
  booking: Omit<ExpertBooking, "id" | "createdAt">
): Promise<ExpertBooking> {
  try {
    // Check for existing booking at the same slot to prevent race condition
    const existingQuery = query(
      collection(db, BOOKINGS_COLLECTION),
      where("expertId", "==", booking.expertId),
      where("date", "==", booking.date),
      where("startTime", "==", booking.startTime)
    );
    const existingSnapshot = await getDocs(existingQuery);

    if (!existingSnapshot.empty) {
      throw new Error("SLOT_ALREADY_BOOKED");
    }

    const id = crypto.randomUUID();
    const now = new Date();
    const docRef = doc(db, BOOKINGS_COLLECTION, id);

    await setDoc(docRef, {
      ...booking,
      createdAt: Timestamp.fromDate(now),
    });

    return {
      ...booking,
      id,
      createdAt: now,
    };
  } catch (error) {
    handleFirebaseError(error, "createBooking");
    throw error;
  }
}

// Delete a booking
export async function deleteBooking(bookingId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, BOOKINGS_COLLECTION, bookingId));
  } catch (error) {
    handleFirebaseError(error, "deleteBooking");
    throw error;
  }
}

// Delete multiple bookings (for when admin removes availability)
export async function deleteBookings(bookingIds: string[]): Promise<void> {
  try {
    await Promise.all(bookingIds.map((id) => deleteDoc(doc(db, BOOKINGS_COLLECTION, id))));
  } catch (error) {
    handleFirebaseError(error, "deleteBookings");
    throw error;
  }
}
