"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import { useAuth } from "@/contexts/AuthContext";
import { useUnit, useReport } from "@/lib/queries";
import { Card } from "@/components/ui/Card";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { BarChart2, FileText, ArrowRight } from "lucide-react";
import type { Grade, UserRole } from "@/types";

const VALID_GRADES: Grade[] = ["א", "ב", "ג", "ד", "ה", "ו"];

export default function ReportViewPage() {
  const { session } = useAuth();
  const params = useParams();
  const router = useRouter();

  const role = params.role as UserRole;
  const grade = decodeURIComponent(params.grade as string) as Grade;
  const unitId = params.unitId as string;

  const isValidGrade = VALID_GRADES.includes(grade);
  const isParent = session?.user.role === "parent";

  // Load unit data using React Query
  const {
    data: unit,
    isLoading: unitLoading,
    isError: unitError,
  } = useUnit(isValidGrade ? unitId : null);

  // Load report data using React Query
  const {
    data: report,
    isLoading: reportLoading,
  } = useReport(
    isValidGrade && unit ? unitId : null,
    isValidGrade && unit ? grade : null
  );

  const loading = unitLoading || reportLoading;

  // Handle invalid grade - redirect
  if (!isValidGrade) {
    router.replace(`/${role}/reports`);
    return null;
  }

  // Handle unit error or unit grade mismatch - redirect
  if (unitError || (unit && unit.gradeId !== grade)) {
    router.replace(`/${role}/reports/${grade}`);
    return null;
  }

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-secondary/10 rounded-xl">
            <BarChart2 size={24} className="text-secondary" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-rubik font-bold text-foreground">
              טוען דוח...
            </h1>
          </div>
        </div>
        <Card>
          <div className="space-y-4">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </Card>
      </div>
    );
  }

  if (!unit) {
    return null;
  }

  const reportContent = report
    ? isParent
      ? report.parentContent
      : report.teacherContent
    : null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <Link
          href={`/${role}/reports/${grade}`}
          className="p-2 hover:bg-surface-2 rounded-lg transition-colors cursor-pointer"
          title="חזרה לבחירת יחידה"
        >
          <ArrowRight size={20} className="text-gray-500" />
        </Link>
        <div className="p-3 bg-secondary/10 rounded-xl">
          <BarChart2 size={24} className="text-secondary" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-rubik font-bold text-foreground">
            דוח - {unit.name}
          </h1>
          <p className="text-sm text-gray-500">
            כיתה {grade} • דוח {isParent ? "להורים" : "למורים"}
          </p>
        </div>
      </div>

      {/* Report Card */}
      <Card padding="none" className="overflow-hidden">
        {/* Report Header */}
        <div className="bg-gradient-to-l from-secondary/10 to-primary/10 px-4 md:px-6 py-4 border-b border-surface-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-secondary/20 rounded-lg">
              <FileText size={20} className="text-secondary" />
            </div>
            <div>
              <h2 className="text-lg font-rubik font-bold text-foreground">
                {unit.name}
              </h2>
              <p className="text-sm text-gray-500">
                דוח {isParent ? "להורים" : "למורים"}
              </p>
            </div>
          </div>
        </div>

        {/* Report Content */}
        <div className="p-4 md:p-6">
          {reportContent ? (
            <div
              className="prose prose-lg max-w-none prose-headings:font-rubik prose-headings:text-foreground prose-p:text-gray-600 prose-strong:text-foreground prose-ul:text-gray-600 prose-ol:text-gray-600"
              dir="rtl"
            >
              <ReactMarkdown rehypePlugins={[rehypeSanitize]}>{reportContent}</ReactMarkdown>
            </div>
          ) : (
            <EmptyState
              icon="file-text"
              title="אין דוח זמין"
              description="לא נמצא דוח ליחידה זו"
            />
          )}
        </div>
      </Card>
    </div>
  );
}
