import type { Timestamp } from "firebase/firestore";

export type ParentContentPageId = "community-activities" | "stem-family";

export interface ParentContentEvent {
  id: string;
  title: string;
  description: string;
  date?: string; // ISO date string YYYY-MM-DD
  imageUrl?: string;
  linkUrl?: string;
  createdAt: Date;
}

export interface ParentContentDocument {
  intro: string;
  events: ParentContentEvent[];
  updatedAt: Date;
}

// For Firestore operations (with Timestamp)
export interface ParentContentDocumentFirestore {
  intro: string;
  events: Array<Omit<ParentContentEvent, "createdAt"> & { createdAt: Timestamp }>;
  updatedAt: Timestamp;
}
