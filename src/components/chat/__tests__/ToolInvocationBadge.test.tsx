import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolInvocationBadge, getToolLabel } from "../ToolInvocationBadge";

afterEach(() => cleanup());

// ---------------------------------------------------------------------------
// getToolLabel — str_replace_editor
// ---------------------------------------------------------------------------

test("getToolLabel: str_replace_editor create", () => {
  expect(
    getToolLabel("str_replace_editor", {
      command: "create",
      path: "/components/Card.jsx",
    })
  ).toBe("Creating Card.jsx");
});

test("getToolLabel: str_replace_editor str_replace", () => {
  expect(
    getToolLabel("str_replace_editor", {
      command: "str_replace",
      path: "/App.tsx",
    })
  ).toBe("Editing App.tsx");
});

test("getToolLabel: str_replace_editor insert", () => {
  expect(
    getToolLabel("str_replace_editor", {
      command: "insert",
      path: "/src/utils.ts",
    })
  ).toBe("Editing utils.ts");
});

test("getToolLabel: str_replace_editor view", () => {
  expect(
    getToolLabel("str_replace_editor", { command: "view", path: "/index.tsx" })
  ).toBe("Reading index.tsx");
});

test("getToolLabel: str_replace_editor undo_edit", () => {
  expect(
    getToolLabel("str_replace_editor", {
      command: "undo_edit",
      path: "/App.jsx",
    })
  ).toBe("Undoing edit in App.jsx");
});

test("getToolLabel: str_replace_editor unknown command falls back", () => {
  expect(
    getToolLabel("str_replace_editor", { command: "unknown", path: "/App.jsx" })
  ).toBe("Editing file");
});

test("getToolLabel: str_replace_editor missing path uses 'file'", () => {
  expect(getToolLabel("str_replace_editor", { command: "create" })).toBe(
    "Creating file"
  );
});

test("getToolLabel: str_replace_editor uses only the filename, not the full path", () => {
  expect(
    getToolLabel("str_replace_editor", {
      command: "create",
      path: "/deeply/nested/dir/Button.tsx",
    })
  ).toBe("Creating Button.tsx");
});

// ---------------------------------------------------------------------------
// getToolLabel — file_manager
// ---------------------------------------------------------------------------

test("getToolLabel: file_manager rename", () => {
  expect(
    getToolLabel("file_manager", {
      command: "rename",
      path: "/old/Button.jsx",
      new_path: "/new/Button.tsx",
    })
  ).toBe("Renaming Button.jsx → Button.tsx");
});

test("getToolLabel: file_manager rename missing new_path", () => {
  expect(
    getToolLabel("file_manager", { command: "rename", path: "/Button.jsx" })
  ).toBe("Renaming Button.jsx → new name");
});

test("getToolLabel: file_manager delete", () => {
  expect(
    getToolLabel("file_manager", { command: "delete", path: "/Button.jsx" })
  ).toBe("Deleting Button.jsx");
});

test("getToolLabel: file_manager unknown command falls back", () => {
  expect(
    getToolLabel("file_manager", { command: "unknown", path: "/Button.jsx" })
  ).toBe("Managing file");
});

test("getToolLabel: file_manager missing path uses 'file'", () => {
  expect(getToolLabel("file_manager", { command: "delete" })).toBe(
    "Deleting file"
  );
});

// ---------------------------------------------------------------------------
// getToolLabel — unknown tool
// ---------------------------------------------------------------------------

test("getToolLabel: unknown tool returns tool name as-is", () => {
  expect(getToolLabel("some_other_tool", {})).toBe("some_other_tool");
});

// ---------------------------------------------------------------------------
// ToolInvocationBadge component
// ---------------------------------------------------------------------------

test("ToolInvocationBadge renders label for str_replace_editor create", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        state: "call",
        toolName: "str_replace_editor",
        args: { command: "create", path: "/App.jsx" },
      }}
    />
  );
  expect(screen.getByText("Creating App.jsx")).toBeDefined();
});

test("ToolInvocationBadge renders label for file_manager delete", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        state: "result",
        toolName: "file_manager",
        args: { command: "delete", path: "/old.jsx" },
        result: { success: true },
      }}
    />
  );
  expect(screen.getByText("Deleting old.jsx")).toBeDefined();
});

test("ToolInvocationBadge shows spinner when not yet complete", () => {
  const { container } = render(
    <ToolInvocationBadge
      toolInvocation={{
        state: "call",
        toolName: "str_replace_editor",
        args: { command: "str_replace", path: "/App.jsx" },
      }}
    />
  );
  expect(container.querySelector(".animate-spin")).toBeDefined();
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
});

test("ToolInvocationBadge shows done indicator when state is result with a result value", () => {
  const { container } = render(
    <ToolInvocationBadge
      toolInvocation={{
        state: "result",
        toolName: "str_replace_editor",
        args: { command: "create", path: "/App.jsx" },
        result: "File created",
      }}
    />
  );
  expect(container.querySelector(".bg-emerald-500")).toBeDefined();
  expect(container.querySelector(".animate-spin")).toBeNull();
});

test("ToolInvocationBadge still shows spinner when state is result but result is null", () => {
  const { container } = render(
    <ToolInvocationBadge
      toolInvocation={{
        state: "result",
        toolName: "str_replace_editor",
        args: { command: "create", path: "/App.jsx" },
        result: null,
      }}
    />
  );
  expect(container.querySelector(".animate-spin")).toBeDefined();
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
});
