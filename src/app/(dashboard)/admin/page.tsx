"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import {
  getExplanationButtons,
  saveExplanationButtons,
  getEmailConfig,
  saveEmailConfig,
  getReportConfig,
  saveReportConfig,
} from "@/lib/services/settings";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { SkeletonList } from "@/components/ui/Skeleton";
import {
  Settings,
  MessageSquareText,
  Mail,
  FileBarChart,
  Plus,
  X,
  Trash2,
  Eye,
  EyeOff,
  Save,
  CheckCircle,
  User,
} from "lucide-react";
import type { ExplanationButton, EmailConfig, ReportConfig, UserRole } from "@/types";

type Tab = "buttons" | "email" | "report";

const roles: UserRole[] = ["admin", "teacher", "parent", "student"];
const roleLabels: Record<UserRole, string> = {
  admin: "מנהל",
  teacher: "מורה",
  parent: "הורה",
  student: "תלמיד",
};

const tabConfig: { id: Tab; label: string; icon: typeof Settings }[] = [
  { id: "buttons", label: "כפתורי הסבר", icon: MessageSquareText },
  { id: "email", label: "הגדרות מייל", icon: Mail },
  { id: "report", label: "הגדרות דוח", icon: FileBarChart },
];

export default function AdminSettingsPage() {
  const { session } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("buttons");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Explanation Buttons state
  const [buttons, setButtons] = useState<ExplanationButton[]>([]);

  // Email Config state
  const [emailConfig, setEmailConfig] = useState<EmailConfig>({
    adminEmails: [],
    frequency: "daily",
    includeContent: true,
  });
  const [newEmail, setNewEmail] = useState("");

  // Report Config state
  const [reportConfig, setReportConfig] = useState<ReportConfig>({
    elements: [],
    aiPromptInstructions: "",
  });

  useEffect(() => {
    if (session?.user.role !== "admin") {
      router.push("/dashboard");
      return;
    }

    async function load() {
      setLoading(true);
      const [btns, email, report] = await Promise.all([
        getExplanationButtons(),
        getEmailConfig(),
        getReportConfig(),
      ]);
      setButtons(btns);
      if (email) setEmailConfig(email);
      if (report) setReportConfig(report);
      setLoading(false);
    }
    load();
  }, [session, router]);

  async function handleSaveButtons() {
    setSaving(true);
    await saveExplanationButtons(buttons);
    setSaving(false);
  }

  async function handleSaveEmail() {
    setSaving(true);
    await saveEmailConfig(emailConfig);
    setSaving(false);
  }

  async function handleSaveReport() {
    setSaving(true);
    await saveReportConfig(reportConfig);
    setSaving(false);
  }

  function addButton() {
    setButtons([
      ...buttons,
      {
        id: `btn_${Date.now()}`,
        role: "teacher",
        label: "",
        content: "",
        visible: true,
      },
    ]);
  }

  function updateButton(id: string, updates: Partial<ExplanationButton>) {
    setButtons(buttons.map((b) => (b.id === id ? { ...b, ...updates } : b)));
  }

  function removeButton(id: string) {
    setButtons(buttons.filter((b) => b.id !== id));
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

  function addReportElement() {
    setReportConfig({
      ...reportConfig,
      elements: [
        ...reportConfig.elements,
        {
          id: `elem_${Date.now()}`,
          label: "",
          enabledForTeacher: true,
          enabledForParent: true,
        },
      ],
    });
  }

  function updateReportElement(id: string, updates: Partial<ReportConfig["elements"][0]>) {
    setReportConfig({
      ...reportConfig,
      elements: reportConfig.elements.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    });
  }

  function removeReportElement(id: string) {
    setReportConfig({
      ...reportConfig,
      elements: reportConfig.elements.filter((e) => e.id !== id),
    });
  }

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl">
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

  const activeTabConfig = tabConfig.find((t) => t.id === activeTab);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-role-admin/10 rounded-xl">
          <Settings size={24} className="text-role-admin" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-rubik font-bold text-foreground">
            הגדרות מנהל
          </h1>
          <p className="text-sm text-gray-500">
            ניהול הגדרות מערכת ותצורה
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 p-1 bg-surface-1 rounded-xl overflow-x-auto">
        {tabConfig.map((tab) => {
          const IconComponent = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 cursor-pointer shrink-0 ${
                isActive
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

      {/* Buttons Tab */}
      {activeTab === "buttons" && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <MessageSquareText size={20} className="text-role-admin" />
              <h2 className="text-lg font-rubik font-semibold text-foreground">
                כפתורי הסבר לפי תפקיד
              </h2>
            </div>
            <Button onClick={addButton} rightIcon={Plus} size="sm">
              הוסף כפתור
            </Button>
          </div>

          {buttons.length === 0 ? (
            <Card className="text-center py-8">
              <MessageSquareText size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">אין כפתורי הסבר עדיין</p>
              <Button onClick={addButton} rightIcon={Plus} className="mt-4">
                הוסף כפתור חדש
              </Button>
            </Card>
          ) : (
            buttons.map((button, index) => (
              <Card
                key={button.id}
                className={`animate-slide-up stagger-${Math.min(index + 1, 6)}`}
              >
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                        <User size={14} className="text-gray-500" />
                        תפקיד
                      </label>
                      <select
                        value={button.role}
                        onChange={(e) =>
                          updateButton(button.id, {
                            role: e.target.value as UserRole,
                          })
                        }
                        className="w-full p-3 border-2 border-surface-3 rounded-xl bg-surface-0 cursor-pointer transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                      >
                        {roles.map((role) => (
                          <option key={role} value={role}>
                            {roleLabels[role]}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        תווית
                      </label>
                      <Input
                        value={button.label}
                        onChange={(e) =>
                          updateButton(button.id, { label: e.target.value })
                        }
                        placeholder="שם הכפתור"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      תוכן
                    </label>
                    <textarea
                      value={button.content}
                      onChange={(e) =>
                        updateButton(button.id, { content: e.target.value })
                      }
                      className="w-full p-4 border-2 border-surface-3 rounded-xl bg-surface-0 text-foreground placeholder:text-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none"
                      rows={3}
                      placeholder="תוכן ההסבר"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-surface-2">
                    <button
                      onClick={() =>
                        updateButton(button.id, { visible: !button.visible })
                      }
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer transition-all ${
                        button.visible
                          ? "bg-success/10 text-success"
                          : "bg-surface-2 text-gray-500"
                      }`}
                    >
                      {button.visible ? (
                        <>
                          <Eye size={14} />
                          גלוי
                        </>
                      ) : (
                        <>
                          <EyeOff size={14} />
                          מוסתר
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => removeButton(button.id)}
                      className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-error cursor-pointer transition-colors"
                    >
                      <Trash2 size={14} />
                      הסר
                    </button>
                  </div>
                </div>
              </Card>
            ))
          )}

          <Button
            onClick={handleSaveButtons}
            disabled={saving}
            loading={saving}
            loadingText="שומר..."
            rightIcon={Save}
          >
            שמור שינויים
          </Button>
        </div>
      )}

      {/* Email Tab */}
      {activeTab === "email" && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center gap-2">
            <Mail size={20} className="text-role-admin" />
            <h2 className="text-lg font-rubik font-semibold text-foreground">
              הגדרות התראות מייל
            </h2>
          </div>

          <Card className="space-y-6">
            {/* Admin Emails */}
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

            {/* Frequency */}
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

            {/* Include Content */}
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

      {/* Report Tab */}
      {activeTab === "report" && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <FileBarChart size={20} className="text-role-admin" />
              <h2 className="text-lg font-rubik font-semibold text-foreground">
                הגדרות דוח AI
              </h2>
            </div>
            <Button onClick={addReportElement} rightIcon={Plus} size="sm">
              הוסף אלמנט
            </Button>
          </div>

          <Card className="space-y-6">
            {/* AI Instructions */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                הנחיות ל-AI
              </label>
              <textarea
                value={reportConfig.aiPromptInstructions}
                onChange={(e) =>
                  setReportConfig({
                    ...reportConfig,
                    aiPromptInstructions: e.target.value,
                  })
                }
                className="w-full p-4 border-2 border-surface-3 rounded-xl bg-surface-0 text-foreground placeholder:text-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none"
                rows={4}
                placeholder="הנחיות מותאמות לייצור דוחות"
              />
            </div>

            {/* Report Elements */}
            <div className="space-y-3">
              <h3 className="font-medium text-foreground">אלמנטים בדוח</h3>
              {reportConfig.elements.length === 0 ? (
                <div className="text-center py-6 bg-surface-1 rounded-xl">
                  <p className="text-sm text-gray-400">לא הוגדרו אלמנטים</p>
                </div>
              ) : (
                reportConfig.elements.map((elem, index) => (
                  <div
                    key={elem.id}
                    className={`flex flex-col md:flex-row md:items-center gap-3 md:gap-4 p-4 bg-surface-1 rounded-xl animate-slide-up stagger-${Math.min(index + 1, 6)}`}
                  >
                    <Input
                      value={elem.label}
                      onChange={(e) =>
                        updateReportElement(elem.id, { label: e.target.value })
                      }
                      placeholder="שם האלמנט"
                      className="flex-1"
                    />
                    <div className="flex items-center gap-4">
                      <label className="inline-flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={elem.enabledForTeacher}
                          onChange={(e) =>
                            updateReportElement(elem.id, {
                              enabledForTeacher: e.target.checked,
                            })
                          }
                          className="w-4 h-4 rounded border-2 border-surface-3 text-role-teacher focus:ring-role-teacher"
                        />
                        <span className="text-sm text-gray-600">מורה</span>
                      </label>
                      <label className="inline-flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={elem.enabledForParent}
                          onChange={(e) =>
                            updateReportElement(elem.id, {
                              enabledForParent: e.target.checked,
                            })
                          }
                          className="w-4 h-4 rounded border-2 border-surface-3 text-role-parent focus:ring-role-parent"
                        />
                        <span className="text-sm text-gray-600">הורה</span>
                      </label>
                      <button
                        onClick={() => removeReportElement(elem.id)}
                        className="p-2 text-gray-400 hover:text-error hover:bg-error/10 rounded-lg transition-all duration-200 cursor-pointer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
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
