# API Package Conventions

Rules specific to `packages/api`. These add to the repo-wide standards in the
root `.claude/CLAUDE.md` (naming, TypeScript, error handling); they don't replace them.

## REST Endpoint Naming

- Paths are `kebab-case`, lowercase, and use **plural nouns** for collections: `/api/v1/tool-calls`, not `/api/v1/getToolCall`.
- No verbs in paths. The HTTP method carries the action.
- Nest at most two levels: `/agents/{agentId}/runs`. Beyond that, promote the child to a top-level resource with a filter.
- Path parameters are `camelCase` and named by resource: `{agentId}`, not `{id}`.
- Query parameters are `camelCase`: `?pageSize=20&sortBy=createdAt`.
- Version in the path prefix (`/api/v1/...`). Breaking changes require a new version.
- Non-CRUD actions are modeled as a sub-resource noun (`POST /runs/{runId}/cancellation`), not a verb path.

| Method | Use | Success status |
|---|---|---|
| `GET` | Read a resource or collection (safe, idempotent) | `200` |
| `POST` | Create a resource or trigger an action | `201` (created, with `Location` header) / `202` (async) |
| `PUT` | Full replace (idempotent) | `200` |
| `PATCH` | Partial update | `200` |
| `DELETE` | Remove a resource (idempotent) | `204` |

## Request Schemas

- Every endpoint defines a schema for its body, path params, and query params. No endpoint reads `req.body` unvalidated.
- Validate at the boundary and reject before any business logic runs. Treat all input as untrusted.
- Schemas are the single source of truth: derive TypeScript types from them (e.g. `z.infer`) rather than writing types by hand.
- Reject unknown fields rather than silently ignoring them.
- JSON property names are `camelCase`.
- Request bodies are `application/json`. Return `415` for other content types.
- Set explicit limits: max string lengths, array sizes, and body size.
- List endpoints accept `pageSize` (with a documented default and max) and a cursor (`cursor`) for pagination.

## Response Schemas

- Every endpoint defines a response schema per status code, including error responses.
- JSON property names are `camelCase`. Timestamps are ISO 8601 UTC strings (`2026-01-31T12:00:00Z`). IDs are strings.
- Single resources are returned as the object itself. Collections use an envelope:

  ```json
  { "items": [], "nextCursor": null }
  ```

- Never return `null` to mean "not found"; use `404`.
- Never expose internal fields (database keys, stack traces, file system paths, secrets) in any response.
- Don't return different shapes for the same endpoint and status code.

## Error Responses

- All errors use one shape:

  ```json
  { "error": { "code": "invalid_request", "message": "pageSize must be at most 100", "details": [] } }
  ```

- `code` is a stable `snake_case` string clients can branch on. `message` is short, human-readable, and actionable.
- Use the correct status code: `400` validation, `401` unauthenticated, `403` unauthorized, `404` not found, `409` conflict, `422` semantic validation failure, `429` rate limited, `500` unexpected.
- `5xx` responses return a generic message. Log the detail server-side with context; never leak it to the client.
- Errors must be logged with the request ID, never with request bodies containing sensitive data or API keys.

## Handlers and Layout

- Handlers stay thin: parse and validate, call a service function, map the result to a response. Business logic does not live in handlers.
- Handler and route files use `kebab-case.ts`; export handlers as verb-first functions (`createRun`, `listRuns`).
- Every response includes a request ID header (`X-Request-Id`) that also appears in logs.

## Docs and Tests

- New or changed endpoints update the API documentation (OpenAPI spec or README) in the same PR.
- Each endpoint has tests for: the success path, an invalid request (`400`/`422`), and a not-found or unauthorized case.
- Breaking changes to a request or response schema are called out in the PR description.
