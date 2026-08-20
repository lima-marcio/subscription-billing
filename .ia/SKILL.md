---
name: dotnet-project-standards
description: Index of reusable .NET backend and cross-cutting project standards, distilled from your-next-travel. See the linked files for the full content; copy what applies into a new project's own .ia/*.md files as the starting baseline.
---

# .NET Project Standards — Summary

Baseline rules for new projects under `C:\Prototypes\.net\`. Full content
lives in the files below, split by topic:

- [`00-philosophy.md`](00-philosophy.md) — core dev principles (KISS,
  YAGNI, feature-complete work, English-only code, Git from day one).
- [`10-architecture.md`](10-architecture.md) — frontend baseline (pages,
  dashboard layout, auth UX flow), default backend stack, and backend
  architecture (feature folders, composition root, exception handling,
  token expiry, external integrations).
- [`20-coding.md`](20-coding.md) — coding conventions (one type per file,
  small methods, composition over inheritance, async/await).
- [`30-security.md`](30-security.md) — secrets management and the NuGet
  vulnerability build gate.
- [`40-workflow.md`](40-workflow.md) — Git conventions.
- [`50-agent-rules.md`](50-agent-rules.md) — AI autonomy stance and agent
  operating constraints (manual migrations, external calls, required
  auth routes, seed confirmation).

These are project-agnostic (framework/UI-agnostic where noted) — copy
what applies into the new project's own `.ia/*.md` files rather than
referencing this file at runtime.
