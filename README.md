# agentic-loop

A minimal agentic loop built with TypeScript and the `@anthropic-ai/sdk`. The agent sends a prompt to Claude, runs any tools the model requests, feeds the results back, and repeats until the model finishes (`end_turn`) or the iteration cap is hit.

## Setup

```bash
npm install
export ANTHROPIC_API_KEY=your-key-here
```

## Usage

```bash
npm start          # runs src/index.ts via tsx
npm run typecheck  # type-check the project
```

## How it works

- `src/agent.ts` — `runAgent(prompt)` drives the loop. It branches on `stop_reason`, pairs each `tool_use` with a `tool_result`, and stops after `MAX_ITERATIONS` (20).
- `src/tools.ts` — tool definitions and `executeTool` dispatcher.
- `src/index.ts` — entry point.

### Tools

| Tool | Description |
|---|---|
| `calculator` | Evaluates a basic arithmetic expression |
| `web_search` | Mock search returning canned population data |

## Conventions

See [`.claude/CLAUDE.md`](.claude/CLAUDE.md) for coding standards and [`.claude/rules/testing.md`](.claude/rules/testing.md) for testing rules.
