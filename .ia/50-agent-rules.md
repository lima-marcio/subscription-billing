# Agent Rules

## AI Autonomy
- The agent takes no action without the user's explicit confirmation —
  this includes routine development tasks, not just significant
  decisions.
- Present the intended action (and, where useful, the plan) and wait for
  the user to approve before executing it.

## Agent Operating Constraints
- Table migrations (`dotnet ef migrations add` / `database update`) are
  executed manually by a human only — never run by the agent.
- Requests to external URLs/APIs (weather, currency, lodging, events,
  OAuth, payments, etc.) are only executed during the manual testing
  phase — never triggered by the agent outside of that phase. Routine
  NuGet restore/build/list-package tooling is not covered by this
  constraint.
- Whenever a feature involves users, the following routes are required:
  register, login, logout, refresh token, and (soft) delete of users.
- Data seeds only run manually or with the user's explicit, deliberate
  confirmation (e.g. an opt-in config flag) — never automatically on
  every startup by default.
