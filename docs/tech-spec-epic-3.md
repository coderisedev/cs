# Technical Specification: Checkout, Payments & Account Fundamentals

Date: 2025-10-19
Author: Aiden Lux
Epic ID: 3
Status: Draft

---

## Overview

This epic delivers the secure checkout, payments, and account foundation described in the PRD by implementing multi-step checkout, PayPal multi-currency payment processing, and authenticated account surfaces for order history and preferences. It operationalizes the authentication and transaction flows that convert the catalog experience into revenue, while preserving compliance, fraud mitigation, and observability guardrails required for an enterprise launch.

The solution extends the architecture’s Next.js App Router pattern with protected `/checkout` and `/account` subtrees, leverages NextAuth with Medusa customer identities, and integrates PayPal REST APIs through BFF endpoints to keep credentials server-side. Account dashboards expose Medusa order data and Strapi-linked assets, ensuring the post-purchase experience stays aligned with the composable commerce design.

## Objectives and Scope

**In Scope**
- Activate email/password authentication and Google OAuth using NextAuth + Medusa, including password recovery and session persistence.
- Implement multi-step checkout (customer details, shipping, review, payment hand-off) with PayPal Smart Buttons supporting USD and EUR regions.
- Configure tax and shipping calculations tied to Medusa regions and pre-defined carrier rules, with responsive order total updates.
- Generate order confirmation pages and transactional emails, recording webhook outcomes and audit trails.
- Build account dashboards for order history, detailed receipts, address book management, and profile/preferences syncing with marketing systems.
- Provide saved payment agreement handling where supported by PayPal, along with compliance prompts and fraud signal logging.

**Out of Scope**
- Alternative payment methods beyond PayPal (e.g., Stripe, Klarna) and deferred payments.
- Subscription management, recurring billing, or installment plans.
- Full-featured customer support ticketing inside the account area (links only).
- Automation for tax provider onboarding beyond configured launch regions.
- B2B purchase orders, quotes, or volume pricing agreements.

## System Architecture Alignment

Execution aligns with the solution architecture by housing checkout flows within Next.js server components under `(checkout)` with React Hook Form and TanStack Query managing state transitions. NextAuth enforces session gating on `/checkout` post-auth steps and `/account` subroutes, relying on Medusa customer data. PayPal integration occurs via `/api/checkout/paypal/session` and webhook handlers that orchestrate Medusa order creation and status updates while maintaining OTEL traceability. Observability taps into the core telemetry stack (Sentry, Logtail, Segment) to monitor conversion funnels, and compliance hooks integrate with LaunchDarkly feature flags to stage rollouts safely.

## Detailed Design

### Services and Modules

| Module / Location | Responsibility | Inputs / Outputs | Owner |
| --- | --- | --- | --- |
| `apps/web/app/(checkout)` | Multi-step checkout route group with server components, progress tracker, and validation orchestration. | Consumes `useCheckoutFlow` hook, renders Step components, emits Segment events. | Frontend |
| `apps/web/app/(account)` | Authenticated dashboard for orders, addresses, profile, and saved payments. | Fetches via `/api/account/*`; renders Shadcn UI, triggers optimistic updates. | Frontend |
| `apps/web/app/api/checkout/paypal/session` | Creates PayPal checkout sessions, injects line items, totals, and return/cancel URLs. | Receives `CheckoutSessionRequest`; calls Medusa service; returns approval URL + session id. | Platform |
| `apps/web/app/api/checkout/paypal/webhook` | Handles PayPal webhooks (success, cancel, failure) and maps results to Medusa orders. | Validates PayPal signature; updates Medusa order, logs to OTEL/Sentry. | Platform |
| `apps/web/app/api/account/orders` | REST endpoints serving paginated order history and order detail views. | Queries Medusa order API; returns `OrderSummary` DTOs with Strapi asset links. | Platform |
| `apps/web/app/api/account/addresses` | CRUD endpoints for address book management synced with Medusa customer records. | Accepts `AddressBookEntry` payloads; returns updated address list. | Platform |
| `apps/medusa/src/services/paypal-session-service.ts` | Wraps PayPal REST SDK for session creation, capture, and billing agreements. | Inputs cart totals, region context; outputs approval/capture responses, error normalization. | Commerce |
| `apps/medusa/src/subscribers/order-lifecycle.ts` | Listens to order events to trigger emails, fraud checks, and audit trail entries. | Consumes Medusa event bus; invokes SendGrid, Logtail, and analytics hooks. | Commerce |
| `packages/sdk/checkout` | Shared TypeScript client, zod schemas, and TanStack Query hooks for checkout/account APIs. | Exports `useCheckoutFlow`, `useOrderHistory`, `useAddressBook`; validates payloads. | Platform |
| `packages/ui/checkout` | Component primitives for checkout forms, stepper, summary drawer, PayPal buttons. | Receives typed props; ensures WCAG 2.1 AA compliance and reduced-motion support. | Frontend |

