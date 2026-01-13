"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { getAllUsers, updateUserPassword, UserDocument } from "@/lib/services/users";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { UserRole } from "@/types";

const roleLabels: Record<UserRole, string> = {
  admin: "מנהל",
  teacher: "מורה",
  parent: "הורה",
  student: "תלמיד",
};

export default function PasswordsPage() {
  const { session, logout } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<UserDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<UserDocument | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllUsers();
      data.sort((a, b) => {
        const roleOrder = { admin: 0, teacher: 1, parent: 2, student: 3 };
        if (roleOrder[a.role] !== roleOrder[b.role]) {
          return roleOrder[a.role] - roleOrder[b.role];
        }
        const gradeOrder = ["א", "ב", "ג", "ד", "ה", "ו"];
        return gradeOrder.indexOf(a.grade || "") - gradeOrder.indexOf(b.grade || "");
      });
      setUsers(data);
    } catch {
      setError("שגיאה בטעינת משתמשים");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (session?.user.role !== "admin") {
      router.push("/dashboard");
      return;
    }
    loadUsers();
  }, [session, router, loadUsers]);

  function toggleSection(role: string) {
    setCollapsedSections((prev) => ({ ...prev, [role]: !prev[role] }));
  }

  function startEdit(user: UserDocument) {
    setEditingUser(user);
    setNewPassword(user.password);
    setError(null);
    setSuccess(null);
  }

  function cancelEdit() {
    setEditingUser(null);
    setNewPassword("");
    setError(null);
  }

  async function handleSave() {
    if (!editingUser) return;

    const trimmedPassword = newPassword.trim();

    if (!trimmedPassword) {
      setError("יש להזין סיסמה");
      return;
    }

    if (trimmedPassword !== editingUser.password &&
        users.some((u) => u.password === trimmedPassword)) {
      setError("סיסמה זו כבר בשימוש");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      if (trimmedPassword !== editingUser.password) {
        await updateUserPassword(
          editingUser.password,
          trimmedPassword,
          editingUser.role,
          editingUser.grade
        );

        if (editingUser.password === session?.documentId) {
          setSuccess("הסיסמה עודכנה. מתנתק...");
          setTimeout(() => logout(), 2000);
          return;
        }

        setSuccess("הסיסמה עודכנה בהצלחה");
      }

      setEditingUser(null);
      setNewPassword("");
      await loadUsers();
    } catch {
      setError("שגיאה בעדכון הסיסמה");
    }

    setSaving(false);
  }

  if (session?.user.role !== "admin") {
    return null;
  }

  const groupedUsers = {
    admin: users.filter((u) => u.role === "admin"),
    teacher: users.filter((u) => u.role === "teacher"),
    parent: users.filter((u) => u.role === "parent"),
    student: users.filter((u) => u.role === "student"),
  };

  return (
    <div className="space-y-4 max-w-4xl">
      <div>
        <h1 className="text-xl md:text-2xl font-rubik font-bold">ניהול סיסמאות</h1>
        <p className="text-sm text-gray-500 mt-1">עריכת סיסמאות הגישה למערכת</p>
      </div>

      {error && (
        <div className="bg-error/10 text-error p-3 rounded-lg text-sm">{error}</div>
      )}

      {success && (
        <div className="bg-success/10 text-success p-3 rounded-lg text-sm">{success}</div>
      )}

      {loading ? (
        <div className="text-gray-500">טוען משתמשים...</div>
      ) : (
        <div className="space-y-3">
          {Object.entries(groupedUsers).map(([role, roleUsers]) => (
            <div key={role} className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Collapsible header */}
              <button
                onClick={() => toggleSection(role)}
                className="w-full flex items-center justify-between p-3 md:p-4 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <span className="font-semibold text-gray-700">
                  {roleLabels[role as UserRole]} ({roleUsers.length})
                </span>
                <span className={`text-gray-400 text-lg transition-transform duration-200 ${collapsedSections[role] ? "" : "rotate-45"}`}>
                  +
                </span>
              </button>

              {/* Collapsible content */}
              {!collapsedSections[role] && roleUsers.length > 0 && (
                <div className="border-t px-3 md:px-4 pb-3 md:pb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 pt-3">
                    {roleUsers.map((user) => (
                      <div
                        key={user.password}
                        className="bg-gray-50 rounded-lg p-3 transition-all duration-200 hover:bg-gray-100 hover:shadow-sm"
                      >
                        {editingUser?.password === user.password ? (
                          // Edit mode
                          <div className="space-y-2">
                            <div className="text-sm font-medium">
                              {user.grade ? `כיתה ${user.grade}` : roleLabels[user.role]}
                            </div>
                            <Input
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              className="w-full text-sm"
                              dir="ltr"
                              autoFocus
                            />
                            <div className="flex gap-2">
                              <Button size="sm" onClick={handleSave} disabled={saving}>
                                {saving ? "..." : "שמור"}
                              </Button>
                              <Button size="sm" variant="outline" onClick={cancelEdit}>
                                בטל
                              </Button>
                            </div>
                          </div>
                        ) : (
                          // View mode - compact card
                          <div className="flex items-center justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-medium truncate">
                                {user.grade ? `כיתה ${user.grade}` : roleLabels[user.role]}
                                {user.password === session?.documentId && (
                                  <span className="text-xs text-primary mr-1">(את/ה)</span>
                                )}
                              </div>
                              <code className="text-xs font-mono text-gray-600 block truncate">
                                {user.password}
                              </code>
                            </div>
                            <button
                              onClick={() => startEdit(user)}
                              className="text-xs text-primary hover:underline shrink-0 cursor-pointer transition-colors hover:text-primary/80"
                            >
                              ערוך
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!collapsedSections[role] && roleUsers.length === 0 && (
                <div className="border-t px-4 py-3 text-sm text-gray-400">
                  אין משתמשים
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
