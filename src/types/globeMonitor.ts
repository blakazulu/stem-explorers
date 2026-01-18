// Globe Monitor question types
export type GlobeMonitorQuestionType = "text" | "number" | "date" | "time" | "single" | "multi";

// Question definition
export interface GlobeMonitorQuestion {
  id: string;
  label: string;
  description?: string;
  type: GlobeMonitorQuestionType;
  options?: string[];      // For single/multi select
  unit?: string;           // For number type (e.g., "°C", "%")
  min?: number;            // For number type
  max?: number;            // For number type
  required: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

// Submission
export interface GlobeMonitorSubmission {
  id: string;
  answers: Record<string, string | number | string[]>;
  submittedBy: string;
  submittedByName: string;
  submittedAt: Date;
  date: string;            // YYYY-MM-DD for calendar grouping
}

// Default questions configuration
export const DEFAULT_GLOBE_MONITOR_QUESTIONS: Omit<GlobeMonitorQuestion, "id" | "createdAt" | "updatedAt">[] = [
  {
    label: "תאריך",
    type: "date",
    required: true,
    order: 0,
  },
  {
    label: "שעה",
    type: "time",
    required: true,
    order: 1,
  },
  {
    label: "טמפרטורה",
    type: "number",
    unit: "°C",
    required: false,
    order: 2,
  },
  {
    label: "לחות",
    type: "number",
    unit: "%",
    max: 100,
    required: false,
    order: 3,
  },
  {
    label: "עננות - סוגי העננים",
    type: "multi",
    options: ["קומולוס", "סטרטוס", "ציררוס", "קומולונימבוס", "ערפל", "שמיים בהירים"],
    required: false,
    order: 4,
  },
  {
    label: "אחוז כיסוי בשמים",
    type: "number",
    unit: "%",
    min: 0,
    max: 100,
    required: false,
    order: 5,
  },
  {
    label: "משקעים",
    type: "single",
    options: ["יש", "אין"],
    required: false,
    order: 6,
  },
  {
    label: "מצב הקרקע",
    type: "single",
    options: ["יבשה", "רטובה", "בוצית"],
    required: false,
    order: 7,
  },
];
