"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useVisibility } from "@/contexts/VisibilityContext";
import { UnitTreeView } from "@/components/pedagogical/UnitTreeView";
import { StaffGrid } from "@/components/staff";
import { Button } from "@/components/ui/Button";
import { useToastActions } from "@/components/ui/Toast";
import {
  getPedagogicalIntro,
  savePedagogicalIntro,
  getResourceFile,
  saveResourceFile,
  deleteResourceFile,
  type ResourceFile,
  type ResourceType,
} from "@/lib/services/settings";
import { uploadResourceFile, isValidResourceFile, deleteStorageFile } from "@/lib/utils/imageUpload";
import { DocumentViewer } from "@/components/ui/DocumentViewer";
import {
  Lightbulb,
  ArrowRight,
  Users,
  Calendar,
  Clock,
  Pencil,
  Check,
  X,
  BookOpen,
  Upload,
  Trash2,
  FileText,
} from "lucide-react";
import type { Grade, UserRole } from "@/types";

const VALID_GRADES: Grade[] = ["א", "ב", "ג", "ד", "ה", "ו"];
const DEFAULT_INTRO = "ברוכים הבאים למרחב הלמידה. כאן תוכלו למצוא את כל המידע על המודל הפדגוגי, יחידות הלימוד, וכלים נוספים לתמיכה בתהליך הלמידה.";
const ACCEPTED_FILE_TYPES = ".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp";

