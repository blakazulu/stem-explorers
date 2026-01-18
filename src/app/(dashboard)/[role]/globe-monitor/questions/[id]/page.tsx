"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { useGlobeMonitorQuestion, useUpdateGlobeMonitorQuestion } from "@/lib/queries";
import { useToastActions } from "@/components/ui/Toast";
import { Skeleton } from "@/components/ui/Skeleton";
import QuestionForm from "../../components/QuestionForm";
import { Globe, ArrowRight } from "lucide-react";
import type { UserRole } from "@/types";

export default function EditQuestionPage() {
  const { session } = useAuth();
  const router = useRouter();
  const params = useParams();
  const toast = useToastActions();
  const role = params.role as UserRole;
  const questionId = params.id as string;

  const { data: question, isLoading } = useGlobeMonitorQuestion(questionId);
  const updateMutation = useUpdateGlobeMonitorQuestion();

  const isAdmin = session?.user.role === "admin";
  const backUrl = `/${role}/globe-monitor`;

  // Redirect non-admins
  useEffect(() => {
    if (session && !isAdmin) {
      router.replace(`/${session.user.role}/globe-monitor`);
    }
  }, [session, isAdmin, router]);

  // Redirect if question not found
  useEffect(() => {
    if (!isLoading && !question) {
      router.replace(backUrl);
    }
  }, [isLoading, question, backUrl, router]);

  const handleSubmit = (data: Parameters<typeof updateMutation.mutate>[0]["data"]) => {
    updateMutation.mutate(
      { id: questionId, data },
      {
        onSuccess: () => {
          toast.success("השאלה עודכנה בהצלחה");
          router.push(backUrl);
        },
        onError: () => {
          toast.error("שגיאה בעדכון השאלה");
        },
      }
    );
  };

  if (!isAdmin) return null;

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-2xl">
        <Skeleton variant="text" width={200} height={32} />
        <Skeleton variant="card" height={400} />
      </div>
    );
  }

  if (!question) return null;

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href={backUrl}
          className="p-2 hover:bg-surface-2 rounded-lg transition-colors cursor-pointer"
          title="חזרה"
        >
          <ArrowRight size={20} className="text-gray-500" />
        </Link>
        <Image
          src="/bg/globe.jpg"
          alt="Globe Monitor"
          width={48}
          height={48}
          className="rounded-full"
        />
        <div>
          <h1 className="text-xl font-rubik font-bold text-foreground flex items-center gap-2">
            <Globe className="text-role-admin" size={24} />
            עריכת שאלה
          </h1>
          <p className="text-sm text-gray-500">{question.label}</p>
        </div>
      </div>

      {/* Form */}
      <QuestionForm
        initialData={question}
        onSubmit={handleSubmit}
        onCancel={() => router.push(backUrl)}
        isSubmitting={updateMutation.isPending}
        nextOrder={question.order}
      />
    </div>
  );
}
