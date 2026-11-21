### File layout and naming

- Test files are `kebab-case.test.ts`, colocated with the source: `tools.ts` → `tools.test.ts`.
- Shared fixtures and helpers live in `src/test-support/` (e.g. `fake-client.ts`, `fixtures.ts`). Never import from one test file into an
other.
- One top-level `describe` per exported function or module, named exactly after it: `describe("executeTool", ...)`.
- Test names (`it`) state behavior as a full sentence, `"<does X> when <condition>"`:
  - `it("returns an is_error tool_result when the tool name is unknown")`
  - `it("throws when stop_reason is unrecognized")`
- Name by observable behavior, not implementation. No `test1`, `works`, or `should` prefixes.
- Variables follow the main naming table. Prefer `actual` / `expected` for the compared pair.

### Test structure

- Arrange / Act / Assert, separated by blank lines. No logic (loops, conditionals) inside a test body.
- One behavior per test. Several assertions are fine if they describe the same outcome.
- Tests must be independent and order-agnostic. Reset shared state in `beforeEach`, never rely on a previous test.
- Cover the error paths the standards require: unknown tool, invalid tool input, tool throwing, `MAX_ITERATIONS` reached, unknown `stop_r
eason`.

### Assertions

- Import from `node:assert/strict` only; strict mode makes `equal` use `===` and `deepEqual` use strict comparison.
- Use `assert.equal` for primitives, `assert.deepEqual` for objects and arrays.
- Use `assert.throws` / `assert.rejects` with a matcher (class and message pattern). A bare `assert.throws(fn)` is not allowed.
- Assert on the specific field that matters (`result.is_error`, `result.tool_use_id`), not on whole serialized blobs or snapshots.
- Never assert on stack traces, file paths, or timestamps. Error-message assertions use a stable substring or regex.
- No `try/catch` in tests to check errors; no empty or tautological assertions (`assert.ok(true)`).

### Fixtures and mocks

- **No real network calls and no real API key.** The Anthropic client is injected (or stubbed) with a fake that returns scripted `Message
` responses in order.
- Build fixtures with small factory functions that take overrides, e.g. `makeToolUseBlock({ name: "get_weather" })`, so each test only st
ates the fields it cares about. Defaults live in the factory.
- Fixtures are plain typed objects: no `any`, no `as` casts. Use the SDK types with `import type`.
- Fixture constants are `UPPER_SNAKE_CASE` (`WEATHER_TOOL_USE`); factories are `makeXxx` (verb-first).
- Don't share mutable fixtures between tests; create fresh ones per test or deep-copy.
- Mock only at boundaries (the API client, filesystem, clock). Never mock the function under test or pure internal helpers.
- Fake data uses obviously fake values; no real personal data, keys, or tokens.

### Running tests

- `npm run typecheck` must still pass with test files included.
- Tests must be deterministic and fast (no sleeps, no real timers; use fake timers if time matters).
- Remove `.only` / `.skip` before committing; a skipped test needs a linked reason in a comment.
