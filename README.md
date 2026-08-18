# Subscription Billing

An admin panel and API for managing recurring subscriptions end-to-end: plans,
subscribers, subscriptions, trials, renewals, upgrades/downgrades,
suspensions, reactivations and cancellations — without depending on a real
payment provider (Stripe is explicitly out of scope for this phase; charges go
through a mocked payment gateway).

## Features

- **Plans** — create, update, archive/unarchive recurring plans (price,
  currency, billing cycle, trial length).
- **Subscribers** — create and update customer records.
- **Subscriptions** — create a subscription for a subscriber on a plan, cancel,
  reactivate, and schedule plan changes (upgrade/downgrade).
- **Billing** — a background service periodically renews due subscriptions,
  marks failed charges as past-due, suspends subscriptions past their grace
  period, and applies pending plan changes at renewal.
- **Auth** — JWT-protected admin API and panel.

See [`docs/diagrams.md`](docs/diagrams.md#subscription-lifecycle) for the full
subscription state machine.

## Architecture

![System architecture diagram](docs/diagrams/subscription-billing.svg)

Controllers are thin and only translate HTTP ↔ DTOs; business rules live in a
`Service` per feature (`Features/Plans`, `Features/Subscribers`,
`Features/Subscriptions`, `Features/Auth`), registered via DI extension methods
called from a minimal `Program.cs`. More diagrams (including the subscription
lifecycle state machine) live in [`docs/diagrams.md`](docs/diagrams.md).

## Tech stack

| Layer | Stack |
|---|---|
| Backend | .NET 10, ASP.NET Core Web API, Entity Framework Core, PostgreSQL |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, TanStack Query, React Hook Form, Zod |
| Auth | JWT Bearer |
| Infra | Docker, Docker Compose |

## Running locally

Requires Docker (with Compose) and Node.js for the frontend.

### 1. Backend (API + PostgreSQL)

```bash
cp .env.example .env
```

Edit `.env` and fill in:

- `JWT_KEY` — any long random string (32+ characters), used to sign JWTs.
- `ADMIN_PASSWORD_HASH` — a hash generated for your chosen admin password,
  using the same algorithm as `Infrastructure/Security/PasswordHasher.cs`
  (PBKDF2-SHA256, salt.hash base64-encoded). There's no CLI command for this
  yet — generate one with a throwaway script that calls
  `PasswordHasher.Hash("your-password-here")` and prints the result, e.g. a
  one-off `dotnet run` against a `.cs` file with:

  ```csharp
  using System.Security.Cryptography;

  var salt = RandomNumberGenerator.GetBytes(16);
  var hash = Rfc2898DeriveBytes.Pbkdf2("your-password-here", salt, 100_000, HashAlgorithmName.SHA256, 32);
  Console.WriteLine($"{Convert.ToBase64String(salt)}.{Convert.ToBase64String(hash)}");
  ```

Then start the API and database:

```bash
docker compose up --build
```

- API: http://localhost:8080 (Swagger UI at `/swagger` in Development)
- PostgreSQL: `localhost:5432` (credentials from `.env`)

Migrations run automatically on startup in the `Development` environment.

### 2. Frontend (admin panel)

```bash
cd frontend
cp .env.example .env   # points VITE_API_URL at the API container
npm install
npm run dev
```

Open http://localhost:5173 and log in with the admin username/password you
configured in `.env`.

## Project structure

```
backend/src/SubscriptionBilling.Api/
  Domain/              # rich domain entities (state machines, invariants)
  Features/            # one folder per feature: Controller + Service + DTOs
  Infrastructure/      # EF Core, payments, security, exception handling
  BackgroundServices/  # periodic billing job
frontend/
  src/{api,components,features,hooks,layouts,pages,routes,stores,types,utils}
docs/
  diagrams.md          # architecture + subscription lifecycle diagrams
  definition-of-done.md
  planning.md
```

## Known limitations

- No real payment gateway integration — payments go through
  `MockPaymentGateway` (configurable success rate).
- No subscriber-facing self-service portal; this is an admin-only panel.
- No automated test suite yet.

See [`docs/definition-of-done.md`](docs/definition-of-done.md) for the full
release checklist and current status.
