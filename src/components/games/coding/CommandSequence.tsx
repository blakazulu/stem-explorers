"use client";

import { memo } from "react";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { X, Play, Trash2 } from "lucide-react";
import { type CommandType, COMMAND_INFO } from "./CommandPalette";

export interface Command {
  id: string;
  type: CommandType;
  loopCount?: number; // For loop commands
}

interface SequenceCommandProps {
  command: Command;
  index: number;
  isExecuting: boolean;
  onRemove: (index: number) => void;
  disabled?: boolean;
}

/**
 * A single command block in the sequence that can be removed.
 */
function SequenceCommand({
  command,
  index,
  isExecuting,
  onRemove,
  disabled = false,
}: SequenceCommandProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `sequence-${command.id}`,
    data: { type: command.type, fromSequence: true, index },
    disabled: disabled || isExecuting,
  });

  const info = COMMAND_INFO[command.type];
  const Icon = info.icon;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`
        relative group
        flex items-center justify-center gap-2
        px-3 py-2.5 rounded-xl border-2
        ${info.bgColor} ${info.borderColor}
        transition-all duration-200
        ${
          isDragging
            ? "opacity-50 scale-95"
            : isExecuting
            ? "ring-2 ring-cyan-500 ring-offset-2 scale-110 shadow-lg"
            : disabled
            ? "opacity-60"
            : "cursor-grab hover:shadow-md active:cursor-grabbing"
        }
      `}
    >
      <Icon size={20} className={info.color} />
      <span className={`text-sm font-medium ${info.color}`}>{info.nameHe}</span>

      {/* Index badge */}
      <span
        className={`
          absolute -top-2 -right-2
          w-5 h-5 rounded-full
          flex items-center justify-center
          text-xs font-bold text-white
          ${isExecuting ? "bg-cyan-500" : "bg-gray-400"}
        `}
      >
        {index + 1}
      </span>

      {/* Remove button */}
      {!disabled && !isExecuting && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(index);
          }}
          className={`
            absolute -top-2 -left-2
            w-5 h-5 rounded-full
            flex items-center justify-center
            bg-red-500 text-white
            opacity-0 group-hover:opacity-100
            transition-opacity duration-200
            hover:bg-red-600
          `}
        >
          <X size={12} />
        </button>
      )}
    </div>
  );
}

interface CommandSequenceProps {
  commands: Command[];
  currentExecutingIndex: number | null;
  maxMoves: number;
  onRemoveCommand: (index: number) => void;
  onClearAll: () => void;
  onRun: () => void;
  isRunning: boolean;
  disabled?: boolean;
}

/**
 * Drop zone where the player builds their program by adding commands.
 */
export const CommandSequence = memo(function CommandSequence({
  commands,
  currentExecutingIndex,
  maxMoves,
  onRemoveCommand,
  onClearAll,
  onRun,
  isRunning,
  disabled = false,
}: CommandSequenceProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: "command-sequence",
  });

  const commandsUsed = commands.length;
  const isOverLimit = commandsUsed > maxMoves;

  return (
    <div
      className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border-2 border-gray-200 shadow-md"
      dir="rtl"
    >
      {/* Header with controls */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-rubik font-bold text-gray-700">
          התוכנית שלך
        </h3>
        <div className="flex items-center gap-2">
          <span
            className={`
              text-xs font-medium px-2 py-1 rounded-full
              ${
                isOverLimit
                  ? "bg-red-100 text-red-700"
                  : commandsUsed > 0
                  ? "bg-cyan-100 text-cyan-700"
                  : "bg-gray-100 text-gray-600"
              }
            `}
          >
            {commandsUsed}/{maxMoves} פקודות
          </span>
        </div>
      </div>

      {/* Commands drop zone */}
      <div
        ref={setNodeRef}
        className={`
          min-h-[120px] p-3 rounded-xl
          border-2 border-dashed
          transition-all duration-200
          flex flex-wrap gap-2 content-start
          ${
            isOver
              ? "border-cyan-500 bg-cyan-50/50"
              : commands.length === 0
              ? "border-gray-300 bg-gray-50/50"
              : "border-gray-300 bg-white/50"
          }
          ${isOverLimit ? "border-red-400 bg-red-50/30" : ""}
        `}
      >
        {commands.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
            {isOver ? "שחרר כאן" : "גרור פקודות לכאן"}
          </div>
        ) : (
          commands.map((cmd, index) => (
            <SequenceCommand
              key={cmd.id}
              command={cmd}
              index={index}
              isExecuting={currentExecutingIndex === index}
              onRemove={onRemoveCommand}
              disabled={disabled || isRunning}
            />
          ))
        )}
      </div>

      {/* Warning message if over limit */}
      {isOverLimit && (
        <p className="text-xs text-red-600 mt-2 text-center">
          חרגת ממספר הפקודות המותר!
        </p>
      )}

      {/* Action buttons */}
      <div className="flex items-center justify-between mt-3 gap-2">
        <button
          onClick={onClearAll}
          disabled={commands.length === 0 || isRunning || disabled}
          className={`
            flex items-center gap-1.5 px-3 py-2 rounded-lg
            text-sm font-medium
            transition-all duration-200
            ${
              commands.length === 0 || isRunning || disabled
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }
          `}
        >
          <Trash2 size={16} />
          נקה הכל
        </button>

        <button
          onClick={onRun}
          disabled={commands.length === 0 || isRunning || isOverLimit || disabled}
          className={`
            flex items-center gap-1.5 px-4 py-2 rounded-lg
            text-sm font-medium
            transition-all duration-200
            ${
              commands.length === 0 || isRunning || isOverLimit || disabled
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-cyan-600 text-white hover:bg-cyan-700 shadow-md hover:shadow-lg"
            }
          `}
        >
          <Play size={16} />
          {isRunning ? "מריץ..." : "הרץ"}
        </button>
      </div>
    </div>
  );
});
