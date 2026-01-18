"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import {
  useGlobeMonitorSubmissionsByMonth,
  useGlobeMonitorQuestions,
} from "@/lib/queries";
import { Skeleton } from "@/components/ui/Skeleton";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  Globe,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Clock,
  Thermometer,
  Droplets,
  Cloud,
  Eye,
  X,
} from "lucide-react";
import type { GlobeMonitorSubmission, GlobeMonitorQuestion } from "@/types";

const HEBREW_MONTHS = [
  "ינואר",
  "פברואר",
  "מרץ",
  "אפריל",
  "מאי",
  "יוני",
  "יולי",
  "אוגוסט",
  "ספטמבר",
  "אוקטובר",
  "נובמבר",
  "דצמבר",
];

const HEBREW_DAYS = ["א'", "ב'", "ג'", "ד'", "ה'", "ו'", "ש'"];

export default function StudentCalendarView() {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<GlobeMonitorSubmission | null>(null);

  const { data: submissions, isLoading: submissionsLoading } =
    useGlobeMonitorSubmissionsByMonth(currentYear, currentMonth);
  const { data: questions, isLoading: questionsLoading } = useGlobeMonitorQuestions();

  const isLoading = submissionsLoading || questionsLoading;

  // Group submissions by date
  const submissionsByDate = useMemo(() => {
    if (!submissions) return {};
    return submissions.reduce((acc, sub) => {
      if (!acc[sub.date]) acc[sub.date] = [];
      acc[sub.date].push(sub);
      return acc;
    }, {} as Record<string, GlobeMonitorSubmission[]>);
  }, [submissions]);

  // Get days in month
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1).getDay();

  // Navigation
  const goToPrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelectedDate(null);
  };

  const goToNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelectedDate(null);
  };

  const handleDateClick = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    setSelectedDate(selectedDate === dateStr ? null : dateStr);
  };

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex flex-col items-center gap-4">
        <Image
          src="/bg/globe.jpg"
          alt="Globe Monitor"
          width={120}
          height={120}
          className="rounded-full shadow-lg"
        />
        <div className="text-center">
          <h1 className="text-xl md:text-2xl font-rubik font-bold text-foreground flex items-center justify-center gap-2">
            <Globe className="text-role-student" size={28} />
            גלוב-ניטורר
          </h1>
          <p className="text-sm text-gray-500 mt-1">צפייה בנתוני ניטור</p>
        </div>
      </div>

      {/* Calendar */}
      <Card className="p-4">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={goToNextMonth}
            className="p-2 hover:bg-surface-2 rounded-lg transition-colors cursor-pointer"
          >
            <ChevronRight size={20} />
          </button>
          <h2 className="text-lg font-rubik font-semibold">
            {HEBREW_MONTHS[currentMonth - 1]} {currentYear}
          </h2>
          <button
            onClick={goToPrevMonth}
            className="p-2 hover:bg-surface-2 rounded-lg transition-colors cursor-pointer"
          >
            <ChevronLeft size={20} />
          </button>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {HEBREW_DAYS.map((day) => (
            <div
              key={day}
              className="text-center text-xs font-medium text-gray-500 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        {isLoading ? (
          <Skeleton variant="card" height={250} />
        ) : (
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for days before the first of the month */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="h-12" />
            ))}

            {/* Days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const hasData = submissionsByDate[dateStr]?.length > 0;
              const isToday = dateStr === todayStr;
              const isSelected = dateStr === selectedDate;

              return (
                <button
                  key={day}
                  onClick={() => handleDateClick(day)}
                  className={`h-12 rounded-lg text-sm font-medium transition-all cursor-pointer relative ${
                    isSelected
                      ? "bg-primary text-white"
                      : isToday
                      ? "bg-primary/20 text-primary"
                      : hasData
                      ? "bg-success/10 hover:bg-success/20"
                      : "hover:bg-surface-2"
                  }`}
                >
                  {day}
                  {hasData && !isSelected && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-success" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </Card>

      {/* Submissions for Selected Date */}
      {selectedDate && (
        <div className="space-y-3 animate-slide-up">
          <h3 className="font-rubik font-semibold flex items-center gap-2">
            <Calendar size={18} className="text-primary" />
            {formatHebrewDate(selectedDate)}
          </h3>

          {submissionsByDate[selectedDate]?.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {submissionsByDate[selectedDate].map((submission) => (
                <SubmissionCard
                  key={submission.id}
                  submission={submission}
                  questions={questions || []}
                  onViewDetails={() => setSelectedSubmission(submission)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon="file-text"
              title="אין נתונים"
              description="לא נרשמו נתוני ניטור בתאריך זה"
            />
          )}
        </div>
      )}

      {/* Submission Detail Modal */}
      {selectedSubmission && (
        <SubmissionDetailModal
          submission={selectedSubmission}
          questions={questions || []}
          onClose={() => setSelectedSubmission(null)}
        />
      )}
    </div>
  );
}

interface SubmissionCardProps {
  submission: GlobeMonitorSubmission;
  questions: GlobeMonitorQuestion[];
  onViewDetails: () => void;
}

function SubmissionCard({ submission, questions, onViewDetails }: SubmissionCardProps) {
  // Find common fields for summary display
  const timeQuestion = questions.find((q) => q.type === "time");
  const tempQuestion = questions.find((q) => q.label.includes("טמפרטורה"));
  const humidityQuestion = questions.find((q) => q.label.includes("לחות"));
  const cloudQuestion = questions.find((q) => q.label.includes("עננות"));

  const time = timeQuestion ? submission.answers[timeQuestion.id] : null;
  const temp = tempQuestion ? submission.answers[tempQuestion.id] : null;
  const humidity = humidityQuestion ? submission.answers[humidityQuestion.id] : null;
  const clouds = cloudQuestion ? submission.answers[cloudQuestion.id] : null;

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="space-y-2">
        {time && (
          <div className="flex items-center gap-2 text-sm">
            <Clock size={14} className="text-gray-400" />
            <span>{time}</span>
          </div>
        )}
        {temp !== null && temp !== undefined && (
          <div className="flex items-center gap-2 text-sm">
            <Thermometer size={14} className="text-error" />
            <span>{temp}°C</span>
          </div>
        )}
        {humidity !== null && humidity !== undefined && (
          <div className="flex items-center gap-2 text-sm">
            <Droplets size={14} className="text-primary" />
            <span>{humidity}%</span>
          </div>
        )}
        {clouds && (
          <div className="flex items-center gap-2 text-sm">
            <Cloud size={14} className="text-gray-400" />
            <span className="truncate">
              {Array.isArray(clouds) ? clouds.join(", ") : clouds}
            </span>
          </div>
        )}
      </div>
      <button
        onClick={onViewDetails}
        className="mt-3 w-full flex items-center justify-center gap-2 text-sm text-primary hover:bg-primary/10 py-2 rounded-lg transition-colors cursor-pointer"
      >
        <Eye size={16} />
        צפה בפרטים
      </button>
    </Card>
  );
}

