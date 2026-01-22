// User roles
export type UserRole = "admin" | "teacher" | "parent" | "student";

// Hebrew grade levels
export type Grade = "א" | "ב" | "ג" | "ד" | "ה" | "ו";

// User stored in Firestore (document ID is the password)
export interface User {
  name: string;
  role: UserRole;
  grade: Grade | null;
  canSubmitGlobeMonitor?: boolean; // Flag for users who can submit globe monitoring data
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
  gradeId: Grade;
  studentName: string;
  questionnaireId: string;
  answers: JournalAnswer[];
  createdAt: Date;
}

export interface JournalAnswer {
  questionId: string;
  questionText: string;
  answer: string | number | string[];
}

// Question types for research journal
export type QuestionType = "rating" | "single" | "multiple" | "open";

// Rating visual styles
export type RatingStyle = "stars" | "hearts" | "emojis" | "thumbs";

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  options?: string[];
  ratingStyle?: RatingStyle; // Only used when type === "rating"
  hasOtherOption?: boolean; // Only used when type === "single" or "multiple"
  maxSelections?: number; // Only used when type === "multiple" (undefined = unlimited)
  target: {
    grades: Grade[];
    units: string[];
  };
  order: number;
}

// Embedded question within a questionnaire (no target - determined by parent)
export interface EmbeddedQuestion {
  id: string;
  type: QuestionType;
  text: string;
  options?: string[];
  ratingStyle?: RatingStyle; // Only used when type === "rating"
  hasOtherOption?: boolean; // Only used when type === "single" or "multiple"
  maxSelections?: number; // Only used when type === "multiple" (undefined = unlimited)
  order: number;
}

// Questionnaire containing embedded questions
export interface Questionnaire {
  id: string;
  name: string;
  gradeId: Grade;
  questions: EmbeddedQuestion[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// AI-generated report
export interface Report {
  id: string;
  gradeId: Grade;
  questionnaireId: string;
  questionnaireName: string;
  journalCount: number;
  teacherContent: string;
  parentContent: string;
  generatedAt: Date;
}

// Forum types
export type ForumType = "teacher" | "student";

export interface ForumPost {
  id: string;
  authorName: string;
  authorGrade?: Grade | "all"; // Grade for students, "all" for admin posts visible to everyone
  title: string;
  content: string;
  replies: ForumReply[];
  pinned?: boolean;
  createdAt: Date;
}

export interface ForumReply {
  id: string;
  authorName: string;
  content: string;
  createdAt: Date;
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

// Staff member for צוות מו"פ (global - not per grade)
export interface StaffMember {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  order: number;
  createdAt: Date;
}

// STEM link for teaching resources
export interface StemLink {
  id: string;
  description: string;
  url: string;
  grade: Grade | null; // null = all grades, Grade = specific grade only
  createdAt: Date;
}

// Expert availability time range
export interface TimeRange {
  start: string;  // "10:00" (HH:mm format)
  end: string;    // "11:00"
}

// Expert availability for a specific date
export interface ExpertAvailability {
  date: string;           // "2025-01-15" (ISO date YYYY-MM-DD)
  timeRanges: TimeRange[];
}

// Expert consultation booking
export interface ExpertBooking {
  id: string;
  expertId: string;
  date: string;              // "2025-01-15"
  startTime: string;         // "10:00"
  endTime: string;           // "10:10"
  userId: string;
  userName: string;
  userRole: UserRole;
  userGrade: Grade | null;
  participants: string;      // Names of meeting participants
  topic: string;
  createdAt: Date;
  sessionToken: string;      // For 5-min cancel window check
}

// Expert for "שאל את המומחה" section
export interface Expert {
  id: string;
  name: string;
  title: string;
  description: string;
  availability: ExpertAvailability[];  // Structured availability (replaces old string field)
  imageUrl: string;
  grade: Grade | null; // null = all grades, Grade = specific grade only
  roles: ConfigurableRole[]; // which roles can see this expert (empty = all roles)
  order: number;
  createdAt: Date;
}

// Visibility configuration types
export type ConfigurableRole = 'teacher' | 'parent' | 'student';

export interface VisibilityConfig {
  dashboards: Record<ConfigurableRole, DashboardConfig>;
  sidebars: Record<ConfigurableRole, SidebarConfig>;
  pageElements: Record<ConfigurableRole, PageElementsConfig>;
}

export interface DashboardConfig {
  intro: string;
  introHtml?: string;   // Rich text HTML - takes precedence over intro
  bannerUrl?: string;   // Optional header banner
  cards: DashboardCardConfig[];
}

export interface DashboardCardConfig {
  id: string;
  visible: boolean;
  order: number;
  description?: string; // Custom description (overrides default)
}

export interface SidebarConfig {
  links: SidebarLinkConfig[];
}

export interface SidebarLinkConfig {
  id: string;
  label: string;
  visible: boolean;
}

export interface PageElementsConfig {
  teachingResources: {
    curricula: boolean;
    stemLinks: boolean;
    equipment: boolean;
  };
  pedagogical: {
    unitCards: boolean;
    pedagogicalModel: boolean;
    trainingSchedule: boolean;
    timetable: boolean;
  };
  documentation: {
    images: boolean;
    text: boolean;
    teacherName: boolean;
  };
}

// Globe Monitor
export type {
  GlobeMonitorQuestionType,
  GlobeMonitorQuestion,
  GlobeMonitorSubmission,
} from "./globeMonitor";
export { DEFAULT_GLOBE_MONITOR_QUESTIONS } from "./globeMonitor";

// Personal Page
export type PersonalMediaType = "image" | "video" | "youtube" | "embed";

export interface PersonalPageConfig {
  id: string;
  introText: string;
  bannerUrl?: string;
  updatedAt: Date;
  updatedBy: string;
}

export interface PersonalMedia {
  id: string;
  type: PersonalMediaType;
  url: string;
  thumbnailUrl?: string;
  title: string;
  description?: string;
  grades: Grade[] | "all";
  createdAt: Date;
  createdBy: string;
  order: number;
}

// Pedagogical Intro (extended for rich text)
export interface PedagogicalIntro {
  text: string;         // Plain text (backwards compat)
  introHtml?: string;   // Rich text HTML - takes precedence
  bannerUrl?: string;   // Optional header banner
}

// Parent Content
export type {
  ParentContentPageId,
  ParentContentEvent,
  ParentContentDocument,
} from "./parentContent";

// Announcements (יוצאים לדרך)
export interface Announcement {
  id: string;
  content: string;
  imageUrl?: string;
  targetGrade: Grade | "all";
  comments: AnnouncementComment[];
  authorName: string;
  createdAt: Date;
}

export interface AnnouncementComment {
  id: string;
  authorName: string;
  authorGrade: Grade;
  content: string;
  createdAt: Date;
}

// Parent Challenges (אתגר הורים)
export interface Challenge {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  videoUrl?: string;        // YouTube/Vimeo embed URL
  videoStorageUrl?: string; // Direct upload URL from Firebase Storage
  targetGrades: Grade[] | "all";
  isActive: boolean;
  comments: ChallengeComment[];
  authorName: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChallengeComment {
  id: string;
  authorName: string;
  authorGrade: Grade;
  content: string;
  imageUrl?: string;       // Legacy single image (for backwards compatibility)
  imageUrls?: string[];    // Up to 3 images
  videoUrl?: string;       // Single video URL from Firebase Storage
  createdAt: Date;
}

// Games
export * from "./games";
