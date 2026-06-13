# Lint Warnings Backlog

Tracked after the systematic lint fix (Step 6). **219 warnings** remain as of the final run.

## Bucket 1 — Fixed (quick wins, auto-fixable)

Applied via ESLint `--fix`:

- `import/order` — import grouping and alphabetization
- `import/newline-after-import` — blank line after import blocks
- `@typescript-eslint/consistent-type-imports` — partial fix (3 remain where manual review needed)

**Result:** Warnings reduced from **232 → 219** (−13).

## Bucket 2 — Fix during Part 6 refactor (architecture-tied)

| Rule                            | Count | Defer reason                                                       |
| ------------------------------- | ----- | ------------------------------------------------------------------ |
| `max-lines-per-function`        | 8     | BookingService and related services will be split via event bus    |
| `explicit-function-return-type` | 3     | Service signatures will be tightened during refactor               |
| `no-unsafe-assignment`          | 4     | CalendarProvider interface will remove unknown API response shapes |
| `no-unsafe-argument`            | 8     | Same — provider response typing not yet finalized                  |
| `max-params`                    | 5     | Constructor/param lists will shrink when services are decomposed   |
| `prefer-destructuring`          | 4     | Low priority; address during service cleanup                       |

**Subtotal deferred:** ~32 warnings (excluding naming-convention noise)

## Bucket 3 — Accept and document (library boundary noise)

### `@typescript-eslint/naming-convention` (184 warnings)

Prisma schema, API constants, and DB column names intentionally use `snake_case` / `SCREAMING_SNAKE_CASE` to match PostgreSQL and HTTP conventions. Renaming would break API contracts and Prisma mappings.

**Policy:** Leave as warnings. Do not rename DB fields or HTTP status constants to camelCase.

### `@typescript-eslint/no-unsafe-member-access` on Prisma nested includes

Prisma's generated types are correct; the linter cannot always see through generic include shapes.

**Policy:** When a specific line is flagged during development, suppress inline:

```typescript
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- Prisma nested include, type is safe
```

Currently **0** active suppressions needed — no remaining errors of this type after config downgrade.

## Final Warning Count

| Metric                            | Value   |
| --------------------------------- | ------- |
| Total warnings                    | **219** |
| Deferred to Part 6                | **~32** |
| Accepted (naming-convention)      | **184** |
| Remaining consistent-type-imports | **3**   |

## Commands

```bash
# Development (shows warnings, fails only on errors)
pnpm lint

# CI strict mode (zero warnings required)
pnpm lint:strict

# Auto-fix Bucket 1 rules
npx eslint src --ext .ts --fix \
  --rule '{"import/order":"warn"}' \
  --rule '{"@typescript-eslint/consistent-type-imports":"warn"}'
```
