# Architecture

## Frontend Baseline (framework-agnostic)
- Every project has a frontend with, at minimum: landing page, sign in,
  sign up, user profile, and dashboard.
- Dashboard layout: collapsible left sidebar menu, top navbar with the
  user icon right-aligned, opening a dropdown menu linking to profile and
  logout.
- Auth UX flow: on successful sign up, redirect to sign in (no
  auto-login); on first access after sign in, load the profile page for
  initial setup before the dashboard.

## Backend Stack (default)
- Latest .NET (Web API).
- Entity Framework Core — SQLite for development, SQL Server for
  production.
- JWT Bearer authentication, bridged with Google OAuth where applicable.
- Serilog logging.
- Swagger enabled with JWT support.

## Backend Architecture
- Feature-based folders (`Domain/`, `Features/`, `Infrastructure/`,
  `BackgroundServices/`).
- Controllers contain no business rules; services contain business rules.
- Manual mapping (no AutoMapper).
- Fluent API with `IEntityTypeConfiguration`.
- Dependency injection through extension methods — one
  `*FeatureExtensions.cs` per feature.
- `Program.cs` never references a project service directly. Every
  registration is composed through a single `ApplicationServicesExtensions`
  class (`Extensions/ApplicationServicesExtensions.cs`) that calls the
  per-feature/per-infrastructure extension methods; `Program.cs` only
  calls that one method.
- ProblemDetails-based exception handling (`AddExceptionHandler<T>()` +
  `AddProblemDetails()`).
- Access tokens (issued on sign in) expire after 2 hours.
- External integrations (weather, currency, lodging, events, payments,
  etc.) live behind an interface per source
  (`Infrastructure/<Source>/I<Source>Provider.cs`) so providers can be
  swapped without touching domain/feature code.
- External data is cached, not fetched live per request, when the data
  changes slowly — a `BackgroundService` on a `PeriodicTimer` refreshes it.
