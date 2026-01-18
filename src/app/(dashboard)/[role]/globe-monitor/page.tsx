"use client";

import { useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import type { UserRole } from "@/types";
import AdminQuestionList from "./components/AdminQuestionList";
import StudentCalendarView from "./components/StudentCalendarView";

export default function GlobeMonitorPage() {
  const { session } = useAuth();
  const params = useParams();
  const role = params.role as UserRole;

  if (!session) return null;

  // Role-based view
  if (role === "admin") {
    return <AdminQuestionList />;
  }

  return <StudentCalendarView />;
}
