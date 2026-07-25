# Subscription Billing Platform — Implementation Plan

Source brief: `docs/documentation.txt`. AI operating rules and technology constraints: `.ia/00-project.md`, `.ia/10-backend.md`, `.ia/20-frontend.md`, `.ia/30-conventions.md`. This document translates the brief into a concrete architecture and roadmap, filling gaps the brief leaves open (documented below as explicit assumptions).

## 1. Overview

A subscription billing platform that manages the full lifecycle of recurring subscriptions: plans, subscribers, subscriptions, trials, renewals, upgrades/downgrades, suspensions, reactivations and cancellations.

Explicit scope exclusions for this phase:
- No Stripe integration.
- No real payment gateway integration — payments are processed through a mocked gateway abstraction (see §5).
- No subscriber self-service portal — this MVP ships an admin panel only.

Technical demonstration goals (from the brief): a rich domain model (business rules live on entities, not in anemic services), scheduled processing, and background services.

## 2. Assumptions

The brief (`docs/documentation.txt`) does not define these details; the following defaults were chosen to keep the MVP simple (KISS/YAGNI) and were confirmed with the product owner:

| Topic | Assumption |
|---|---|
| Payments | Mocked via an `IPaymentGateway` abstraction (see §5). No real money moves in this phase. |
| Billing cycles | Monthly and annual, selectable per plan. |
| Currency | Single currency, modeled as a `Money` value object for future extensibility. |
| Trial | Configurable trial length (in days) per plan; zero days means no trial. |
| Suspension | A subscription is suspended after its mocked charge attempt fails at renewal time. |
| Reactivation | An admin can reactivate a suspended subscription, which re-attempts the charge and resumes the normal cycle. |
| Cancellation | Cancellation takes effect at the end of the current billing period (no immediate cutoff, no refund logic). |
| Upgrade/Downgrade | Takes effect on the next renewal — no proration/rate mid-cycle. |
| Frontend audience | Admin/back-office only; no subscriber-facing UI. |
| Scheduling | A single in-process `.NET BackgroundService` with a periodic timer (no external scheduler). |

## 3. Domain Model

Rich domain model: state transitions and invariants are implemented as methods on the entities, not as logic scattered across services.

**Entities**

- `Plan` — name, description, `Money` price, `BillingCycle` (Monthly/Annual), trial length in days, active/archived flag.
- `Subscriber` — name, email, created date.
- `Subscription` — references a `Subscriber` and a `Plan`; owns the lifecycle state machine and dates (`StartedAt`, `TrialEndsAt`, `CurrentPeriodEnd`, `NextChargeAt`, `CancelledAt`). Also holds a pending plan change (`PendingPlanId`) used by upgrade/downgrade until the next renewal.
- `ChargeAttempt` — records each attempt to charge a subscription at renewal (subscription id, timestamp, result, gateway reference). Gives an audit trail and something for a future retry/dunning policy to read.

**Value Objects**

- `Money` (amount + currency) — even with a single currency today, wrapping it avoids sprinkling `decimal` through the domain.
- `BillingCycle` — enum: `Monthly`, `Annual`, with a method to compute the next period end from a given date.

**Subscription state machine**

```
Trialing → Active → PastDue → Suspended → Cancelled
                ↘________________↗ (Reactivate)
Active/Trialing → Cancelled (at period end)
Active → Expired (if no renewal path applies, e.g. plan archived)
```

Representative domain methods on `Subscription`: `StartTrial()`, `ActivateAfterTrial()`, `Renew(ChargeAttempt)`, `MarkPastDue()`, `Suspend()`, `Reactivate()`, `Cancel()`, `ScheduleUpgrade(Plan)`, `ScheduleDowngrade(Plan)`, `ApplyPendingPlanChange()`.

## 4. Business Rules

- **Next charge date**: computed from `CurrentPeriodEnd` using the plan's `BillingCycle`; recalculated every time a subscription renews.
- **Trial expiration**: when `TrialEndsAt` passes, the subscription attempts its first charge and transitions to `Active` or `PastDue`.
- **Renewal**: on reaching `NextChargeAt`, the background service asks `IPaymentGateway` to charge the subscription; success renews the period, failure marks it `PastDue`.
- **Suspension**: a subscription left `PastDue` past a grace period (default: the same billing cycle length) is suspended.
- **Reactivation**: an admin action that re-attempts the charge for a suspended subscription; success returns it to `Active` and recomputes `NextChargeAt`.
- **Cancellation**: sets `CancelledAt` and stops future renewals, but leaves the subscription `Active` until `CurrentPeriodEnd`, then transitions to `Cancelled`.
- **Upgrade/Downgrade**: sets `PendingPlanId`; the background service applies the pending plan at the next renewal instead of at request time.
- **Expiration**: a subscription whose plan has been archived and has no valid renewal target expires instead of renewing.

