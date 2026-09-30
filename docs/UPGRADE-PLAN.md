# Upgrade plan

## Current state: 7/10 (was 4/10)

The directory is a working local CRUD tool with real links, validated
storage, tested model, clean lint, and CI.

## Backlog

### P0
- (none open)

### P1
- Confirm canonical domain; set `NEXT_PUBLIC_SITE_URL`.
- Split the single-line JSX in `app/page.tsx` into small components.

### P2
- Edit title/description/link in place (only status is editable today).
- Drop unused Geist font variables if the DM Mono stack is final.

## Done in this pass
- `lib/channels.ts` (unit-tested): URL sanitising, storage validation and
  repair, create/filter/status update.
- "Open channel" was a dead `href="#"`; rooms now store an optional link.
- Status can be changed per room; status dots have text for screen readers;
  add-form errors are announced; `aria-expanded` on the form toggle.
- Fixed lint errors (html link for `/`, setState-in-effect, MCP `any`s);
  storage writes no longer throw when blocked.
- Replaced stub `/api/mcp` with honest `describe_directory` / `validate_room`.
- CI (lint, typecheck, test, build); metadata canonical; robots/sitemap.

## Done in this pass (pass 2)
- JSON backup: Export downloads the directory (`exportChannels`), Import merges a file (`importChannels`: accepts the export envelope or a bare array, validates like stored data incl. unsafe-link stripping, never overwrites existing ids) with a visible `role="status"` result. Tested in `tests/channels.test.ts`.
- Checked cross-repo consistency: sitemap/robots already generated from `lib/site.ts` + `NEXT_PUBLIC_SITE_URL`; no stale static files.
