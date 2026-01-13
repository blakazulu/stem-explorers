"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { getAllUsers, updateUserPassword, UserDocument } from "@/lib/services/users";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { UserRole, Grade } from "@/types";

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

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllUsers();
      // Sort by role then by grade
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

    // Check if new password already exists (and it's not the same user)
    if (trimmedPassword !== editingUser.password &&
        users.some((u) => u.password === trimmedPassword)) {
      setError("סיסמה זו כבר בשימוש");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // If password changed, update it
      if (trimmedPassword !== editingUser.password) {
        await updateUserPassword(
          editingUser.password,
          trimmedPassword,
          editingUser.role,
          editingUser.grade
        );

        // If this is the current admin, log out (password changed)
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

  // Group users by role
  const groupedUsers = {
    admin: users.filter((u) => u.role === "admin"),
    teacher: users.filter((u) => u.role === "teacher"),
    parent: users.filter((u) => u.role === "parent"),
    student: users.filter((u) => u.role === "student"),
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-rubik font-bold">ניהול סיסמאות</h1>
        <p className="text-gray-500 mt-1">עריכת סיסמאות הגישה למערכת</p>
      </div>

      {error && (
        <div className="bg-error/10 text-error p-4 rounded-lg">{error}</div>
      )}

      {success && (
        <div className="bg-success/10 text-success p-4 rounded-lg">{success}</div>
      )}

      {loading ? (
        <div className="text-gray-500">טוען משתמשים...</div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedUsers).map(([role, roleUsers]) => (
            <div key={role}>
              <h2 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-2">
                {roleLabels[role as UserRole]} ({roleUsers.length})
              </h2>

              {roleUsers.length === 0 ? (
                <p className="text-sm text-gray-400">אין משתמשים</p>
              ) : (
                <div className="space-y-2">
                  {roleUsers.map((user) => (
                    <div
                      key={user.password}
                      className="bg-white rounded-lg p-4 shadow-sm"
                    >
                      {editingUser?.password === user.password ? (
                        // Edit mode
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <span className="font-medium">
                              {roleLabels[user.role]}
                              {user.grade && ` כיתה ${user.grade}`}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <label className="text-sm text-gray-600">סיסמה:</label>
                            <Input
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              className="flex-1 max-w-xs"
                              dir="ltr"
                              autoFocus
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={handleSave} disabled={saving}>
                              {saving ? "שומר..." : "שמור"}
                            </Button>
                            <Button size="sm" variant="outline" onClick={cancelEdit}>
                              ביטול
                            </Button>
                          </div>
                        </div>
                      ) : (
                        // View mode
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <span className="font-medium min-w-[120px]">
                              {roleLabels[user.role]}
                              {user.grade && ` כיתה ${user.grade}`}
                            </span>
                            <span className="text-gray-400">|</span>
                            <span className="text-sm text-gray-600">סיסמה:</span>
                            <code className="font-mono bg-gray-100 px-2 py-1 rounded text-sm">
                              {user.password}
                            </code>
                            {user.password === session?.documentId && (
                              <span className="text-xs text-primary">(את/ה)</span>
                            )}
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startEdit(user)}
                          >
                            ערוך
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
