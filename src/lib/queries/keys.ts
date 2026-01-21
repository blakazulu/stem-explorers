import type { Grade } from "@/types";
import type { GameType, Difficulty } from "@/types/games";
import type { ResourceType } from "@/lib/services/settings";

export const queryKeys = {
  units: {
    all: ["units"] as const,
    byGrade: (grade: Grade) => ["units", "byGrade", grade] as const,
    single: (id: string) => ["units", id] as const,
  },
  questionnaires: {
    all: ["questionnaires"] as const,
    byGrade: (grade: Grade) => ["questionnaires", "byGrade", grade] as const,
    active: (gradeId: Grade) => ["questionnaires", "active", gradeId] as const,
    single: (id: string) => ["questionnaires", id] as const,
  },
  journals: {
    byGrade: (gradeId: Grade) => ["journals", "byGrade", gradeId] as const,
    byQuestionnaire: (questionnaireId: string) =>
      ["journals", "byQuestionnaire", questionnaireId] as const,
    today: ["journals", "today"] as const,
  },
  reports: {
    byGrade: (gradeId: Grade) => ["reports", "byGrade", gradeId] as const,
    single: (reportId: string) => ["reports", reportId] as const,
  },
  documentation: {
    byUnit: (unitId: string, gradeId: Grade) =>
      ["documentation", unitId, gradeId] as const,
    countsByGrade: ["documentation", "counts", "byGrade"] as const,
    countsByUnit: (gradeId: Grade) =>
      ["documentation", "counts", "byUnit", gradeId] as const,
  },
  visibility: ["visibility"] as const,
  settings: {
    pedagogicalIntro: (grade: Grade) =>
      ["settings", "pedagogicalIntro", grade] as const,
    resourceFile: (type: ResourceType) =>
      ["settings", "resourceFile", type] as const,
    experts: ["settings", "experts"] as const,
    stemLinks: ["settings", "stemLinks"] as const,
    emailConfig: ["settings", "emailConfig"] as const,
    reportConfig: ["settings", "reportConfig"] as const,
  },
  staff: {
    all: ["staff"] as const,
    byGrade: (grade: Grade) => ["staff", "byGrade", grade] as const,
    single: (id: string) => ["staff", id] as const,
  },
  forum: {
    posts: ["forum", "posts"] as const,
  },
  studentForum: {
    posts: ["studentForum", "posts"] as const,
    postsByGrade: (grade: Grade) => ["studentForum", "posts", grade] as const,
  },
  users: {
    all: ["users", "all"] as const,
  },
  globeMonitor: {
    questions: ["globeMonitor", "questions"] as const,
    question: (id: string) => ["globeMonitor", "questions", id] as const,
    submissions: ["globeMonitor", "submissions"] as const,
    submissionsByMonth: (year: number, month: number) =>
      ["globeMonitor", "submissions", year, month] as const,
    submission: (id: string) => ["globeMonitor", "submissions", id] as const,
    userSubmissionsCountToday: (userId: string) =>
      ["globeMonitor", "submissions", "countToday", userId] as const,
  },
  bookings: {
    all: ["bookings"] as const,
    byDate: (date: string) => ["bookings", "date", date] as const,
    byDateRange: (startDate: string, endDate: string) =>
      ["bookings", "dateRange", startDate, endDate] as const,
    byExpert: (expertId: string) => ["bookings", "expert", expertId] as const,
    single: (id: string) => ["bookings", id] as const,
  },
  personal: {
    config: ["personal", "config"] as const,
    media: (grade?: Grade) => ["personal", "media", grade] as const,
    allMedia: ["personal", "media", "all"] as const,
  },
  parentContent: {
    page: (pageId: string) => ["parentContent", pageId] as const,
  },
  announcements: {
    all: ["announcements"] as const,
    byGrade: (grade: Grade) => ["announcements", "byGrade", grade] as const,
  },
  challenges: {
    all: ["challenges"] as const,
    byGrade: (grade: Grade) => ["challenges", "byGrade", grade] as const,
  },
  games: {
    content: {
      all: ["games", "content"] as const,
      byType: (gameType: GameType) => ["games", "content", gameType] as const,
      byTypeAndGrade: (gameType: GameType, grade: Grade) =>
        ["games", "content", gameType, grade] as const,
      byTypeGradeAndDifficulty: (gameType: GameType, grade: Grade, difficulty: Difficulty) =>
        ["games", "content", gameType, grade, difficulty] as const,
    },
    progress: {
      all: ["games", "progress"] as const,
      byVisitor: (visitorId: string, grade: Grade) =>
        ["games", "progress", visitorId, grade] as const,
    },
    badges: {
      byVisitor: (visitorId: string, grade: Grade) =>
        ["games", "badges", visitorId, grade] as const,
    },
    headToHead: {
      waiting: (grade: Grade, gameType: GameType) =>
        ["games", "headToHead", "waiting", grade, gameType] as const,
      single: (challengeId: string) =>
        ["games", "headToHead", challengeId] as const,
    },
  },
};
