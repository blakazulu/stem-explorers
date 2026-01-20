"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useReportsByGrade } from "@/lib/queries";
import { Card } from "@/components/ui/Card";
import { SkeletonGrid } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  BarChart2,
  ArrowRight,
  Calendar,
  FileText,
  Users,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import type { Grade, UserRole, Report } from "@/types";

const VALID_GRADES: Grade[] = ["א", "ב", "ג", "ד", "ה", "ו"];

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("he-IL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export default function ReportsListPage() {
  const { session } = useAuth();
  const params = useParams();
  const router = useRouter();

  const role = params.role as UserRole;
  const grade = decodeURIComponent(params.grade as string) as Grade;

  const isValidGrade = VALID_GRADES.includes(grade);
  const isAdmin = session?.user.role === "admin";
  const isParent = session?.user.role === "parent";
  const showBackButton = isAdmin;

  const [expandedReportId, setExpandedReportId] = useState<string | null>(null);

  const { data: reports = [], isLoading } = useReportsByGrade(
    isValidGrade ? grade : null
  );

  // Redirect if invalid grade
  if (!isValidGrade) {
    router.replace(`/${role}/reports`);
    return null;
  }

  function toggleReport(reportId: string) {
    setExpandedReportId((prev) => (prev === reportId ? null : reportId));
  }

  // Determine which content to show based on role
  function getReportContent(report: Report): string {
    if (isParent) {
      return report.parentContent;
    }
    return report.teacherContent;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        {showBackButton && (
          <Link
            href={`/${role}/reports`}
            className="p-2 hover:bg-surface-2 rounded-lg transition-colors cursor-pointer"
            title="חזרה לבחירת כיתה"
          >
            <ArrowRight size={20} className="text-gray-500" />
          </Link>
        )}
        <div className="p-3 bg-secondary/10 rounded-xl">
          <BarChart2 size={24} className="text-secondary" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-rubik font-bold text-foreground">
            דוחות - כיתה {grade}
          </h1>
          <p className="text-sm text-gray-500">
            {reports.length} דוחות
          </p>
        </div>
      </div>

      {/* Reports List */}
      {isLoading ? (
        <SkeletonGrid count={4} columns={2} />
      ) : reports.length === 0 ? (
        <EmptyState
          icon="file-text"
          title="אין דוחות"
          description={`עדיין לא נוצרו דוחות לכיתה ${grade}`}
        />
      ) : (
        <div className="space-y-4">
          {reports.map((report, index) => {
            const isExpanded = expandedReportId === report.id;

            return (
              <Card
                key={report.id}
                className={`overflow-hidden animate-slide-up stagger-${Math.min(index + 1, 6)}`}
              >
                {/* Header - Always visible */}
                <button
                  onClick={() => toggleReport(report.id)}
                  className="w-full flex items-center justify-between p-4 text-right cursor-pointer hover:bg-surface-1 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-secondary/10 rounded-full">
                      <FileText size={20} className="text-secondary" />
                    </div>
                    <div>
                      <h3 className="font-rubik font-semibold text-foreground">
                        {report.questionnaireName}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {report.generatedAt
                            ? formatDate(report.generatedAt)
                            : "לא ידוע"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users size={14} />
                          {report.journalCount} תגובות
                        </span>
                      </div>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp size={20} className="text-gray-400" />
                  ) : (
                    <ChevronDown size={20} className="text-gray-400" />
                  )}
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-surface-2 p-4 animate-slide-up">
                    <div className="prose prose-sm max-w-none text-foreground">
                      <ReactMarkdown>{getReportContent(report)}</ReactMarkdown>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
