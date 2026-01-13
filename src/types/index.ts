// User roles
export type UserRole = "admin" | "teacher" | "parent" | "student";

// Hebrew grade levels
export type Grade = "א" | "ב" | "ג" | "ד" | "ה" | "ו";

// User stored in Firestore (document ID is the password)
export interface User {
  name: string;
  role: UserRole;
  grade: Grade | null;
  createdAt: Date;
}

// Learning unit within a grade
export interface Unit {
  id: string;
  gradeId: Grade;
  name: string;
  introFileUrl: string;
  unitFileUrl: string;
  order: number;
  createdAt: Date;
}

// Teacher documentation entry
export interface Documentation {
  id: string;
  unitId: string;
  gradeId: Grade;
  images: string[];
  text: string;
  teacherName: string;
  createdAt: Date;
}

// Student research journal entry
export interface ResearchJournal {
  id: string;
  unitId: string;
  gradeId: Grade;
  studentName: string;
  answers: JournalAnswer[];
  createdAt: Date;
}

export interface JournalAnswer {
  questionId: string;
  answer: string | number | string[];
}

// Question types for research journal
export type QuestionType = "rating" | "single" | "multiple" | "open";

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  options?: string[];
  target: {
    grades: Grade[];
    units: string[];
  };
  order: number;
}

// AI-generated report
export interface Report {
  id: string;
  unitId: string;
  gradeId: Grade;
  teacherContent: string;
  parentContent: string;
  generatedAt: Date;
}

// Forum post
export type ForumRoom = "requests" | "consultations";

export interface ForumPost {
  id: string;
  room: ForumRoom;
  authorName: string;
  title: string;
  content: string;
  replies: ForumReply[];
  createdAt: Date;
}

export interface ForumReply {
  authorName: string;
  content: string;
  createdAt: Date;
}

// Explanation button configuration
export interface ExplanationButton {
  id: string;
  role: UserRole;
  label: string;
  content: string;
  visible: boolean;
}

// Email configuration
export interface EmailConfig {
  adminEmails: string[];
  frequency: "immediate" | "daily";
  includeContent: boolean;
}

// Report configuration
export interface ReportElement {
  id: string;
  label: string;
  enabledForTeacher: boolean;
  enabledForParent: boolean;
}

export interface ReportConfig {
  elements: ReportElement[];
  aiPromptInstructions: string;
}

// Bot knowledge base entry
export interface BotKnowledge {
  id: string;
  title: string;
  content: string;
  fileUrl?: string;
  createdAt: Date;
}

// Session/Auth context
export interface AuthSession {
  user: User;
  documentId: string; // Changed from password - stores Firestore doc ID for re-validation
}
