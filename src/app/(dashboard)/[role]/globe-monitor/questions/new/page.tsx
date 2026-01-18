"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { useGlobeMonitorQuestions, useCreateGlobeMonitorQuestion } from "@/lib/queries";
import { useToastActions } from "@/components/ui/Toast";
import QuestionForm from "../../components/QuestionForm";
import { Globe, ArrowRight } from "lucide-react";
import type { UserRole } from "@/types";

export default function NewQuestionPage() {
  const { session } = useAuth();
  const router = useRouter();
  const params = useParams();
  const toast = useToastActions();
  const role = params.role as UserRole;

  const { data: questions } = useGlobeMonitorQuestions();
  const createMutation = useCreateGlobeMonitorQuestion();

  const isAdmin = session?.user.role === "admin";
  const backUrl = `/${role}/globe-monitor`;

  // Redirect non-admins
  useEffect(() => {
    if (session && !isAdmin) {
      router.replace(`/${session.user.role}/globe-monitor`);
    }
  }, [session, isAdmin, router]);

  const handleSubmit = (data: Parameters<typeof createMutation.mutate>[0]) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        toast.success("השאלה נוצרה בהצלחה");
        router.push(backUrl);
      },
      onError: () => {
        toast.error("שגיאה ביצירת השאלה");
      },
    });
  };

  if (!isAdmin) return null;

  const nextOrder = questions ? Math.max(...questions.map((q) => q.order), -1) + 1 : 0;

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
            שאלה חדשה
          </h1>
          <p className="text-sm text-gray-500">הוסף שאלה חדשה לטופס הניטור</p>
        </div>
      </div>

      {/* Form */}
      <QuestionForm
        onSubmit={handleSubmit}
        onCancel={() => router.push(backUrl)}
        isSubmitting={createMutation.isPending}
        nextOrder={nextOrder}
      />
    </div>
  );
}
