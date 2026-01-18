"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useParams, useRouter } from "next/navigation";
import {
  useEmailConfig,
  useSaveEmailConfig,
  useReportConfig,
  useSaveReportConfig,
} from "@/lib/queries";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { SkeletonList } from "@/components/ui/Skeleton";
import {
  Settings,
  Mail,
  FileBarChart,
  Plus,
  X,
  Save,
} from "lucide-react";
import type { EmailConfig, ReportConfig, UserRole } from "@/types";

type Tab = "email" | "report";

const tabConfig: { id: Tab; label: string; icon: typeof Settings }[] = [
  { id: "email", label: "הגדרות מייל", icon: Mail },
  { id: "report", label: "הגדרות דוח", icon: FileBarChart },
];

const REPORT_ELEMENTS = [
  { id: "summary", label: "סיכום כללי", defaultTeacher: true, defaultParent: true },
  { id: "patterns", label: "דפוסים ומגמות", defaultTeacher: true, defaultParent: false },
  { id: "challenges", label: "אתגרים וקשיים", defaultTeacher: true, defaultParent: false },
  { id: "suggestions", label: "המלצות להמשך", defaultTeacher: true, defaultParent: true },
] as const;

export default function SettingsPage() {
  const { session } = useAuth();
  const params = useParams();
  const router = useRouter();
  const role = params.role as UserRole;

  const [activeTab, setActiveTab] = useState<Tab>("email");

  // React Query hooks
  const { data: fetchedEmailConfig, isLoading: emailLoading } = useEmailConfig();
  const { data: fetchedReportConfig, isLoading: reportLoading } = useReportConfig();
  const saveEmailMutation = useSaveEmailConfig();
  const saveReportMutation = useSaveReportConfig();

  const loading = emailLoading || reportLoading;
  const saving = saveEmailMutation.isPending || saveReportMutation.isPending;

  // Local state for form editing
  const [emailConfig, setEmailConfig] = useState<EmailConfig>({
    adminEmails: [],
    frequency: "daily",
    includeContent: true,
  });
  const [newEmail, setNewEmail] = useState("");
  const [reportConfig, setReportConfig] = useState<ReportConfig>({
    elements: REPORT_ELEMENTS.map((el) => ({
      id: el.id,
      label: el.label,
      enabledForTeacher: el.defaultTeacher,
      enabledForParent: el.defaultParent,
    })),
    aiPromptInstructions: "",
  });

  // Redirect non-admin users
  useEffect(() => {
    if (session?.user.role !== "admin") {
      router.push(`/${role}`);
    }
  }, [session, router, role]);

  // Sync fetched data to local state
  useEffect(() => {
    if (fetchedEmailConfig) {
      setEmailConfig(fetchedEmailConfig);
    }
  }, [fetchedEmailConfig]);

  useEffect(() => {
    if (fetchedReportConfig) {
      const mergedElements = REPORT_ELEMENTS.map((el) => {
        const saved = fetchedReportConfig.elements.find((e) => e.id === el.id);
        return saved || {
          id: el.id,
          label: el.label,
          enabledForTeacher: el.defaultTeacher,
          enabledForParent: el.defaultParent,
        };
      });
      setReportConfig({ ...fetchedReportConfig, elements: mergedElements });
    }
  }, [fetchedReportConfig]);

  function handleSaveEmail() {
    saveEmailMutation.mutate(emailConfig);
  }

  function handleSaveReport() {
    saveReportMutation.mutate(reportConfig);
  }

  function addEmail() {
    if (newEmail && !emailConfig.adminEmails.includes(newEmail)) {
      setEmailConfig({
        ...emailConfig,
        adminEmails: [...emailConfig.adminEmails, newEmail],
      });
      setNewEmail("");
    }
  }

  function removeEmail(email: string) {
    setEmailConfig({
      ...emailConfig,
      adminEmails: emailConfig.adminEmails.filter((e) => e !== email),
    });
  }

  function toggleReportElement(id: string, field: "enabledForTeacher" | "enabledForParent") {
    setReportConfig({
      ...reportConfig,
      elements: reportConfig.elements.map((e) =>
        e.id === id ? { ...e, [field]: !e[field] } : e
      ),
    });
  }

  if (session?.user.role !== "admin") {
    return null;
  }

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-role-admin/10 rounded-xl">
            <Settings size={24} className="text-role-admin" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-rubik font-bold text-foreground">
              הגדרות מנהל
            </h1>
          </div>
        </div>
        <SkeletonList count={4} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-role-admin/10 rounded-xl">
          <Settings size={24} className="text-role-admin" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-rubik font-bold text-foreground">
            הגדרות מנהל
          </h1>
          <p className="text-sm text-gray-500">ניהול הגדרות מערכת ותצורה</p>
        </div>
      </div>

      <div className="flex gap-2 p-1 bg-surface-1 rounded-xl overflow-x-auto">
        {tabConfig.map((tab) => {
          const IconComponent = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 cursor-pointer shrink-0 ${isActive
                ? "bg-surface-0 text-role-admin shadow-sm"
                : "text-gray-500 hover:text-foreground hover:bg-surface-0/50"
                }`}
            >
              <IconComponent size={18} />
              <span className="hidden md:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {activeTab === "email" && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center gap-2">
            <Mail size={20} className="text-role-admin" />
            <h2 className="text-lg font-rubik font-semibold text-foreground">
              הגדרות התראות מייל
            </h2>
          </div>

          <Card className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">
                כתובות מייל מנהלים
              </label>
              <div className="flex gap-2 mb-3">
                <Input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="הוסף כתובת מייל"
                  onKeyDown={(e) => e.key === "Enter" && addEmail()}
                />
                <Button onClick={addEmail} rightIcon={Plus}>
                  הוסף
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {emailConfig.adminEmails.map((email) => (
                  <span
                    key={email}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-surface-1 border border-surface-3 rounded-lg text-sm"
                  >
                    <Mail size={12} className="text-gray-400" />
                    {email}
                    <button
                      onClick={() => removeEmail(email)}
                      className="text-gray-400 hover:text-error cursor-pointer transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
                {emailConfig.adminEmails.length === 0 && (
                  <span className="text-sm text-gray-400">
                    לא הוגדרו כתובות מייל
                  </span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                תדירות שליחה
              </label>
              <select
                value={emailConfig.frequency}
                onChange={(e) =>
                  setEmailConfig({
                    ...emailConfig,
                    frequency: e.target.value as "immediate" | "daily",
                  })
                }
                className="w-full p-3 border-2 border-surface-3 rounded-xl bg-surface-0 cursor-pointer transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="immediate">מיידי</option>
                <option value="daily">יומי</option>
              </select>
            </div>

            <label className="flex items-center gap-3 p-3 bg-surface-1 rounded-xl cursor-pointer hover:bg-surface-2 transition-colors">
              <input
                type="checkbox"
                checked={emailConfig.includeContent}
                onChange={(e) =>
                  setEmailConfig({
                    ...emailConfig,
                    includeContent: e.target.checked,
                  })
                }
                className="w-5 h-5 rounded border-2 border-surface-3 text-primary focus:ring-primary"
              />
              <div>
                <span className="text-sm font-medium text-foreground">
                  כלול תוכן מלא בהתראות
                </span>
                <p className="text-xs text-gray-500">
                  שלח את תוכן ההודעות המלא במייל
                </p>
              </div>
            </label>
          </Card>

          <Button
            onClick={handleSaveEmail}
            disabled={saving}
            loading={saving}
            loadingText="שומר..."
            rightIcon={Save}
          >
            שמור שינויים
          </Button>
        </div>
      )}

      {activeTab === "report" && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center gap-2">
            <FileBarChart size={20} className="text-role-admin" />
            <h2 className="text-lg font-rubik font-semibold text-foreground">
              הגדרות דוח AI
            </h2>
          </div>

          <p className="text-sm text-gray-500">
            בחר אילו אלמנטים יופיעו בדוחות למורים ולהורים
          </p>

          <Card className="overflow-hidden">
            <div className="grid grid-cols-[1fr_auto_auto] gap-4 p-4 bg-surface-1 border-b border-surface-2 font-medium text-sm">
              <span className="text-foreground">אלמנט</span>
              <span className="text-role-teacher w-20 text-center">מורים</span>
              <span className="text-role-parent w-20 text-center">הורים</span>
            </div>

            <div className="divide-y divide-surface-2">
              {reportConfig.elements.map((elem, index) => (
                <div
                  key={elem.id}
                  className={`grid grid-cols-[1fr_auto_auto] gap-4 p-4 items-center animate-slide-up stagger-${Math.min(index + 1, 6)}`}
                >
                  <span className="font-medium text-foreground">{elem.label}</span>

                  <button
                    onClick={() => toggleReportElement(elem.id, "enabledForTeacher")}
                    className={`w-20 py-2 rounded-lg font-medium text-sm transition-all duration-200 cursor-pointer ${elem.enabledForTeacher
                      ? "bg-role-teacher text-white shadow-sm"
                      : "bg-surface-2 text-gray-400 hover:bg-surface-3"
                      }`}
                  >
                    {elem.enabledForTeacher ? "מוצג" : "מוסתר"}
                  </button>

                  <button
                    onClick={() => toggleReportElement(elem.id, "enabledForParent")}
                    className={`w-20 py-2 rounded-lg font-medium text-sm transition-all duration-200 cursor-pointer ${elem.enabledForParent
                      ? "bg-role-parent text-white shadow-sm"
                      : "bg-surface-2 text-gray-400 hover:bg-surface-3"
                      }`}
                  >
                    {elem.enabledForParent ? "מוצג" : "מוסתר"}
                  </button>
                </div>
              ))}
            </div>
          </Card>

          <Button
            onClick={handleSaveReport}
            disabled={saving}
            loading={saving}
            loadingText="שומר..."
            rightIcon={Save}
          >
            שמור שינויים
          </Button>
        </div>
      )}
    </div>
  );
}
