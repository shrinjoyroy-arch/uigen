# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# First-time setup (install deps, generate Prisma client, run migrations)
npm run setup

# Development server (Turbopack)
npm run dev

# Build
npm run build

# Lint
npm run lint

# Run all tests
npm test

# Run a single test file
npm test -- src/components/chat/__tests__/ChatInterface.test.tsx

# Reset database
npm run db:reset
```

All Next.js scripts use `NODE_OPTIONS='--require ./node-compat.cjs'` — this shim is required; don't remove it.

## Architecture

UIGen is an AI-powered React component generator. The user describes a component in the chat, Claude generates code using tool calls, and the result is rendered in a live preview — all without writing any files to disk.

### Virtual File System

`src/lib/file-system.ts` — The central abstraction. `VirtualFileSystem` is an in-memory file tree. All generated code lives here. It serializes to a plain `Record<string, FileNode>` for transport and Prisma storage, and deserializes back via `deserializeFromNodes`.

### AI Tool Loop (`src/app/api/chat/route.ts`)

The chat API reconstructs a `VirtualFileSystem` from the serialized state sent with each request, then runs `streamText` with two tools:

- **`str_replace_editor`** (`src/lib/tools/str-replace.ts`) — view, create, str_replace, and insert on the VFS
- **`file_manager`** (`src/lib/tools/file-manager.ts`) — rename and delete on the VFS

The AI model is `claude-haiku-4-5`. If `ANTHROPIC_API_KEY` is absent, `MockLanguageModel` in `src/lib/provider.ts` returns hardcoded static components instead.

On finish, if a `projectId` is present and the user is authenticated, the full message history and serialized VFS are saved to the `Project` row in SQLite.

### Client State

Two React contexts wire the client together:

- **`FileSystemContext`** (`src/lib/contexts/file-system-context.tsx`) — holds the `VirtualFileSystem` instance, exposes file CRUD, and owns `handleToolCall` which dispatches incoming AI tool calls back into the VFS. A `refreshTrigger` counter increments on every mutation to force re-renders.
- **`ChatContext`** (`src/lib/contexts/chat-context.tsx`) — wraps Vercel AI SDK's `useChat`, passing the serialized VFS as part of the request body and routing `onToolCall` events to `FileSystemContext.handleToolCall`.

### Preview Rendering (`src/lib/transform/`)

`jsx-transformer.ts` runs in the browser:

1. **`transformJSX`** — Compiles `.jsx`/`.tsx` files with `@babel/standalone` (React automatic runtime, TypeScript preset).
2. **`createImportMap`** — Transforms all VFS files into blob URLs and builds an ES module import map. Third-party packages are resolved via `https://esm.sh/`. Local files missing from the VFS get placeholder stub modules so the preview doesn't crash. CSS files are collected and injected as a `<style>` tag.
3. **`createPreviewHTML`** — Emits an HTML document with the import map, an error boundary, and a dynamic `import()` of the entry point blob URL. Tailwind CSS is loaded from CDN.

`src/components/preview/PreviewFrame.tsx` renders this HTML in a sandboxed `<iframe>`.

### Auth & Persistence

- JWT auth via `jose` stored in an `httpOnly` cookie (`src/lib/auth.ts`). `JWT_SECRET` defaults to `"development-secret-key"` when not set.
- Prisma with SQLite (`prisma/schema.prisma`). Two models: `User` (email/password) and `Project` (messages and VFS data stored as JSON strings).
- `src/middleware.ts` protects routes.

### Testing

Vitest with jsdom and React Testing Library. Tests live alongside source in `__tests__/` directories.

## Conventions

- **Comments**: Use sparingly — only on genuinely complex logic.
- **Database**: Reference `prisma/schema.prisma` to understand data models before working with database-related code.
