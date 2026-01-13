"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { getAllUsers, updateUserPassword, UserDocument } from "@/lib/services/users";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { SkeletonList } from "@/components/ui/Skeleton";
import {
  Key,
  ChevronDown,
  Shield,
  GraduationCap,
  Users,
  User,
  Edit2,
  Copy,
  Check,
  X,
  Save,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import type { UserRole } from "@/types";

const roleConfig: Record<UserRole, { label: string; icon: typeof Shield; color: string; bgColor: string }> = {
  admin: { label: "מנהלים", icon: Shield, color: "text-role-admin", bgColor: "bg-role-admin/10" },
  teacher: { label: "מורים", icon: GraduationCap, color: "text-role-teacher", bgColor: "bg-role-teacher/10" },
  parent: { label: "הורים", icon: Users, color: "text-role-parent", bgColor: "bg-role-parent/10" },
  student: { label: "תלמידים", icon: User, color: "text-role-student", bgColor: "bg-role-student/10" },
};

const roleSingular: Record<UserRole, string> = {
  admin: "מנהל",
  teacher: "מורה",
  parent: "הורה",
  student: "תלמיד",
};

// Animated collapsible section
function CollapsibleSection({
  role,
  users,
  isOpen,
  onToggle,
  editingUser,
  onStartEdit,
  onCancelEdit,
  onSave,
  newPassword,
  setNewPassword,
  saving,
  currentUserId,
}: {
  role: UserRole;
  users: UserDocument[];
  isOpen: boolean;
  onToggle: () => void;
  editingUser: UserDocument | null;
  onStartEdit: (user: UserDocument) => void;
  onCancelEdit: () => void;
  onSave: () => void;
  newPassword: string;
  setNewPassword: (val: string) => void;
  saving: boolean;
  currentUserId?: string;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const config = roleConfig[role];
  const IconComponent = config.icon;

  async function copyPassword(password: string) {
    try {
      await navigator.clipboard.writeText(password);
      setCopiedId(password);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback for browsers without clipboard API
    }
  }

  return (
    <Card padding="none" className="overflow-hidden">
      {/* Section Header */}
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between p-4 transition-colors duration-200 cursor-pointer hover:bg-surface-1 ${
          isOpen ? "border-b border-surface-2" : ""
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${config.bgColor}`}>
            <IconComponent size={20} className={config.color} />
          </div>
          <div className="text-right">
            <span className="font-rubik font-semibold text-foreground">
              {config.label}
            </span>
            <span className={`text-sm mr-2 px-2 py-0.5 rounded-full ${config.bgColor} ${config.color}`}>
              {users.length}
            </span>
          </div>
        </div>
        <ChevronDown
          size={20}
          className={`text-gray-400 transition-transform duration-300 ease-out ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Animated Content */}
      <div
        className="transition-all duration-300 ease-out overflow-hidden"
        style={{
          maxHeight: isOpen ? `${(contentRef.current?.scrollHeight || 500) + 50}px` : "0px",
          opacity: isOpen ? 1 : 0,
        }}
      >
        <div ref={contentRef} className="p-4">
          {users.length === 0 ? (
            <div className="text-center py-6 text-gray-400 text-sm">
              אין {config.label.toLowerCase()}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {users.map((user, index) => (
                <div
                  key={user.password}
                  className={`bg-surface-1 rounded-xl p-4 transition-all duration-200 hover:bg-surface-2 hover:shadow-sm animate-slide-up`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {editingUser?.password === user.password ? (
                    // Edit mode
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Edit2 size={14} className={config.color} />
                        <span className="text-sm font-medium text-foreground">
                          {user.grade ? `כיתה ${user.grade}` : roleSingular[user.role]}
                        </span>
                      </div>
                      <Input
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full text-sm font-mono"
                        dir="ltr"
                        autoFocus
                        placeholder="הקלד סיסמה חדשה"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={onSave}
                          disabled={saving}
                          loading={saving}
                          loadingText="שומר..."
                          rightIcon={Save}
                        >
                          שמור
                        </Button>
                        <Button size="sm" variant="ghost" onClick={onCancelEdit} rightIcon={X}>
                          בטל
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // View mode
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground">
                            {user.grade ? `כיתה ${user.grade}` : roleSingular[user.role]}
                          </span>
                          {user.password === currentUserId && (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                              את/ה
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 bg-surface-0 rounded-lg px-3 py-2">
                        <code className="text-sm font-mono text-gray-600 flex-1 truncate" dir="ltr">
                          {user.password}
                        </code>
                        <button
                          onClick={() => copyPassword(user.password)}
                          className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all duration-200 cursor-pointer"
                          title="העתק סיסמה"
                        >
                          {copiedId === user.password ? (
                            <Check size={14} className="text-success" />
                          ) : (
                            <Copy size={14} />
                          )}
                        </button>
                      </div>

                      <button
                        onClick={() => onStartEdit(user)}
                        className="w-full flex items-center justify-center gap-2 text-sm text-primary hover:bg-primary/10 py-2 rounded-lg transition-all duration-200 cursor-pointer"
                      >
                        <Edit2 size={14} />
                        ערוך סיסמה
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

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
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    admin: true,
    teacher: true,
    parent: true,
    student: true,
  });

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
    setOpenSections((prev) => ({ ...prev, [role]: !prev[role] }));
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
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-role-admin/10 rounded-xl">
          <Key size={24} className="text-role-admin" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-rubik font-bold text-foreground">
            ניהול סיסמאות
          </h1>
          <p className="text-sm text-gray-500">
            צפייה ועריכה של סיסמאות הגישה למערכת
          </p>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-center gap-3 bg-error/10 text-error p-4 rounded-xl animate-slide-up">
          <AlertCircle size={20} />
          <span className="text-sm font-medium">{error}</span>
          <button
            onClick={() => setError(null)}
            className="mr-auto p-1 hover:bg-error/20 rounded-lg transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-3 bg-success/10 text-success p-4 rounded-xl animate-slide-up">
          <CheckCircle size={20} />
          <span className="text-sm font-medium">{success}</span>
          <button
            onClick={() => setSuccess(null)}
            className="mr-auto p-1 hover:bg-success/20 rounded-lg transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* User Sections */}
      {loading ? (
        <SkeletonList count={4} />
      ) : (
        <div className="space-y-4">
          {(Object.keys(groupedUsers) as UserRole[]).map((role) => (
            <CollapsibleSection
              key={role}
              role={role}
              users={groupedUsers[role]}
              isOpen={openSections[role]}
              onToggle={() => toggleSection(role)}
              editingUser={editingUser}
              onStartEdit={startEdit}
              onCancelEdit={cancelEdit}
              onSave={handleSave}
              newPassword={newPassword}
              setNewPassword={setNewPassword}
              saving={saving}
              currentUserId={session?.documentId}
            />
          ))}
        </div>
      )}

      {/* Summary */}
      {!loading && (
        <Card variant="outlined" className="bg-surface-1/50">
          <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
            <span>סה״כ {users.length} משתמשים</span>
            <span className="w-1 h-1 bg-gray-300 rounded-full" />
            <span>{groupedUsers.student.length} תלמידים</span>
            <span className="w-1 h-1 bg-gray-300 rounded-full" />
            <span>{groupedUsers.teacher.length} מורים</span>
          </div>
        </Card>
      )}
    </div>
  );
}
