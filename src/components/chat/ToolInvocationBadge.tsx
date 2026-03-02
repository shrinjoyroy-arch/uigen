"use client";

import { Loader2 } from "lucide-react";

export interface ToolInvocationArgs {
  command?: string;
  path?: string;
  new_path?: string;
  [key: string]: unknown;
}

export interface ToolInvocationData {
  state: string;
  toolName: string;
  args: ToolInvocationArgs;
  result?: unknown;
}

function getFileName(path: string): string {
  return path.split("/").filter(Boolean).pop() ?? path;
}

export function getToolLabel(
  toolName: string,
  args: ToolInvocationArgs
): string {
  if (toolName === "str_replace_editor") {
    const file = args.path ? getFileName(args.path) : "file";
    switch (args.command) {
      case "create":
        return `Creating ${file}`;
      case "str_replace":
        return `Editing ${file}`;
      case "insert":
        return `Editing ${file}`;
      case "view":
        return `Reading ${file}`;
      case "undo_edit":
        return `Undoing edit in ${file}`;
      default:
        return "Editing file";
    }
  }

  if (toolName === "file_manager") {
    const file = args.path ? getFileName(args.path) : "file";
    switch (args.command) {
      case "rename": {
        const newFile = args.new_path
          ? getFileName(args.new_path)
          : "new name";
        return `Renaming ${file} → ${newFile}`;
      }
      case "delete":
        return `Deleting ${file}`;
      default:
        return "Managing file";
    }
  }

  return toolName;
}

interface ToolInvocationBadgeProps {
  toolInvocation: ToolInvocationData;
}

export function ToolInvocationBadge({
  toolInvocation,
}: ToolInvocationBadgeProps) {
  const { state, toolName, args, result } = toolInvocation;
  const isDone = state === "result" && result != null;
  const label = getToolLabel(toolName, args);

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs border border-neutral-200">
      {isDone ? (
        <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600 flex-shrink-0" />
      )}
      <span className="text-neutral-700">{label}</span>
    </div>
  );
}