export default function PedagogicalGradePage() {
  const { session } = useAuth();
  const { getPageElements } = useVisibility();
  const params = useParams();
  const router = useRouter();
  const toast = useToastActions();
  const modalRef = useRef<HTMLDialogElement>(null);

  const role = params.role as UserRole;
  const grade = decodeURIComponent(params.grade as string) as Grade;

  const isAdmin = session?.user.role === "admin";
  const pageElements = getPageElements(session?.user.role || "student");
  const isTeacherOrAdmin =
    session?.user.role === "teacher" || session?.user.role === "admin";
  const showBackButton = isAdmin;

  const [introText, setIntroText] = useState<string | null>(null);
  const [introLoading, setIntroLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState("");
  const [saving, setSaving] = useState(false);
  const [showPedagogicalModal, setShowPedagogicalModal] = useState(false);

  // Resource file state
  const [trainingSchedule, setTrainingSchedule] = useState<ResourceFile | null>(null);
  const [timetable, setTimetable] = useState<ResourceFile | null>(null);
  const [activeResourceModal, setActiveResourceModal] = useState<ResourceType | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [showStaffModal, setShowStaffModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resourceModalRef = useRef<HTMLDialogElement>(null);
  const lightboxRef = useRef<HTMLDialogElement>(null);
  const staffModalRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (!VALID_GRADES.includes(grade)) {
      router.replace(`/${role}/pedagogical`);
      return;
    }

    async function loadData() {
      setIntroLoading(true);
      const [introData, trainingData, timetableData] = await Promise.all([
        getPedagogicalIntro(grade),
        getResourceFile(grade, "training-schedule"),
        getResourceFile(grade, "timetable"),
      ]);
      setIntroText(introData || DEFAULT_INTRO);
      setTrainingSchedule(trainingData);
      setTimetable(timetableData);
      setIntroLoading(false);
    }
    loadData();
  }, [grade, role, router]);

  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;

    if (showPedagogicalModal) {
      modal.showModal();
    } else {
      modal.close();
    }
  }, [showPedagogicalModal]);

  useEffect(() => {
    const modal = resourceModalRef.current;
    if (!modal) return;

    if (activeResourceModal) {
      modal.showModal();
    } else {
      modal.close();
    }
  }, [activeResourceModal]);

  useEffect(() => {
    const modal = lightboxRef.current;
    if (!modal) return;

    if (lightboxImage) {
      modal.showModal();
    } else {
      modal.close();
    }
  }, [lightboxImage]);

  useEffect(() => {
    const modal = staffModalRef.current;
    if (!modal) return;

    if (showStaffModal) {
      modal.showModal();
    } else {
      modal.close();
    }
  }, [showStaffModal]);

  const getResourceData = (type: ResourceType) => {
    return type === "training-schedule" ? trainingSchedule : timetable;
  };

  const getResourceTitle = (type: ResourceType) => {
    return type === "training-schedule" ? "לוז הדרכה" : "מערכת שעות";
  };

  const handleOpenResourceModal = (type: ResourceType) => {
    setActiveResourceModal(type);
  };

  const handleCloseResourceModal = () => {
    setActiveResourceModal(null);
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Capture activeResourceModal to prevent race condition during async operation
    const resourceType = activeResourceModal;
    if (!file || !resourceType) return;

    if (!isValidResourceFile(file)) {
      toast.error("שגיאה", "סוג קובץ לא נתמך. יש להעלות PDF, Word או תמונה");
      return;
    }

    setUploading(true);
    try {
      const timestamp = Date.now();
      const path = `resources/${grade}/${resourceType}/${timestamp}-${file.name}`;
      const url = await uploadResourceFile(file, path);

      const resourceFile: ResourceFile = {
        url,
        fileName: file.name,
        fileType: file.type,
        uploadedAt: new Date(),
      };

      await saveResourceFile(grade, resourceType, resourceFile);

      if (resourceType === "training-schedule") {
        setTrainingSchedule(resourceFile);
      } else {
        setTimetable(resourceFile);
      }

      toast.success("הועלה בהצלחה", "הקובץ נשמר");
    } catch {
      toast.error("שגיאה", "לא הצלחנו להעלות את הקובץ");
    }
    setUploading(false);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDeleteResource = async () => {
    // Capture activeResourceModal to prevent race condition during async operation
    const resourceType = activeResourceModal;
    if (!resourceType) return;

    const resource = getResourceData(resourceType);
    if (!resource) return;

    setDeleting(true);
    try {
      // Extract storage path from URL and delete from storage
      try {
        const urlObj = new URL(resource.url);
        const pathMatch = urlObj.pathname.match(/o\/(.+?)\?/);
        if (pathMatch) {
          const storagePath = decodeURIComponent(pathMatch[1]);
          await deleteStorageFile(storagePath);
        }
      } catch {
        // Storage deletion failed, continue with Firestore deletion
      }

      await deleteResourceFile(grade, resourceType);

      if (resourceType === "training-schedule") {
        setTrainingSchedule(null);
      } else {
        setTimetable(null);
      }

      toast.success("נמחק", "הקובץ הוסר בהצלחה");
    } catch {
      toast.error("שגיאה", "לא הצלחנו למחוק את הקובץ");
    }
    setDeleting(false);
  };

  const isImageType = (fileType: string) => {
    return fileType.startsWith("image/");
  };

  const handleStartEdit = () => {
    setEditText(introText || DEFAULT_INTRO);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditText("");
  };

  const handleSaveEdit = async () => {
    if (!editText.trim()) {
      toast.error("שגיאה", "הטקסט לא יכול להיות ריק");
      return;
    }

    setSaving(true);
    try {
      await savePedagogicalIntro(grade, editText.trim());
      setIntroText(editText.trim());
      setIsEditing(false);
      toast.success("נשמר", "הטקסט עודכן בהצלחה");
    } catch {
      toast.error("שגיאה", "לא הצלחנו לשמור את הטקסט");
    }
    setSaving(false);
  };

  const handleCloseModal = () => {
    setShowPedagogicalModal(false);
  };

  if (!VALID_GRADES.includes(grade)) {
    return null;
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        {showBackButton && (
          <Link
            href={`/${role}/pedagogical`}
            className="p-2 hover:bg-surface-2 rounded-lg transition-colors cursor-pointer"
            title="חזרה לבחירת כיתה"
          >
            <ArrowRight size={20} className="text-gray-500" />
          </Link>
        )}
        <div className="p-3 bg-accent/10 rounded-xl">
          <Lightbulb size={24} className="text-accent" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-rubik font-bold text-foreground">
            מודל פדגוגי ומו&quot;פ - כיתה {grade}
          </h1>
          <p className="text-sm text-gray-500">מסע הלמידה שלנו ביחידות השונות</p>
        </div>
      </div>

      {/* Intro Section */}
      <div className="p-6 bg-surface-1 rounded-2xl border border-surface-2">
        {introLoading ? (
          <div className="space-y-2 animate-pulse">
            <div className="h-4 bg-surface-2 rounded w-full" />
            <div className="h-4 bg-surface-2 rounded w-5/6" />
            <div className="h-4 bg-surface-2 rounded w-4/6" />
          </div>
        ) : isEditing ? (
          <div className="space-y-3">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value.slice(0, 300))}
              className="w-full p-3 rounded-lg border border-surface-3 bg-surface-0 text-foreground leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
              rows={4}
              maxLength={300}
              autoFocus
            />
            <div className="flex items-center justify-between">
              <span className={`text-xs ${editText.length >= 280 ? 'text-amber-500' : 'text-gray-400'}`}>
                {editText.length}/300
              </span>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelEdit}
                  disabled={saving}
                  rightIcon={X}
                >
                  ביטול
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveEdit}
                  loading={saving}
                  rightIcon={Check}
                >
                  שמור
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3">
            <p className="text-foreground leading-relaxed flex-1">
              {introText}
            </p>
            {isAdmin && (
              <button
                onClick={handleStartEdit}
                className="p-2 hover:bg-surface-2 rounded-lg transition-colors text-gray-400 hover:text-foreground"
                title="עריכת טקסט"
              >
                <Pencil size={16} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons - 2x2 Grid */}
      <div className="grid grid-cols-2 gap-4">
        {pageElements.pedagogical.unitCards && (
          <Button
            variant="outline"
            className="h-24 flex-col gap-2"
            onClick={() => setShowPedagogicalModal(true)}
          >
            <BookOpen size={24} />
            <span>מודל פדגוגי</span>
          </Button>
        )}
        <Button
          variant="outline"
          className="h-24 flex-col gap-2"
          onClick={() => setShowStaffModal(true)}
        >
          <Users size={24} />
          <span>צוות מו&quot;פ</span>
        </Button>
        <Button
          variant="outline"
          className="h-24 flex-col gap-2"
          onClick={() => handleOpenResourceModal("training-schedule")}
        >
          <Calendar size={24} />
          <span>לוז הדרכה</span>
          {trainingSchedule && <span className="text-xs text-green-500">קובץ קיים</span>}
        </Button>
        <Button
          variant="outline"
          className="h-24 flex-col gap-2"
          onClick={() => handleOpenResourceModal("timetable")}
        >
          <Clock size={24} />
          <span>מערכת שעות</span>
          {timetable && <span className="text-xs text-green-500">קובץ קיים</span>}
        </Button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_FILE_TYPES}
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Pedagogical Model Modal */}
      {showPedagogicalModal && (
        <dialog
          ref={modalRef}
          className="fixed inset-0 m-auto z-50 rounded-2xl p-0 backdrop:bg-black/50 backdrop:animate-fade-in max-w-4xl w-[95vw] max-h-[90vh] shadow-2xl animate-scale-in border-0 overflow-hidden"
          onClose={handleCloseModal}
        >
          <div className="flex flex-col h-full max-h-[90vh]" dir="rtl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-surface-2 bg-surface-1">
              <h2 className="text-xl font-rubik font-bold text-foreground">
                מודל פדגוגי - כיתה {grade}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-surface-2 rounded-lg transition-all duration-200 cursor-pointer"
                aria-label="סגור חלון"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <UnitTreeView
                grade={grade}
                role={role}
                showDetails={pageElements.pedagogical.unitDetails}
                onAddUnit={
                  isTeacherOrAdmin
                    ? () => {
                        handleCloseModal();
                        router.push(`/${role}/teaching-resources/${encodeURIComponent(grade)}/curricula/new`);
                      }
                    : undefined
                }
              />
            </div>
          </div>
        </dialog>
      )}

      {/* Resource File Modal */}
      {activeResourceModal && (
        <dialog
          ref={resourceModalRef}
          className="fixed inset-0 m-auto z-50 rounded-2xl p-0 backdrop:bg-black/50 backdrop:animate-fade-in max-w-2xl w-[95vw] max-h-[90vh] shadow-2xl animate-scale-in border-0 overflow-hidden"
          onClose={handleCloseResourceModal}
        >
          <div className="flex flex-col h-full max-h-[90vh]" dir="rtl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-surface-2 bg-surface-1">
              <h2 className="text-xl font-rubik font-bold text-foreground">
                {getResourceTitle(activeResourceModal)} - כיתה {grade}
              </h2>
              <button
                onClick={handleCloseResourceModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-surface-2 rounded-lg transition-all duration-200 cursor-pointer"
                aria-label="סגור חלון"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-hidden">
              {(() => {
                const resource = getResourceData(activeResourceModal);

                if (!resource) {
                  // No file uploaded
                  return (
                    <div className="text-center py-12 px-6">
                      <div className="w-16 h-16 mx-auto mb-4 bg-surface-2 rounded-full flex items-center justify-center">
                        <FileText size={32} className="text-gray-400" />
                      </div>
                      <p className="text-gray-500 mb-6">לא הועלה קובץ עדיין</p>
                      {isAdmin && (
                        <Button onClick={handleFileSelect} loading={uploading} rightIcon={Upload}>
                          העלאת קובץ
                        </Button>
                      )}
                      {isAdmin && (
                        <p className="text-xs text-gray-400 mt-4">
                          ניתן להעלות PDF, Word או תמונה
                        </p>
                      )}
                    </div>
                  );
                }

                // File exists - show full content
                if (isImageType(resource.fileType)) {
                  // Image - show full size, clickable for lightbox
                  return (
                    <div className="relative h-full">
                      {/* Admin actions - fixed top left */}
                      {isAdmin && (
                        <div className="absolute top-3 left-3 z-10 flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-white/90 backdrop-blur-sm shadow-lg"
                            onClick={handleFileSelect}
                            loading={uploading}
                            rightIcon={Upload}
                          >
                            החלף
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="shadow-lg"
                            onClick={handleDeleteResource}
                            loading={deleting}
                            rightIcon={Trash2}
                          >
                            מחק
                          </Button>
                        </div>
                      )}
                      <button
                        onClick={() => setLightboxImage(resource.url)}
                        className="w-full h-full flex items-center justify-center p-4 cursor-zoom-in"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={resource.url}
                          alt={resource.fileName}
                          className="max-w-full max-h-[75vh] object-contain rounded-lg"
                        />
                      </button>
                    </div>
                  );
                }

                // Document - show embedded viewer
                return (
                  <div className="relative h-full">
                    {/* Admin actions - fixed top right (download is on left) */}
                    {isAdmin && (
                      <div className="absolute top-3 right-3 z-10 flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-white/90 backdrop-blur-sm shadow-lg"
                          onClick={handleFileSelect}
                          loading={uploading}
                          rightIcon={Upload}
                        >
                          החלף
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="shadow-lg"
                          onClick={handleDeleteResource}
                          loading={deleting}
                          rightIcon={Trash2}
                        >
                          מחק
                        </Button>
                      </div>
                    )}
                    <DocumentViewer
                      url={resource.url}
                      fileName={resource.fileName}
                      className="h-full"
                    />
                  </div>
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
              aria-label="סגור תצוגה מוגדלת"
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

      {/* Staff Modal */}
      {showStaffModal && (
        <dialog
          ref={staffModalRef}
          className="fixed inset-0 m-auto z-50 rounded-2xl p-0 backdrop:bg-black/50 backdrop:animate-fade-in max-w-4xl w-[95vw] max-h-[90vh] shadow-2xl animate-scale-in border-0 overflow-hidden"
          onClose={() => setShowStaffModal(false)}
        >
          <div className="flex flex-col h-full max-h-[90vh]" dir="rtl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-surface-2 bg-surface-1">
              <h2 className="text-xl font-rubik font-bold text-foreground">
                צוות מו&quot;פ - כיתה {grade}
              </h2>
              <button
                onClick={() => setShowStaffModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-surface-2 rounded-lg transition-all duration-200 cursor-pointer"
                aria-label="סגור חלון"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <StaffGrid grade={grade} isAdmin={isAdmin} />
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
}
