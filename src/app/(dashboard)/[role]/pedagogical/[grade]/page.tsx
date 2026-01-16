"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { UnitTreeView } from "@/components/pedagogical/UnitTreeView";
import { Button } from "@/components/ui/Button";
import { useToastActions } from "@/components/ui/Toast";
import { getPedagogicalIntro, savePedagogicalIntro } from "@/lib/services/settings";
import { Lightbulb, ArrowRight, Users, Calendar, Clock, Pencil, Check, X, BookOpen } from "lucide-react";
import type { Grade, UserRole } from "@/types";

const VALID_GRADES: Grade[] = ["א", "ב", "ג", "ד", "ה", "ו"];
const DEFAULT_INTRO = "ברוכים הבאים למרחב הלמידה. כאן תוכלו למצוא את כל המידע על המודל הפדגוגי, יחידות הלימוד, וכלים נוספים לתמיכה בתהליך הלמידה.";

export default function PedagogicalGradePage() {
  const { session } = useAuth();
  const params = useParams();
  const router = useRouter();
  const toast = useToastActions();
  const modalRef = useRef<HTMLDialogElement>(null);

  const role = params.role as UserRole;
  const grade = decodeURIComponent(params.grade as string) as Grade;

  const isAdmin = session?.user.role === "admin";
  const isTeacherOrAdmin =
    session?.user.role === "teacher" || session?.user.role === "admin";
  const showBackButton = isAdmin;

  const [introText, setIntroText] = useState<string>(DEFAULT_INTRO);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState("");
  const [saving, setSaving] = useState(false);
  const [showPedagogicalModal, setShowPedagogicalModal] = useState(false);

  useEffect(() => {
    if (!VALID_GRADES.includes(grade)) {
      router.replace(`/${role}/pedagogical`);
      return;
    }

    async function loadIntro() {
      const text = await getPedagogicalIntro(grade);
      if (text) {
        setIntroText(text);
      }
    }
    loadIntro();
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

  const handleStartEdit = () => {
    setEditText(introText);
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
        {isEditing ? (
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
        <Button
          variant="outline"
          className="h-24 flex-col gap-2"
          onClick={() => setShowPedagogicalModal(true)}
        >
          <BookOpen size={24} />
          <span>מודל פדגוגי</span>
        </Button>
        <Button
          variant="outline"
          className="h-24 flex-col gap-2"
          onClick={() => {/* TODO: Handle צוות מו"פ */}}
        >
          <Users size={24} />
          <span>צוות מו&quot;פ</span>
        </Button>
        <Button
          variant="outline"
          className="h-24 flex-col gap-2"
          onClick={() => {/* TODO: Handle לוז הדרכה */}}
        >
          <Calendar size={24} />
          <span>לוז הדרכה</span>
        </Button>
        <Button
          variant="outline"
          className="h-24 flex-col gap-2"
          onClick={() => {/* TODO: Handle מערכת שעות */}}
        >
          <Clock size={24} />
          <span>מערכת שעות</span>
        </Button>
      </div>

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
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <UnitTreeView
                grade={grade}
                role={role}
                onAddUnit={
                  isTeacherOrAdmin
                    ? () => {
                        handleCloseModal();
                        router.push(`/${role}/work-plans/${encodeURIComponent(grade)}/new`);
                      }
                    : undefined
                }
              />
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
}
