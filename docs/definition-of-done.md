# Definition of Done

This document defines the criteria required to consider a release of the Subscription Billing platform complete and ready for publication.

## 1. Functional Requirements

* [ ] All features defined for the current MVP/release are implemented.
* [ ] Main user journeys work from beginning to end.
* [ ] Business rules are correctly implemented.
* [ ] Validation and error handling are implemented for critical operations.
* [ ] No known blocking or critical functional bugs remain.

## 2. Automated Tests

* [ ] Unit tests cover critical business rules.
* [ ] Integration tests cover critical API and persistence scenarios.
* [ ] Frontend tests cover critical application behavior.
* [ ] End-to-end tests cover the main user journeys where applicable.
* [ ] All automated tests pass.
* [ ] No critical test is skipped or disabled without justification.

## 3. Manual QA

Execute the main user journeys manually using the application as a real user.

* [ ] Authentication
* [ ] Customer management
* [ ] Plan management
* [ ] Subscription management
* [ ] Billing
* [ ] Payment flow
* [ ] Subscription changes
* [ ] Cancellation
* [ ] Dashboard and main navigation
* [ ] Form validation
* [ ] API error handling
* [ ] Loading and empty states
* [ ] Responsive behavior

Result:

* [ ] No blocking or critical issues found.
* [ ] No obvious UI/UX defects remain.

## 4. Clean Installation

The application must be reproducible from a clean environment.

* [ ] Repository can be cloned successfully.
* [ ] Dependencies can be installed/restored.
* [ ] Environment configuration is documented.
* [ ] Database can be created from scratch.
* [ ] Migrations execute successfully.
* [ ] Seed data works when applicable.
* [ ] Backend starts successfully.
* [ ] Frontend starts successfully.
* [ ] Application can be used without undocumented manual steps.

## 5. Build and CI

* [ ] Backend builds successfully.
* [ ] Frontend builds successfully.
* [ ] Automated tests pass locally.
* [ ] GitHub Actions/CI pipeline passes.
* [ ] No critical build warnings remain.
* [ ] No secrets or credentials are committed to the repository.

## 6. Code Quality

* [ ] Code follows the project's architecture and conventions.
* [ ] No known dead code remains.
* [ ] No unnecessary duplicated logic remains.
* [ ] Critical business logic is readable and maintainable.
* [ ] Public APIs and important configuration are documented where necessary.
* [ ] Debug code, temporary files and local configuration are removed.

## 7. Security

* [ ] Secrets are externalized from source code.
* [ ] Authentication works correctly.
* [ ] Authorization rules are enforced.
* [ ] Sensitive information is not exposed in API responses or logs.
* [ ] Production configuration does not contain development credentials.

## 8. Documentation

* [ ] README explains what the project does.
* [ ] README explains how to run the project.
* [ ] Required environment variables are documented.
* [ ] Database setup is documented.
* [ ] Main features are documented.
* [ ] Known limitations are documented.
* [ ] Screenshots/demo are available when useful.

## 9. Final Release Gate

A release is considered **Done** only when:

* [ ] Functional requirements are complete.
* [ ] Critical automated tests pass.
* [ ] Main user journeys pass manual QA.
* [ ] Clean installation succeeds.
* [ ] Backend and frontend build successfully.
* [ ] CI pipeline is green.
* [ ] No known critical or blocking bugs remain.
* [ ] Documentation is complete.
* [ ] Repository is safe to publish publicly.

## Release Status

**Status:** `NOT READY`

Change to `READY` only after all applicable criteria above have been verified.
