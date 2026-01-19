// Query keys
export { queryKeys } from "./keys";

// Units
export {
  useUnitsByGrade,
  useUnit,
  useCreateUnit,
  useUpdateUnit,
  useDeleteUnit,
} from "./units";

// Questionnaires
export {
  useQuestionnairesByGrade,
  useActiveQuestionnaire,
  useQuestionnaire,
  useCreateQuestionnaire,
  useUpdateQuestionnaire,
  useDeleteQuestionnaire,
  useActivateQuestionnaire,
  useDeactivateQuestionnaire,
} from "./questionnaires";

// Journals
export {
  useJournalsByGrade,
  useJournalsByQuestionnaire,
  useSubmitJournal,
  useDeleteJournal,
} from "./journals";

// Reports
export { useReport, useGenerateReport } from "./reports";

// Documentation
export {
  useDocumentationByUnit,
  useCreateDocumentation,
  useDeleteDocumentation,
} from "./documentation";

// Visibility
export { useVisibilityConfig, useSaveVisibilityConfig } from "./visibility";

// Settings
export {
  usePedagogicalIntro,
  useSavePedagogicalIntro,
  useResourceFile,
  useSaveResourceFile,
  useDeleteResourceFile,
  useStemLinks,
  useSaveStemLinks,
  useExperts,
  useSaveExperts,
  useReorderExperts,
  useEmailConfig,
  useSaveEmailConfig,
  useReportConfig,
  useSaveReportConfig,
} from "./settings";

// Staff
export {
  useAllStaff,
  useStaffMember,
  useCreateStaffMember,
  useUpdateStaffMember,
  useDeleteStaffMember,
  useReorderStaff,
} from "./staff";

// Forum (Teacher)
export { usePosts, useCreatePost, useAddReply, useDeletePost, useUpdatePost, usePinPost } from "./forum";

// Forum (Student)
export {
  useStudentPosts,
  useCreateStudentPost,
  useAddStudentReply,
  useDeleteStudentPost,
  useUpdateStudentPost,
  usePinStudentPost,
} from "./studentForum";

// Users
export { useAllUsers, useUpdateUserPassword } from "./users";

// Global refresh hook
export { useRefreshAll } from "./refresh";

// Globe Monitor
export {
  useGlobeMonitorQuestions,
  useGlobeMonitorQuestion,
  useCreateGlobeMonitorQuestion,
  useUpdateGlobeMonitorQuestion,
  useDeleteGlobeMonitorQuestion,
  useSeedDefaultQuestions,
  useGlobeMonitorSubmissionsByMonth,
  useGlobeMonitorSubmission,
  useCreateGlobeMonitorSubmission,
  useUserSubmissionsCountToday,
} from "./globeMonitor";

// Bookings
export * from "./bookings";

// Personal Page
export {
  usePersonalPageConfig,
  useSavePersonalPageConfig,
  useAllPersonalMedia,
  usePersonalMediaByGrade,
  useCreatePersonalMedia,
  useUpdatePersonalMedia,
  useDeletePersonalMedia,
  useReorderPersonalMedia,
} from "./personal";
