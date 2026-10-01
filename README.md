# Community Hub

Channels and community resources.

## Features
- Add rooms (name, description, status, optional http(s) link), change
  status, remove, and search — all stored in this browser (`localStorage`).
- "Open channel" opens the saved link in a new tab; unsafe schemes
  (`javascript:`, `data:`) are rejected and corrupt saved data is repaired.
- Export the directory as JSON and import a backup (validated, merged by id)
- `/api/mcp` JSON-RPC tools: `describe_directory`, `validate_room`
  (the server never sees your entries).

## Limitations
- Local only: no sync, accounts, or membership.

## Run
```bash
npm ci
npm run dev
```

## Checks (same as CI)
```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Honesty
Portfolio demo. Not multi-tenant SaaS. Prefer local-only state over fake production claims.
