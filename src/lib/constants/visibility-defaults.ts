import type { VisibilityConfig, DashboardConfig, SidebarConfig, PageElementsConfig } from "@/types";

// All possible dashboard cards with their metadata (must match ALL_SIDEBAR_LINKS)
export const ALL_DASHBOARD_CARDS = {
  pedagogical: { label: "מודל פדגוגי", description: "צפה ביחידות הלימוד" },
  "teaching-resources": { label: "משאבי הוראה", description: "תוכניות לימודים וקישורים" },
  documentation: { label: "תיעודים", description: "צפה בתיעודי פעילויות" },
  journal: { label: "יומן חוקר", description: "המשך לכתוב ביומן החקר שלך" },
  reports: { label: "דוחות", description: "צפה בדוחות AI" },
  responses: { label: "תגובות תלמידים", description: "צפה בתגובות התלמידים ליומן" },
  forum: { label: "במה אישית", description: "שתפו רעיונות והתייעצו" },
  experts: { label: "שאל את המומחה", description: "צור קשר עם מומחים בתחומי STEM" },
  "community-activities": { label: "פעילויות קהילתיות", description: "פעילויות קהילתיות להורים" },
  "stem-family": { label: "STEM במשפחה", description: "פעילויות STEM במשפחה" },
  partners: { label: "שותפים לדרך", description: "שותפים לדרך" },
} as const;

// All possible sidebar links with their metadata
export const ALL_SIDEBAR_LINKS = {
  pedagogical: { defaultLabel: "מודל פדגוגי ומו\"פ", href: "/pedagogical" },
  "teaching-resources": { defaultLabel: "משאבי הוראה", href: "/teaching-resources" },
  documentation: { defaultLabel: "תיעודים", href: "/documentation" },
  journal: { defaultLabel: "יומן חוקר", href: "/journal" },
  reports: { defaultLabel: "דוחות", href: "/reports" },
  responses: { defaultLabel: "תגובות תלמידים", href: "/responses" },
  forum: { defaultLabel: "במה אישית", href: "/forum" },
  experts: { defaultLabel: "שאל את המומחה", href: "/experts" },
  "community-activities": { defaultLabel: "פעילויות קהילתיות", href: "/community-activities" },
  "stem-family": { defaultLabel: "STEM במשפחה", href: "/stem-family" },
  partners: { defaultLabel: "שותפים לדרך", href: "/partners" },
} as const;

// Page element labels for admin UI
export const PAGE_ELEMENT_LABELS = {
  teachingResources: {
    _title: "משאבי הוראה",
    curricula: "תוכניות לימודים",
    stemLinks: "קישורי STEM",
    equipment: "טופס הצטיידות",
  },
  pedagogical: {
    _title: "מודל פדגוגי",
    unitCards: "כרטיסי יחידות",
    unitDetails: "פרטי יחידה",
  },
  documentation: {
    _title: "תיעודים",
    images: "תמונות",
    text: "טקסט",
    teacherName: "שם המורה",
  },
} as const;

const DEFAULT_TEACHER_DASHBOARD: DashboardConfig = {
  intro: "",
  cards: [
    { id: "pedagogical", visible: true, order: 0 },
    { id: "teaching-resources", visible: true, order: 1 },
    { id: "documentation", visible: true, order: 2 },
    { id: "reports", visible: true, order: 3 },
    { id: "responses", visible: false, order: 4 },
    { id: "forum", visible: false, order: 5 },
    { id: "experts", visible: false, order: 6 },
  ],
};

const DEFAULT_PARENT_DASHBOARD: DashboardConfig = {
  intro: "",
  cards: [
    { id: "pedagogical", visible: true, order: 0 },
    { id: "documentation", visible: true, order: 1 },
    { id: "reports", visible: true, order: 2 },
    { id: "experts", visible: true, order: 3 },
    { id: "community-activities", visible: false, order: 4 },
    { id: "stem-family", visible: false, order: 5 },
    { id: "partners", visible: false, order: 6 },
  ],
};

const DEFAULT_STUDENT_DASHBOARD: DashboardConfig = {
  intro: "",
  cards: [
    { id: "pedagogical", visible: true, order: 0 },
    { id: "journal", visible: true, order: 1 },
    { id: "documentation", visible: true, order: 2 },
    { id: "experts", visible: true, order: 3 },
  ],
};

const DEFAULT_TEACHER_SIDEBAR: SidebarConfig = {
  links: [
    { id: "pedagogical", label: "מודל פדגוגי ומו\"פ", visible: true },
    { id: "teaching-resources", label: "משאבי הוראה", visible: true },
    { id: "documentation", label: "תיעודים", visible: true },
    { id: "reports", label: "דוחות", visible: true },
    { id: "responses", label: "תגובות תלמידים", visible: true },
    { id: "forum", label: "במה אישית", visible: true },
    { id: "experts", label: "שאל את המומחה", visible: true },
  ],
};

const DEFAULT_PARENT_SIDEBAR: SidebarConfig = {
  links: [
    { id: "pedagogical", label: "מודל פדגוגי ומו\"פ", visible: true },
    { id: "documentation", label: "תיעודים", visible: true },
    { id: "reports", label: "דוחות", visible: true },
    { id: "experts", label: "שאל את המומחה", visible: true },
    { id: "community-activities", label: "פעילויות קהילתיות", visible: true },
    { id: "stem-family", label: "STEM במשפחה", visible: true },
    { id: "partners", label: "שותפים לדרך", visible: true },
  ],
};

const DEFAULT_STUDENT_SIDEBAR: SidebarConfig = {
  links: [
    { id: "pedagogical", label: "מודל פדגוגי ומו\"פ", visible: true },
    { id: "journal", label: "יומן חוקר", visible: true },
    { id: "documentation", label: "תיעודים", visible: true },
    { id: "experts", label: "שאל את המומחה", visible: true },
  ],
};

const DEFAULT_TEACHER_PAGE_ELEMENTS: PageElementsConfig = {
  teachingResources: { curricula: true, stemLinks: true, equipment: true },
  pedagogical: { unitCards: true, unitDetails: true },
  documentation: { images: true, text: true, teacherName: true },
};

const DEFAULT_PARENT_PAGE_ELEMENTS: PageElementsConfig = {
  teachingResources: { curricula: true, stemLinks: false, equipment: false },
  pedagogical: { unitCards: true, unitDetails: true },
  documentation: { images: true, text: true, teacherName: true },
};

const DEFAULT_STUDENT_PAGE_ELEMENTS: PageElementsConfig = {
  teachingResources: { curricula: false, stemLinks: false, equipment: false },
  pedagogical: { unitCards: true, unitDetails: true },
  documentation: { images: true, text: true, teacherName: false },
};

export const DEFAULT_VISIBILITY_CONFIG: VisibilityConfig = {
  dashboards: {
    teacher: DEFAULT_TEACHER_DASHBOARD,
    parent: DEFAULT_PARENT_DASHBOARD,
    student: DEFAULT_STUDENT_DASHBOARD,
  },
  sidebars: {
    teacher: DEFAULT_TEACHER_SIDEBAR,
    parent: DEFAULT_PARENT_SIDEBAR,
    student: DEFAULT_STUDENT_SIDEBAR,
  },
  pageElements: {
    teacher: DEFAULT_TEACHER_PAGE_ELEMENTS,
    parent: DEFAULT_PARENT_PAGE_ELEMENTS,
    student: DEFAULT_STUDENT_PAGE_ELEMENTS,
  },
};