interface SubmissionDetailModalProps {
  submission: GlobeMonitorSubmission;
  questions: GlobeMonitorQuestion[];
  onClose: () => void;
}

function SubmissionDetailModal({
  submission,
  questions,
  onClose,
}: SubmissionDetailModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <Card className="w-full max-w-md max-h-[80vh] overflow-y-auto animate-scale-in">
        {/* Header */}
        <div className="sticky top-0 bg-surface-0 p-4 border-b border-surface-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/bg/globe.jpg"
              alt="Globe"
              width={40}
              height={40}
              className="rounded-full"
            />
            <div>
              <h3 className="font-rubik font-semibold">פרטי ניטור</h3>
              <p className="text-xs text-gray-500">
                {formatHebrewDate(submission.date)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-surface-2 rounded-lg transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {questions
            .sort((a, b) => a.order - b.order)
            .map((question) => {
              const answer = submission.answers[question.id];
              if (answer === undefined || answer === null || answer === "") return null;

              return (
                <div key={question.id} className="border-b border-surface-2 pb-3 last:border-0">
                  <p className="text-sm text-gray-500 mb-1">{question.label}</p>
                  <p className="font-medium">
                    {Array.isArray(answer) ? answer.join(", ") : answer}
                    {question.unit && ` ${question.unit}`}
                  </p>
                </div>
              );
            })}

          <div className="pt-2 text-xs text-gray-400">
            נרשם על ידי: {submission.submittedByName}
          </div>
        </div>
      </Card>
    </div>
  );
}

function formatHebrewDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  return `${day} ב${HEBREW_MONTHS[month - 1]} ${year}`;
}
