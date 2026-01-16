"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { getUnit, deleteUnit } from "@/lib/services/units";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { useToastActions } from "@/components/ui/Toast";
import { DocumentViewer } from "@/components/ui/DocumentViewer";
import {
  FileText,
  BookOpen,
  Edit2,
  Trash2,
  ArrowRight,
  X,
} from "lucide-react";
import type { Unit, Grade, UserRole } from "@/types";

type FileModalType = "intro" | "unit" | null;

const VALID_GRADES: Grade[] = ["א", "ב", "ג", "ד", "ה", "ו"];

export default function UnitDetailPage() {
  const { session } = useAuth();
  const params = useParams();
  const router = useRouter();
  const toast = useToastActions();

  const role = params.role as UserRole;
  const grade = decodeURIComponent(params.grade as string) as Grade;
  const unitId = params.unitId as string;

  const [unit, setUnit] = useState<Unit | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activeFileModal, setActiveFileModal] = useState<FileModalType>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const fileModalRef = useRef<HTMLDialogElement>(null);
  const lightboxRef = useRef<HTMLDialogElement>(null);

  const isAdmin = session?.user.role === "admin";
  const canManage = isAdmin;
  const backUrl = `/${role}/work-plans/${encodeURIComponent(grade)}`;

  useEffect(() => {
    if (!VALID_GRADES.includes(grade)) {
      router.replace(`/${role}/work-plans`);
      return;
    }

    async function loadUnit() {
      setLoading(true);
      try {
        const data = await getUnit(unitId);
        if (!data) {
          toast.error("שגיאה", "היחידה לא נמצאה");
          router.replace(backUrl);
          return;
        }
        setUnit(data);
      } catch {
        toast.error("שגיאה", "שגיאה בטעינת היחידה");
        router.replace(backUrl);
      }
      setLoading(false);
    }

    loadUnit();
  }, [grade, unitId, role, router, backUrl, toast]);

  useEffect(() => {
    const modal = fileModalRef.current;
    if (!modal) return;

    if (activeFileModal) {
      modal.showModal();
    } else {
      modal.close();
    }
  }, [activeFileModal]);

  useEffect(() => {
    const modal = lightboxRef.current;
    if (!modal) return;

    if (lightboxImage) {
      modal.showModal();
    } else {
      modal.close();
    }
  }, [lightboxImage]);

  const getActiveFileUrl = () => {
    if (!unit) return null;
    return activeFileModal === "intro" ? unit.introFileUrl : unit.unitFileUrl;
  };

  const getActiveFileTitle = () => {
    return activeFileModal === "intro" ? "מבוא ליחידה" : "תוכן היחידה";
  };

  const isImageUrl = (url: string) => {
    return /\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(url);
  };

  async function handleDelete() {
    if (!unit) return;
    try {
      await deleteUnit(unit.id);
      toast.success("נמחק", "היחידה נמחקה בהצלחה");
      router.replace(backUrl);
    } catch {
      toast.error("שגיאה", "שגיאה במחיקת היחידה");
    }
    setShowDeleteConfirm(false);
  }

  if (!VALID_GRADES.includes(grade)) {
    return null;
  }

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-surface-2 rounded-lg animate-pulse" />
          <div className="space-y-2">
            <div className="h-7 w-48 bg-surface-2 rounded animate-pulse" />
            <div className="h-5 w-32 bg-surface-2 rounded animate-pulse" />
          </div>
        </div>
        <SkeletonCard />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  if (!unit) {
    return null;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={backUrl}
            className="p-2 hover:bg-surface-2 rounded-lg transition-colors cursor-pointer"
            title="חזרה לרשימת היחידות"
          >
            <ArrowRight size={20} className="text-gray-500" />
          </Link>
          <div className="p-3 bg-primary/10 rounded-xl">
            <BookOpen size={24} className="text-primary" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-rubik font-bold text-foreground">
              {unit.name}
            </h1>
            <p className="text-sm text-gray-500">
              כיתה {grade}
              {canManage && ` • סדר: ${unit.order}`}
            </p>
          </div>
        </div>
      </div>

      {/* Unit Files */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {unit.introFileUrl && (
          <button
            onClick={() => setActiveFileModal("intro")}
            className="block text-right w-full"
          >
            <Card interactive className="h-full">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-secondary/10 rounded-xl">
                  <BookOpen size={24} className="text-secondary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-rubik font-semibold text-foreground">
                    מבוא ליחידה
                  </h3>
                  <p className="text-sm text-gray-500">רקע והקדמה לנושא</p>
                </div>
              </div>
            </Card>
          </button>
        )}
        {unit.unitFileUrl && (
          <button
            onClick={() => setActiveFileModal("unit")}
            className="block text-right w-full"
          >
            <Card interactive className="h-full">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <FileText size={24} className="text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-rubik font-semibold text-foreground">
                    תוכן היחידה
                  </h3>
                  <p className="text-sm text-gray-500">חומר הלימוד המלא</p>
                </div>
              </div>
            </Card>
          </button>
        )}
      </div>

      {/* No files available */}
      {!unit.introFileUrl && !unit.unitFileUrl && (
        <Card variant="outlined" className="bg-surface-1/50 text-center py-8">
          <div className="p-3 bg-gray-100 rounded-xl w-fit mx-auto mb-3">
            <FileText size={24} className="text-gray-400" />
          </div>
          <p className="text-gray-500">אין קבצים זמינים ליחידה זו</p>
        </Card>
      )}

      {/* Admin Actions */}
      {canManage && (
        <div className="flex gap-3 pt-2">
          <Link
            href={`/${role}/work-plans/${encodeURIComponent(grade)}/${unit.id}/edit`}
            className="flex-1"
          >
            <Button variant="outline" className="w-full" rightIcon={Edit2}>
              עריכת יחידה
            </Button>
          </Link>
          <Button
            variant="destructive"
            onClick={() => setShowDeleteConfirm(true)}
            rightIcon={Trash2}
          >
            מחיקה
          </Button>
        </div>
      )}

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="מחיקת יחידה"
        message="האם אתה בטוח שברצונך למחוק יחידה זו? כל התוכן המשויך ימחק גם כן."
        confirmLabel="מחק"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      {/* File Viewer Modal */}
      {activeFileModal && (
        <dialog
          ref={fileModalRef}
          className="fixed inset-0 m-auto z-50 rounded-2xl p-0 backdrop:bg-black/50 backdrop:animate-fade-in max-w-4xl w-[95vw] max-h-[90vh] shadow-2xl animate-scale-in border-0 overflow-hidden"
          onClose={() => setActiveFileModal(null)}
        >
          <div className="flex flex-col h-full max-h-[90vh]" dir="rtl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-surface-2 bg-surface-1">
              <h2 className="text-xl font-rubik font-bold text-foreground">
                {getActiveFileTitle()}
              </h2>
              <button
                onClick={() => setActiveFileModal(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-surface-2 rounded-lg transition-all duration-200 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-hidden">
              {(() => {
                const fileUrl = getActiveFileUrl();
                if (!fileUrl) return null;

                if (isImageUrl(fileUrl)) {
                  // Image - show full size, clickable for lightbox
                  return (
                    <button
                      onClick={() => setLightboxImage(fileUrl)}
                      className="w-full h-full flex items-center justify-center p-4 cursor-zoom-in"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={fileUrl}
                        alt={getActiveFileTitle()}
                        className="max-w-full max-h-[75vh] object-contain rounded-lg"
                      />
                    </button>
                  );
                }

                // Document - show embedded viewer
                return (
                  <DocumentViewer
                    url={fileUrl}
                    fileName={getActiveFileTitle()}
                    className="h-full"
                  />
                );
              })()}
            </div>
          </div>
        </dialog>
      )}

      {/* Image Lightbox */}
      {lightboxImage && (
        <dialog
          ref={lightboxRef}
          className="fixed inset-0 m-auto z-[60] p-0 bg-transparent backdrop:bg-black/90 max-w-[95vw] max-h-[95vh] border-0"
          onClick={() => setLightboxImage(null)}
          onClose={() => setLightboxImage(null)}
        >
          <div className="relative flex items-center justify-center min-h-[50vh]">
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-2 left-2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors cursor-pointer z-10"
            >
              <X size={24} />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lightboxImage}
              alt="תצוגה מוגדלת"
              className="max-w-[95vw] max-h-[95vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </dialog>
      )}
    </div>
  );
}
