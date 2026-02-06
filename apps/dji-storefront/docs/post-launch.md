# CS Storefront Post-Launch Playbook

This document tracks the monitoring dashboards, follow-up sprints, and governance rules required after the CS storefront replaces the legacy Medusa theme.

## Monitoring & Alerts

- **Metrics to track** (set up in your analytics/observability stack before launch):
  1. **Conversion funnel**: PDP → Add-to-cart → Checkout → Order confirmation (segment by device + country).
  2. **Performance**: Core Web Vitals (LCP < 2.5s, CLS < 0.1, INP < 200ms) and API latency for mock vs. real backend.
  3. **Errors/logs**: Sentry (frontend) + backend logs tied to cart/order endpoints. Alert on spike >20% vs. 7-day baseline.
  4. **Support signals**: Support tickets tagged “storefront” and onsite feedback widget.
- **Dashboards**: create Grafana/DataDog dashboards named `dji-storefront-conversion`, `dji-storefront-performance`, and share links in the README once live.
- **Alerting**: use Slack channel #dji-storefront. PagerDuty escalation if checkout errors >3/min for 5 consecutive minutes.

## Post-launch Sprints

| Sprint | Focus | Owners |
| --- | --- | --- |
| +1 week | Resolve design deviations logged in Phase 4 screenshots; triage high-priority bugs | FE/Design |
| +2 weeks | Replace remaining `/products` pods (cart drawer, modals) with CS UI kit components | FE |
| +3 weeks | Migrate account/checkout flows + remove `legacy-medusa.css` | FE/BE |

## Legacy Cleanup

- Inventory remaining Medusa assets (CSS imports, components, config) and attach each to a removal ticket.
- Establish an “eligibility checklist” before deleting: new page live, analytics stable over 7 days, no open bugs.
- After removal, update lint rules to block reintroducing the old classnames.

## Governance

- **Change-control checklist** (must be completed before merging UI changes):
  1. Verify designs exist in Cockpit Simulator or Storybook (PR must include screenshots/links).
  2. Run `pnpm lint:dji-storefront` + `pnpm test:mock-medusa` + `pnpm storybook:dji-storefront` (attach logs or GitHub Actions link).
  3. Update `docs/task/dji-storefront-implementation-plan.md` if the change impacts milestones.
- **Quarterly audits**: review key routes against `docs/basic/dji-design-system-analysis.md` to ensure token drift hasn’t occurred; log findings in `apps/dji-storefront/docs/audits/YYYY-Q#.md`.
- **Design tokens**: any token changes must first land in the cockpit simulator repo, then mirror here via Tailwind config updates.
