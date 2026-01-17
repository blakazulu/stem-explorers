"use client";

import type { ConfigurableRole } from "@/types";

interface RoleTabsProps {
  selectedRole: ConfigurableRole;
  onRoleChange: (role: ConfigurableRole) => void;
}

const ROLES: { id: ConfigurableRole; label: string }[] = [
  { id: "teacher", label: "מורה" },
  { id: "parent", label: "הורה" },
  { id: "student", label: "תלמיד" },
];

export function RoleTabs({ selectedRole, onRoleChange }: RoleTabsProps) {
  return (
    <div className="flex gap-2 p-1 bg-surface-1 rounded-xl">
      {ROLES.map((role) => (
        <button
          key={role.id}
          onClick={() => onRoleChange(role.id)}
          className={`
            flex-1 px-4 py-2 rounded-lg font-medium transition-all cursor-pointer
            ${
              selectedRole === role.id
                ? "bg-primary text-white shadow-md"
                : "text-gray-600 hover:bg-surface-2"
            }
          `}
        >
          {role.label}
        </button>
      ))}
    </div>
  );
}
