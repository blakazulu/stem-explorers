"use client";

import { memo } from "react";
import { useDraggable } from "@dnd-kit/core";
import {
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Repeat,
  GitBranch,
} from "lucide-react";

export type CommandType = "up" | "down" | "left" | "right" | "loop" | "conditional";

interface CommandInfo {
  type: CommandType;
  nameHe: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  bgColor: string;
  borderColor: string;
}

export const COMMAND_INFO: Record<CommandType, CommandInfo> = {
  up: {
    type: "up",
    nameHe: "למעלה",
    icon: ArrowUp,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    borderColor: "border-blue-300",
  },
  down: {
    type: "down",
    nameHe: "למטה",
    icon: ArrowDown,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    borderColor: "border-blue-300",
  },
  left: {
    type: "left",
    nameHe: "שמאלה",
    icon: ArrowLeft,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    borderColor: "border-blue-300",
  },
  right: {
    type: "right",
    nameHe: "ימינה",
    icon: ArrowRight,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    borderColor: "border-blue-300",
  },
  loop: {
    type: "loop",
    nameHe: "חזור",
    icon: Repeat,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
    borderColor: "border-purple-300",
  },
  conditional: {
    type: "conditional",
    nameHe: "אם",
    icon: GitBranch,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
    borderColor: "border-orange-300",
  },
};

interface DraggableCommandProps {
  type: CommandType;
  disabled?: boolean;
}

/**
 * A single draggable command block from the palette.
 */
function DraggableCommand({ type, disabled = false }: DraggableCommandProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${type}`,
    data: { type, fromPalette: true },
    disabled,
  });

  const info = COMMAND_INFO[type];
  const Icon = info.icon;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`
        flex flex-col items-center justify-center gap-1.5
        p-3 rounded-xl border-2
        ${info.bgColor} ${info.borderColor}
        transition-all duration-200
        ${
          isDragging
            ? "opacity-50 scale-95"
            : disabled
            ? "opacity-50 cursor-not-allowed"
            : "cursor-grab hover:shadow-md hover:scale-105 active:cursor-grabbing"
        }
      `}
    >
      <Icon size={24} className={info.color} />
      <span className={`text-xs font-medium ${info.color}`}>{info.nameHe}</span>
    </div>
  );
}

interface CommandPaletteProps {
  allowLoops?: boolean;
  allowConditionals?: boolean;
  disabled?: boolean;
}

/**
 * Palette of available command blocks that can be dragged to the sequence.
 */
export const CommandPalette = memo(function CommandPalette({
  allowLoops = false,
  allowConditionals = false,
  disabled = false,
}: CommandPaletteProps) {
  const basicCommands: CommandType[] = ["up", "down", "left", "right"];
  const advancedCommands: CommandType[] = [];

  if (allowLoops) {
    advancedCommands.push("loop");
  }
  if (allowConditionals) {
    advancedCommands.push("conditional");
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border-2 border-gray-200 shadow-md" dir="rtl">
      <h3 className="text-sm font-rubik font-bold text-gray-700 mb-3 text-center">
        פקודות זמינות
      </h3>

      {/* Basic movement commands */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
        {basicCommands.map((cmd) => (
          <DraggableCommand key={cmd} type={cmd} disabled={disabled} />
        ))}
      </div>

      {/* Advanced commands (loops, conditionals) */}
      {advancedCommands.length > 0 && (
        <>
          <div className="border-t border-gray-200 my-3" />
          <div className="grid grid-cols-2 gap-2">
            {advancedCommands.map((cmd) => (
              <DraggableCommand key={cmd} type={cmd} disabled={disabled} />
            ))}
          </div>
        </>
      )}

      <p className="text-xs text-gray-500 text-center mt-3">
        גרור פקודות לתוכנית
      </p>
    </div>
  );
});
