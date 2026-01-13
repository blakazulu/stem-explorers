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
import type { ExplanationButton, EmailConfig, ReportConfig, UserRole } from "@/types";

type Tab = "buttons" | "email" | "report";

const roles: UserRole[] = ["admin", "teacher", "parent", "student"];
const roleLabels: Record<UserRole, string> = {
  admin: "מנהל",
  teacher: "מורה",
  parent: "הורה",
  student: "תלמיד",
};

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
    return <div className="text-gray-500">טוען הגדרות...</div>;
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "buttons", label: "כפתורי הסבר" },
    { id: "email", label: "הגדרות מייל" },
    { id: "report", label: "הגדרות דוח" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-rubik font-bold">הגדרות מנהל</h1>

      <div className="flex gap-2 border-b pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-primary text-white"
                : "bg-gray-100 text-foreground hover:bg-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "buttons" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">כפתורי הסבר לפי תפקיד</h2>
            <Button onClick={addButton}>הוסף כפתור</Button>
          </div>

          {buttons.map((button) => (
            <div key={button.id} className="bg-white rounded-xl p-4 shadow-sm space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">תפקיד</label>
                  <select
                    value={button.role}
                    onChange={(e) => updateButton(button.id, { role: e.target.value as UserRole })}
                    className="w-full p-2 border rounded-lg"
                  >
                    {roles.map((role) => (
                      <option key={role} value={role}>
                        {roleLabels[role]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">תווית</label>
                  <Input
                    value={button.label}
                    onChange={(e) => updateButton(button.id, { label: e.target.value })}
                    placeholder="שם הכפתור"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">תוכן</label>
                <textarea
                  value={button.content}
                  onChange={(e) => updateButton(button.id, { content: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  rows={3}
                  placeholder="תוכן ההסבר"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={button.visible}
                    onChange={(e) => updateButton(button.id, { visible: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm">גלוי</span>
                </label>
                <button
                  onClick={() => removeButton(button.id)}
                  className="text-sm text-error hover:underline"
                >
                  הסר
                </button>
              </div>
            </div>
          ))}

          <Button onClick={handleSaveButtons} disabled={saving}>
            {saving ? "שומר..." : "שמור שינויים"}
          </Button>
        </div>
      )}

      {activeTab === "email" && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">הגדרות התראות מייל</h2>

          <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">כתובות מייל מנהלים</label>
              <div className="flex gap-2 mb-2">
                <Input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="הוסף כתובת מייל"
                />
                <Button onClick={addEmail}>הוסף</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {emailConfig.adminEmails.map((email) => (
                  <span
                    key={email}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm"
                  >
                    {email}
                    <button
                      onClick={() => removeEmail(email)}
                      className="text-error hover:text-red-700"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">תדירות שליחה</label>
              <select
                value={emailConfig.frequency}
                onChange={(e) =>
                  setEmailConfig({ ...emailConfig, frequency: e.target.value as "immediate" | "daily" })
                }
                className="w-full p-2 border rounded-lg"
              >
                <option value="immediate">מיידי</option>
                <option value="daily">יומי</option>
              </select>
            </div>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={emailConfig.includeContent}
                onChange={(e) =>
                  setEmailConfig({ ...emailConfig, includeContent: e.target.checked })
                }
                className="rounded"
              />
              <span className="text-sm">כלול תוכן מלא בהתראות</span>
            </label>
          </div>

          <Button onClick={handleSaveEmail} disabled={saving}>
            {saving ? "שומר..." : "שמור שינויים"}
          </Button>
        </div>
      )}

      {activeTab === "report" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">הגדרות דוח AI</h2>
            <Button onClick={addReportElement}>הוסף אלמנט</Button>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">הנחיות ל-AI</label>
              <textarea
                value={reportConfig.aiPromptInstructions}
                onChange={(e) =>
                  setReportConfig({ ...reportConfig, aiPromptInstructions: e.target.value })
                }
                className="w-full p-3 border rounded-lg"
                rows={4}
                placeholder="הנחיות מותאמות לייצור דוחות"
              />
            </div>

            <div className="space-y-3">
              <h3 className="font-medium">אלמנטים בדוח</h3>
              {reportConfig.elements.map((elem) => (
                <div key={elem.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <Input
                    value={elem.label}
                    onChange={(e) => updateReportElement(elem.id, { label: e.target.value })}
                    placeholder="שם האלמנט"
                    className="flex-1"
                  />
                  <label className="flex items-center gap-1 text-sm">
                    <input
                      type="checkbox"
                      checked={elem.enabledForTeacher}
                      onChange={(e) =>
                        updateReportElement(elem.id, { enabledForTeacher: e.target.checked })
                      }
                    />
                    מורה
                  </label>
                  <label className="flex items-center gap-1 text-sm">
                    <input
                      type="checkbox"
                      checked={elem.enabledForParent}
                      onChange={(e) =>
                        updateReportElement(elem.id, { enabledForParent: e.target.checked })
                      }
                    />
                    הורה
                  </label>
                  <button
                    onClick={() => removeReportElement(elem.id)}
                    className="text-error hover:underline text-sm"
                  >
                    הסר
                  </button>
                </div>
              ))}
            </div>
          </div>

          <Button onClick={handleSaveReport} disabled={saving}>
            {saving ? "שומר..." : "שמור שינויים"}
          </Button>
        </div>
      )}
    </div>
  );
}