## 5. Backend Architecture

Stack and conventions per `.ia/10-backend.md` and `.ia/30-conventions.md`.

- **Stack**: .NET 10, ASP.NET Core Web API, Entity Framework Core, SQLite (Development), SQL Server (Production).
- **Structure**: feature-based folders (e.g. `Features/Plans`, `Features/Subscribers`, `Features/Subscriptions`), each containing its controller, DTOs, service, and EF configuration. Controllers orchestrate only; business rules live in the domain entities and application services.
- **Persistence**: EF Core with Fluent API (`IEntityTypeConfiguration<T>` per entity), manual DTO mapping (no AutoMapper).
- **Payments**: `IPaymentGateway` interface (`ChargeAsync(subscriptionId, amount)`) with a `MockPaymentGateway` implementation (configurable success/failure for demoing suspension/reactivation). Real gateways (Mercado Pago, PayPal) can later implement the same interface without touching the domain (§7).
- **Scheduling**: `SubscriptionBillingBackgroundService : BackgroundService` running on a periodic timer; each tick loads subscriptions due for trial-expiry, renewal, suspension-grace-period-check, or pending-plan-change application, and invokes the corresponding domain methods.
- **Auth**: JWT Bearer for the admin panel; Swagger UI configured with JWT support.
- **Cross-cutting**: global exception middleware, Serilog structured logging, DI registration via extension methods (`AddPlansFeature()`, etc.), minimal `Program.cs`.
- **Git**: repository initialized with a .NET `.gitignore` (per `.ia/10-backend.md`) — not yet done; ask for confirmation before creating the `backend/` folder, per `.ia/00-project.md`.

## 6. Frontend Architecture

Stack and folder layout per `.ia/20-frontend.md` (admin panel only, per confirmed scope).

- **Stack**: React 19, TypeScript, Vite, Tailwind CSS, Axios, React Router, TanStack Query, React Hook Form, Zod.
- **Structure**: `src/{api,components,features,hooks,layouts,pages,routes,services,stores,types,utils}`.
- **Pages**: Login; Plans (list/create/edit/archive); Subscribers (list/create/edit); Subscriptions (list/detail with lifecycle actions: cancel, suspend, reactivate, schedule upgrade/downgrade).
- **Data layer**: TanStack Query for server state, Axios client in `src/api`, Zod schemas shared with React Hook Form for validation.
- **Auth**: JWT stored client-side, protected routes via React Router, Axios interceptor attaching the bearer token.
- **Git**: repository initialized with a React `.gitignore` — ask for confirmation before creating the `frontend/` folder, per `.ia/00-project.md`.

## 7. Future / Optional

- Real payment gateway integrations (Mercado Pago, PayPal) implemented as additional `IPaymentGateway` classes — no domain changes required, only new infrastructure classes and DI wiring.
- Stripe explicitly out of scope for now, per the brief; could be added the same way later if reconsidered.

## 8. Roadmap (feature-by-feature, one completed before the next starts)

1. Solution/project setup (backend + frontend scaffolding, git init) — requires confirmation before creating `backend/`/`frontend/` folders.
2. Plans feature (domain entity + CRUD API).
3. Subscribers feature (domain entity + CRUD API).
4. Subscriptions feature: creation + trial handling.
5. Billing background service: next-charge calculation, renewal, trial expiration.
6. Suspension + reactivation.
7. Cancellation.
8. Upgrade/downgrade (applied at next renewal).
9. JWT auth + Swagger security.
10. Frontend admin panel wired to the API (all pages from §6).
11. (Optional, future) Real gateway integration — Mercado Pago and/or PayPal.

## 9. Non-Functional Notes

The brief defines no formal non-functional requirements (no performance targets, compliance regime, or scalability targets). The following are treated as baseline quality bars rather than measurable NFRs, consistent with `.ia/00-project.md`'s "production-quality MVP" philosophy:

- JWT-based authentication on all admin endpoints.
- Structured logging via Serilog.
- Centralized error handling via global exception middleware.
- No secrets or payment credentials in source control (relevant once a real gateway is added).
