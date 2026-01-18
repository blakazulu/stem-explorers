"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import {
  useGlobeMonitorQuestions,
  useSeedDefaultQuestions,
  useDeleteGlobeMonitorQuestion,
} from "@/lib/queries";
import { useToastActions } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  Globe,
  Plus,
  Edit2,
  Trash2,
  Hash,
  Type,
  Calendar,
  Clock,
  List,
  CheckSquare,
  AlertCircle,
} from "lucide-react";
import type { GlobeMonitorQuestion, GlobeMonitorQuestionType } from "@/types";

const questionTypeIcons: Record<GlobeMonitorQuestionType, typeof Type> = {
  text: Type,
  number: Hash,
  date: Calendar,
  time: Clock,
  single: List,
  multi: CheckSquare,
};

const questionTypeLabels: Record<GlobeMonitorQuestionType, string> = {
  text: "טקסט חופשי",
  number: "מספר",
  date: "תאריך",
  time: "שעה",
  single: "בחירה בודדת",
  multi: "בחירה מרובה",
};

export default function AdminQuestionList() {
  const { session } = useAuth();
  const router = useRouter();
  const toast = useToastActions();

  const { data: questions, isLoading } = useGlobeMonitorQuestions();
  const seedMutation = useSeedDefaultQuestions();
  const deleteMutation = useDeleteGlobeMonitorQuestion();

  const [deleteQuestionId, setDeleteQuestionId] = useState<string | null>(null);
  const [hasSeeded, setHasSeeded] = useState(false);

  const isAdmin = session?.user.role === "admin";

  // Redirect non-admins
  useEffect(() => {
    if (session && !isAdmin) {
      router.replace(`/${session.user.role}/globe-monitor`);
    }
  }, [session, isAdmin, router]);

  // Auto-seed default questions on first visit
  useEffect(() => {
    if (!isLoading && questions && questions.length === 0 && !hasSeeded && !seedMutation.isPending) {
      setHasSeeded(true);
      seedMutation.mutate(undefined, {
        onSuccess: () => {
          toast.success("שאלות ברירת מחדל נוצרו");
        },
        onError: () => {
          toast.error("שגיאה ביצירת שאלות ברירת מחדל");
        },
      });
    }
  }, [isLoading, questions, hasSeeded, seedMutation, toast]);

  const handleDelete = () => {
    if (!deleteQuestionId) return;
    deleteMutation.mutate(deleteQuestionId, {
      onSuccess: () => {
        toast.success("השאלה נמחקה");
        setDeleteQuestionId(null);
      },
      onError: () => {
        toast.error("שגיאה במחיקת השאלה");
      },
    });
  };

  if (!isAdmin) return null;

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
            <Globe className="text-role-admin" size={28} />
            גלוב-ניטורר
          </h1>
          <p className="text-sm text-gray-500 mt-1">ניהול שאלות הניטור</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end">
        <Link href={`/${session?.user.role}/globe-monitor/questions/new`}>
          <Button rightIcon={Plus}>הוסף שאלה חדשה</Button>
        </Link>
      </div>

      {/* Questions List */}
      {isLoading || seedMutation.isPending ? (
        <div className="space-y-3">
          <Skeleton variant="card" height={80} />
          <Skeleton variant="card" height={80} />
          <Skeleton variant="card" height={80} />
        </div>
      ) : questions && questions.length > 0 ? (
        <div className="space-y-3">
          {questions
            .sort((a, b) => a.order - b.order)
            .map((question) => (
              <QuestionCard
                key={question.id}
                question={question}
                onEdit={() =>
                  router.push(
                    `/${session?.user.role}/globe-monitor/questions/${question.id}`
                  )
                }
                onDelete={() => setDeleteQuestionId(question.id)}
                isDeleting={deleteMutation.isPending && deleteQuestionId === question.id}
              />
            ))}
        </div>
      ) : (
        <EmptyState
          icon={AlertCircle}
          title="אין שאלות"
          description="לא נמצאו שאלות. הוסף שאלה חדשה להתחיל."
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteQuestionId !== null}
        title="מחיקת שאלה"
        message="האם אתה בטוח שברצונך למחוק שאלה זו? פעולה זו לא ניתנת לביטול."
        confirmLabel="מחק"
        onConfirm={handleDelete}
        onCancel={() => setDeleteQuestionId(null)}
        variant="danger"
      />
    </div>
  );
}

interface QuestionCardProps {
  question: GlobeMonitorQuestion;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}

function QuestionCard({ question, onEdit, onDelete, isDeleting }: QuestionCardProps) {
  const TypeIcon = questionTypeIcons[question.type];
  const typeLabel = questionTypeLabels[question.type];

  return (
    <Card className="p-4">
      <div className="flex items-start gap-4">
        {/* Order Badge */}
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-surface-2 text-sm font-medium text-gray-500 shrink-0">
          {question.order + 1}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <TypeIcon size={16} className="text-primary" />
            <span className="text-xs text-gray-500">{typeLabel}</span>
            {question.required && (
              <span className="text-xs bg-error/10 text-error px-2 py-0.5 rounded">
                חובה
              </span>
            )}
            {question.unit && (
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                {question.unit}
              </span>
            )}
          </div>
          <p className="font-medium text-foreground">{question.label}</p>
          {question.description && (
            <p className="text-sm text-gray-500 mt-1">{question.description}</p>
          )}
          {question.options && question.options.length > 0 && (
            <p className="text-xs text-gray-400 mt-2">
              אפשרויות: {question.options.join(" • ")}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-1 shrink-0">
          <button
            onClick={onEdit}
            className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
            title="ערוך"
          >
            <Edit2 size={18} />
          </button>
          <button
            onClick={onDelete}
            disabled={isDeleting}
            className="p-2 text-gray-400 hover:text-error hover:bg-error/10 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            title="מחק"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </Card>
  );
}
