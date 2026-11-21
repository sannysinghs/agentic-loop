# Project Coding Standards

Team-wide conventions for this repo (TypeScript, ESM, Node, `@anthropic-ai/sdk`).
This file is project-level and committed to version control so every contributor
and every Claude Code session gets the same rules. Personal preferences belong in
`~/.claude/CLAUDE.md`, not here.

## Commands

- `npm run typecheck` — must pass before any commit
- `npm start` — runs `src/index.ts` via `tsx`

## Naming Conventions

| Thing | Convention | Example |
|---|---|---|
| Variables, functions, parameters | `camelCase` | `runAgent`, `toolResults` |
| Types, interfaces, classes | `PascalCase` | `ToolDefinition` |
| Module-level constants | `UPPER_SNAKE_CASE` | `MAX_ITERATIONS`, `MODEL` |
| Files | `kebab-case.ts` (or single lowercase word) | `agent.ts`, `tool-registry.ts` |
| Booleans | prefix `is` / `has` / `should` / `can` | `isDone`, `hasToolCalls` |
| Functions | verb-first, describe the action | `executeTool`, `parseInput` |
| Tool names exposed to the model | `snake_case`, verb_noun | `get_weather` |

Rules:
- No abbreviations except universal ones (`id`, `url`, `err` in a catch block).
- No single-letter names except trivial loop indices or short lambdas (`b => b.type`).
- Don't prefix interfaces with `I` or suffix types with `Type`.
- Name by what something *is*, not how it's implemented.

## TypeScript

- `strict` stays on. No `any`; use `unknown` and narrow.
- Use `import type` for type-only imports.
- Relative imports use the `.js` extension (NodeNext resolution), e.g. `./tools.js`.
- Prefer `===` / `!==`.
- Prefer `const`; use `let` only when reassigned.
- Declare explicit return types on exported functions.
- Use type guards over `as` casts.

## Error Handling

1. **Never swallow errors.** Every `catch` must handle, log with context, or rethrow. Empty catch blocks are not allowed.
2. **Narrow `unknown`.** Use `err instanceof Error ? err.message : String(err)`.
3. **Throw `Error` (or subclasses), never strings or plain objects.**
4. **Fail fast on programmer errors** (invalid state, unexpected `stop_reason`): throw.
5. **Recover at boundaries only** (I/O, network, tool execution). Don't wrap every line in try/catch.
6. **Add context when rethrowing**: `throw new Error("Failed to load config", { cause: err })`.
7. **Validate input at the boundary** (CLI args, tool input from the model, API responses). Internal code can trust validated types.
8. **No silent fallbacks.** Don't return a default value to hide a failure unless the default is documented.
9. **Unbounded loops need a cap** and must report clearly when the cap is hit (see `MAX_ITERATIONS`).

### Agentic loop / tool errors

- Tool failures must be returned to the model as a `tool_result` with `is_error: true` and a short, actionable message, so the model can retry or adapt. Do not crash the loop for a recoverable tool failure.
- Never leak stack traces, secrets, or file system paths in tool error messages.
- Always pair every `tool_use` block with a `tool_result` carrying the same `tool_use_id`.
- Branch on `stop_reason` explicitly; treat unknown values as an error.
- Log iteration, tool name, and outcome. Never log API keys or full sensitive payloads.

## Code Style

- Match the existing formatting of the file you're editing; don't reformat unrelated lines.
- Prefer small, single-purpose functions. If a function needs a comment to explain *what* it does, split or rename it.
- Comments explain *why*, not *what*. Delete commented-out code.
- No magic numbers or strings: extract named constants.
- No dead code, unused imports, or stray `console.log` debug output in committed code.
- Never hard-code secrets. Read them from environment variables (the SDK reads `ANTHROPIC_API_KEY` itself).

## Code Review Checklist

Reviewers and authors both run through this list. Check each item or mark it N/A.

### Correctness
- [ ] Does the change do what the PR description says?
- [ ] Are edge cases handled (empty input, null/undefined, large input, timeouts)?
- [ ] Are the correct values passed to functions (right argument, right field)?
- [ ] Do loops terminate, with a bounded iteration count?
- [ ] Are async calls awaited, and are promise rejections handled?

### Error handling
- [ ] No swallowed errors or empty `catch` blocks
- [ ] Errors carry context and use `Error` objects
- [ ] Tool errors return `is_error: true` results instead of crashing the loop
- [ ] External input is validated before use

### Naming and readability
- [ ] Names follow the conventions above and reveal intent
- [ ] Functions are small and single-purpose
- [ ] No magic values, dead code, or leftover debug logging
- [ ] Comments explain *why* where non-obvious

### Types
- [ ] No `any`, no unchecked `as` casts
- [ ] Exported functions have explicit return types
- [ ] `npm run typecheck` passes

### Security and privacy
- [ ] No secrets, tokens, or personal data in code, logs, or tests
- [ ] Model/tool input is treated as untrusted
- [ ] No unsafe shell, `eval`, or path-traversal patterns

### Tests and scope
- [ ] New behavior has tests, or the PR explains why not
- [ ] Existing tests still pass
- [ ] The diff contains only changes related to the PR; unrelated refactors go in a separate PR
- [ ] New dependencies are justified and necessary

### Docs
- [ ] Public behavior changes are reflected in docs or README
- [ ] Breaking changes are called out in the PR description
