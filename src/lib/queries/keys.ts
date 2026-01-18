import type { Grade } from "@/types";
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
    active: (gradeId: Grade, unitId: string) =>
      ["questionnaires", "active", gradeId, unitId] as const,
    single: (id: string) => ["questionnaires", id] as const,
  },
  journals: {
    byUnit: (unitId: string, gradeId: Grade) =>
      ["journals", unitId, gradeId] as const,
  },
  reports: {
    single: (unitId: string, gradeId: Grade) =>
      ["reports", unitId, gradeId] as const,
  },
  documentation: {
    byUnit: (unitId: string, gradeId: Grade) =>
      ["documentation", unitId, gradeId] as const,
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
  },
};