### Data Models and Contracts

- **CheckoutState Machine**
  - TypeScript discriminated union capturing steps: `guest-info`, `shipping`, `review`, `payment`, `confirmation`.
  - Contains `customer`, `shippingAddress`, `billingAddress`, `shippingMethodId`, `promoCodes`, `agreementFlags`.
  - Persisted client-side via Zustand with sessionStorage fallback for refresh resilience.

- **CheckoutSessionRequest / Response**
  - Request `{ cartId, customerId?, shippingAddress, billingAddress, currencyCode, returnUrl, cancelUrl }`.
  - Response `{ approvalUrl, paypalOrderId, expiresAt, amount: { subtotal, tax, shipping, total }, currencyCode }`.
  - Validated by zod schema; stored server-side for reconciliation.

- **OrderSummary DTO**
  - Fields: `orderId`, `number`, `status`, `placedAt`, `currency`, `totals`, `lineItems[]`, `downloadLinks[]`, `receipts[]`.
  - Includes `fraudSignals` metadata (velocity, mismatched address) for ops review.

- **AddressBookEntry**
  - Fields: `id`, `label`, `firstName`, `lastName`, `street1`, `street2?`, `city`, `postalCode`, `state`, `country`, `phone`, `isDefaultShipping`, `isDefaultBilling`.
  - Synced with Medusa `customer_address` records.

- **SavedPaymentAgreement**
  - Stores PayPal billing agreement id, status, createdAt, lastUsedAt, approvalUrl.
  - Guarded behind LaunchDarkly flag; encrypted at rest via Medusa secret storage.

- **AccountPreference**
  - Contains `newsletterOptIn`, `preferredCurrency`, `communicationLanguage`, `gdprConsent`, `marketingChannels[]`.
  - Synced with marketing provider via webhook worker.

### APIs and Interfaces

| Endpoint / Interface | Method / Signature | Request | Response / Notes |
| --- | --- | --- | --- |
| `POST /api/auth/password/reset` | HTTP POST | `{ email }` | Triggers Medusa reset email; returns 202 on success. |
| `POST /api/auth/password/update` | HTTP POST | `{ token, password }` | Completes reset; returns 200 with session refresh. |
| `POST /api/checkout/paypal/session` | HTTP POST | `CheckoutSessionRequest` | Returns `CheckoutSessionResponse`; logs OTEL span `checkout.session`. |
| `POST /api/checkout/paypal/capture` | HTTP POST | `{ paypalOrderId, cartId }` | Captures payment, creates Medusa order, returns order id. |
| `POST /api/checkout/paypal/webhook` | HTTP POST (webhook) | PayPal event payload | Verifies signature, updates order status, enqueues emails. |
| `POST /api/checkout/order` | HTTP POST | `{ cartId, customerNotes?, optIns }` | Finalizes order, triggers confirmation page payload. |
| `GET /api/account/orders` | HTTP GET | Query `page`, `limit`, `status` | Returns paginated `OrderSummary[]`, `pageInfo`. |
| `GET /api/account/orders/[id]` | HTTP GET | Path `id` | Returns detailed `OrderSummary` with download links, receipts. |
| `POST /api/account/addresses` | HTTP POST | `AddressBookEntry` | Creates address; returns updated list. |
| `PATCH /api/account/addresses/[id]` | HTTP PATCH | Partial `AddressBookEntry` | Updates entry; returns updated list. |
| `DELETE /api/account/addresses/[id]` | HTTP DELETE | Path `id` | Deletes entry; returns updated list. |
| `POST /api/account/preferences` | HTTP POST | `AccountPreference` | Saves preferences; syncs marketing status. |
| `useCheckoutFlow()` | React hook (`packages/sdk/checkout`) | — | Exposes `state`, `dispatch`, `startSession`, `capturePayment`, `completeOrder`. |
| `useOrderHistory(params)` | React hook | `{ page, status }` | Provides paginated orders with loading/error states. |
| `useAddressBook()` | React hook | — | Provides addresses, CRUD handlers, optimistic state updates. |

