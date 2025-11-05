# DJI Design System – Phase 7 Operational Readiness

Date: 2025-11-12  
Owners: Frontend Team (apps/web) + Product/Design

> Purpose: capture the non-code work required to harden the migration before launch—monitoring, feedback, accessibility, enablement, and backlog hygiene. All steps below are executable in the current environment with Medusa mocks.

---

## 1. Monitoring & Alerting Playbook

| Scope | Metric / Signal | How to capture | Owner | Cadence |
| --- | --- | --- | --- | --- |
| Traffic & navigation health | Vercel Analytics (page views, TTFB, Web Vitals) | Already enabled via `app/layout.tsx`; ensure project has Vercel Analytics toggled on. | Frontend lead | Daily glance + weekly summary |
| Checkout reliability | `checkout-success-rate` = successful `/order/[id]/confirmed` hits ÷ `/checkout` sessions | Add a Vercel dashboard chart using Analytics filters (`path`, `event`). | Product analyst | Weekly |
| Error budget | Next.js server logs filtered for `GET /[countryCode] ... 5xx` | Vercel Log Drains → Datadog/Sentry (if unavailable, run `vercel logs` and grep). | On-call dev | Real-time alerts (>5 errors/5 min) |
| Mock/real backend drift | Build logs mentioning `upstream image response failed` or `fetch ECONNREFUSED` | Already visible in dev logs. Documented as benign, but treat any new endpoint failures as high priority. | Frontend team | Build-time |

### Monitoring Guide (first 4 weeks post-launch)
1. **Daily (stand-up)**: check Vercel Analytics dashboard for unusual dips in `/us/store` or `/us/checkout`. Screenshot anomalies into the team channel.
2. **Twice per week**: export the Analytics CSV (filters: `/us/*`) and compute checkout success rate; log in shared spreadsheet.
3. **Alerts**: configure Vercel “Function Errors” → Slack webhook (or manual psuedo-alert by running `vercel logs --since 1h | grep " 5"` until automation is available).
4. **Retro**: Archive findings in the migration Notion/issue tracker; link the raw data for traceability.

---

## 2. Feedback Collection Workflow

| Step | Description | Owner |
| --- | --- | --- |
| Intake | Floating widget (`Share feedback`) links to `NEXT_PUBLIC_FEEDBACK_FORM_URL` (default mailto). Set it to a Typeform/Notion form before launch. | Product Designer |
| Triage | Form responses auto-sync to `DJI Design Feedback` database (Notion/Sheet). Columns: `submitted_at`, `page`, `type (bug/polish/idea)`, `severity`, `status`. | Product Manager |
| Review cadence | Twice weekly async triage; severity “High” escalated to engineering immediately. Summaries shared in #dji-migration channel every Friday. | PM + FE lead |
| Resolution tracking | Convert accepted feedback into GitHub issues labelled `dji-feedback`. Reference the source entry ID so the submitter can be notified. | Assignee |

---

## 3. Accessibility & UX Enhancements

### Automated Checks
1. Run `pnpm --filter tests-e2e exec -- playwright test accessibility.spec.ts`.
2. Violations are printed to the console (serious/critical only). File GitHub issues labelled `a11y` for any failures.
3. Add this command to CI nightly once infrastructure is ready.

### Manual Checklist (monthly or before major launch)
- **Screen reader**: NVDA/VoiceOver walkthrough for `/us`, `/us/store`, `/us/checkout` focusing on landmark navigation, heading levels, form labels.
- **Keyboard navigation**: Confirm focus order + visible focus ring on all interactive elements (esp. cart/checkout buttons).
- **Color contrast**: Use axe DevTools or Figma tokens to verify contrast ratio ≥ 4.5:1 for text on backgrounds; log deviations with screenshot + hex values.
- **Motion/animation**: Respect `prefers-reduced-motion` in hero carousels and CTA hover states (follow-up ticket if not yet implemented).

Document each audit in the feedback database with `type=a11y` so it flows through the same backlog.

---

## 4. Documentation & Enablement

| Asset | Location | Notes |
| --- | --- | --- |
| Migration plan | `docs/task/dji-design-system-migration-plan.md` | Updated with latest telemetry + feedback context. |
| Iteration log | `docs/task/dji-design-system-iteration-plan.md` | Continue appending entries per iteration or ops milestone. |
| Component usage guide | (Action) Create Storybook or MDX usage snippets under `docs/components/` as follow-up; meanwhile, point engineers to `apps/web/src/components/ui` for reference implementations. |
| Training session | Schedule a 30‑min walkthrough (recorded) showing how to consume the new primitives, run Playwright + axe suites, and use `NEXT_SKIP_REGION_MIDDLEWARE`. |

Enablement To‑Do:
1. Add README section inside `apps/web/src/components/ui` summarizing available primitives + props.
2. Draft onboarding doc for new contributors (link to Tailwind tokens, typography sheet, mock-data commands).
3. Track completion in backlog (see Section 5).

---

## 5. Backlog Grooming (Open Items)

| Item | Type | Status |
| --- | --- | --- |
| Percy/visual regression setup for `/us` flows | Monitoring | TODO – requires Playwright middleware fix (done) + Percy token |
| Storybook or MDX component docs | Enablement | TODO – blocked on bandwidth |
| Accessibility manual audit report | A11y | TODO – schedule before GA |
| Remove `@medusajs/ui` package (dead dependencies) | Cleanup | TODO – requires final sweep once no imports remain |
| Marketing/blog dark mode polish | Enhancements | TODO – design QA after launch |
| Analytics alert automation (Slack/webhook) | Monitoring | TODO – pending ops token |

Track these as GitHub issues (label `dji-follow-up`) so they can be prioritized sprint by sprint.

---

## 6. Quick Reference Commands

```bash
# Analytics sanity (dev)
VERCEL_ANALYTICS_ID=<id> pnpm --filter medusa-next dev

# Smoke + accessibility suites
pnpm --filter tests-e2e test
pnpm --filter tests-e2e exec -- playwright test accessibility.spec.ts

# Region middleware bypass (local dev)
NEXT_SKIP_REGION_MIDDLEWARE=true NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=dummy pnpm --filter medusa-next dev
```

Keep this document updated as processes evolve. Once the outstanding backlog items are resolved, Phase 7 can be marked “complete” in the main migration plan.