### Workflows and Sequencing

1. **Establish Authentication Core** — Configure NextAuth providers (credentials + Google), session callbacks, secure cookies, and password reset flows; enforce middleware gating on `/checkout` and `/account`.
2. **Integrate PayPal Session Service** — Implement Medusa service + BFF endpoints for session creation/capture; manage sandbox/live credentials via Pulumi secrets.
3. **Build Multi-Step Checkout UI** — Create `(checkout)` route components, validation schemas, progress tracker, and PayPal Smart Button integration; ensure currency/tax updates in real time.
4. **Wire Order Confirmation & Emails** — Generate confirmation page, process webhooks, and send SendGrid transactional emails with localized totals and support links.
5. **Deliver Account Dashboard** — Implement order history list/detail, receipt exports, and download link surfacing with role-protected APIs.
6. **Implement Address & Payment Management** — Ship address book CRUD, default handling, and optional PayPal billing agreement storage w/ feature flag.
7. **Add Compliance & Fraud Safeguards** — Log fraud signals, require policy acknowledgments, persist audit trail entries, and expose ops dashboards.
8. **Validate & Launch** — Execute automated + manual QA, k6 performance runs, security review, and staged rollout via LaunchDarkly with monitoring.

## Non-Functional Requirements

### Performance
- Checkout API endpoints (`/api/checkout/*`) must respond within 350 ms p95 and sustain 50 concurrent checkouts without degradation.
- Confirmation page render under 1.2 s TTFB via SSR with streaming and cached lookup for order summaries.
- Account order history pagination returns results within 400 ms p95 for users with up to 100 orders.
- PayPal session creation should complete in under 2 s p95; retries escalate after 3 attempts with alerting.

### Security
- Enforce NextAuth secure cookies (`Secure`, `HttpOnly`, `SameSite=Lax`) and rotate JWT/secret keys quarterly.
- Store PayPal credentials, billing agreement tokens, and webhook secrets in Pulumi-managed secret stores; never expose to client.
- Apply Cloudflare Turnstile or similar bot mitigation on checkout entry to reduce fraud attempts.
- Require explicit acceptance of terms/privacy/refund policies before payment capture; log consent snapshot.
- Ensure PCI-DSS boundaries by keeping cardholder data solely within PayPal; no PAN data stored or transmitted.

### Reliability/Availability
- Provide 99.5% uptime for checkout and account endpoints with health checks on Vercel/Medusa services.
- Implement idempotent webhook handling and replay protection (dedup by PayPal event id).
- Queue transactional email sends and webhook retries with exponential backoff; surface failures in ops dashboard.
- Gracefully degrade checkout to support manual payment assistance if PayPal outage detected (display hotline + fallback instructions).

### Observability
- Instrument checkout and account endpoints with OTEL spans (`checkout.session`, `checkout.capture`, `account.orders.list`), linking correlation ids across Medusa and PayPal events.
- Emit Segment events for key funnel stages (Checkout Started, Payment Approved, Order Completed, Address Added).
- Log fraud signals and compliance acknowledgments to Logtail with severity tags for SOC auditing.
- Dashboard conversion, abandonment, and payment failure metrics in Grafana; trigger alerts on >5% spike in failures over 15 min.

## Dependencies and Integrations

- **Authentication:** NextAuth 5.x, Medusa customer auth endpoints, Google OAuth client credentials.
- **Payments:** PayPal REST v2 SDK, PayPal Smart Buttons, PayPal webhooks.
- **Commerce Platform:** Medusa 2.x order/cart APIs, Redis for session caching, Pulumi for secret provisioning.
- **Messaging & Notifications:** SendGrid transactional email, Slack webhook for payment failure alerts.
- **Compliance & Analytics:** Segment analytics SDK, LaunchDarkly feature flags, Cloudflare Turnstile, Logtail/Sentry/OTEL.
- **Tax & Shipping:** Manual rate tables or TaxJar integration (initial regions: US, EU), carrier API stubs (UPS/DHL) defined in Medusa.

## Acceptance Criteria (Authoritative)

1. Users can register, log in, log out, and reset passwords; Google OAuth sign-in functions across environments.
2. Checkout flow supports customer info, shipping selection, order review, and PayPal hand-off with real-time total updates.
3. PayPal payments process in USD and EUR, updating Medusa orders via webhooks with accurate statuses.
4. Order confirmation page and transactional emails render localized currency totals and next-step guidance.
5. Account dashboard lists historical orders with detailed views, downloadable receipts, and download links when available.
6. Address book CRUD operations persist to Medusa and reflect defaults within checkout.
7. Saved payment agreements (when enabled) can be created, viewed, and revoked, respecting compliance constraints.
8. Taxes and shipping estimates adjust automatically when addresses or shipping methods change.
9. Fraud/compliance safeguards capture required acknowledgments and log signals for operations review.

## Traceability Mapping

| AC | Spec Sections | Components / APIs | Test Idea |
| --- | --- | --- | --- |
| 1 | Services & Modules; Workflows Step 1 | NextAuth config, `/api/auth/password/*`, Google OAuth setup | Automated tests for auth flows + manual OAuth verification across envs. |
| 2 | Objectives; Workflows Step 3; APIs table | `(checkout)` UI, `useCheckoutFlow`, PayPal session endpoint | Playwright E2E covering multi-step checkout and validation. |
| 3 | Services & Modules; APIs; NFR Reliability | PayPal session/capture, webhook handler, Medusa order sync | Integration tests simulating PayPal webhooks and verifying order status. |
| 4 | Workflows Step 4; Dependencies | Confirmation page component, SendGrid templates, webhook subscriber | Snapshot tests for email template + E2E verifying confirmation page data. |
| 5 | Services & Modules; APIs | `/api/account/orders`, `(account)` UI | API contract tests + Playwright account dashboard scenario. |
| 6 | Services & Modules; Data Models | `/api/account/addresses`, AddressBookEntry schema | Unit + integration tests for CRUD endpoints; E2E default address update. |
| 7 | Services & Modules; Data Models; Dependencies | SavedPaymentAgreement storage, LaunchDarkly flag, UI components | Feature-flagged test suite verifying agreement creation/revocation. |
| 8 | Data Models; APIs; NFR Performance | Tax/shipping calculators, checkout state machine | Integration tests altering address/method; assert totals update and performance budgets met. |
| 9 | NFR Security & Observability; Workflows Step 7 | Fraud signal logging, policy consent UI, Logtail entries | Security test plan verifying consent capture and log presence; monitor alerts. |

## Risks, Assumptions, Open Questions

- **Risk:** PayPal API rate limits or downtime could block checkout. *Mitigation:* implement retry with exponential backoff, display fallback messaging, and monitor via alerts.*
- **Risk:** Incorrect tax/shipping configuration may lead to compliance issues. *Mitigation:* double-check rate tables, add unit tests, and require finance sign-off before launch.*
- **Assumption:** Only USD and EUR payment regions required at launch; additional currencies will follow separate rollout. *Action:* confirm with finance and marketing.*
- **Assumption:** SendGrid and Slack credentials are available in secrets store ahead of integration testing. *Action:* coordinate with operations.*
- **Question:** Should saved payment agreements be GA at launch or staged via pilot? *Next Step:* decide with product/ops and configure LaunchDarkly targeting.*
- **Question:** Does the account dashboard need downloadable VAT invoices at launch? *Next Step:* confirm with finance; adjust order detail output accordingly.*

## Test Strategy Summary

- **Unit Tests:** Cover NextAuth callbacks, checkout reducers, zod schemas, address normalization utilities, and Medusa service helpers.
- **Integration Tests:** Validate `/api/checkout` and `/api/account` endpoints with mocked PayPal/Medusa responses; ensure webhook idempotency.
- **E2E Tests:** Playwright scenarios for login, checkout (happy path + failure), order confirmation, and account management flows with accessibility checks.
- **Performance Tests:** k6/Artillery load against checkout APIs and PayPal session creation to confirm latency targets under peak load.
- **Security Tests:** Run OWASP ZAP scan against checkout/account routes; perform penetration review on auth + webhook endpoints.
- **Monitoring Verification:** Synthetic PayPal webhook and Segment event smoke tests post-deploy; verify Grafana dashboards and alerting rules.
- **Manual QA:** UAT checklist covering multi-currency totals, transactional emails, saved payment toggles, and compliance acknowledgments.
