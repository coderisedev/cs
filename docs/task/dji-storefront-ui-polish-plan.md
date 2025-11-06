# DJI Storefront UI Polish Plan

## Objective
Elevate the `apps/dji-storefront` experience so every surface feels premium and cohesive with the DJI design system. Focus on visual hierarchy, component polish, navigation behavior, microcopy, and animation/feedback patterns.

## Guiding Principles
- **Consistency with tokens:** All gradients, shadows, and colors must come from `design-tokens.css` to guarantee theme parity.
- **Balanced rhythm:** Section spacing, typography scales, and CTA treatments should follow a repeatable cadence across marketing and commerce pages.
- **Meaningful motion:** Animations reinforce state changes (scroll, hover, reveal) without distracting from conversion paths.

## Phase Overview

### Progress Snapshot (2025-XX)
- [x] Phase 1 – Hero & Navigation Alignment
- [x] Phase 2 – Product Card & Component Polish
- [x] Phase 3 – Search & Feedback Enhancements
- [x] Phase 4 – Responsive Rhythm & Tokens
- [ ] Phase 5 – Validation & Rollout

### Phase 1 – Hero & Navigation Alignment
1. Revisit hero overlay and typography scale to match documented DJI values (max 64px H1, -0.5px tracking).
2. Introduce a refined sticky header state: solid by default, shrink height + add blue highlight when scrolled, smooth transition via `transition-all`.
3. Update hero CTA copy (“Configure Your Cockpit”, “Explore Pilot Favorites”), unify gradient button styles with tokens.
4. Validate contrast ratios in both header states, adjust hero gradient token variants if needed.

### Phase 2 – Product Card & Component Polish
1. Add subtle separators and hover microinteractions to `ProductCard` (image scale, delayed shadow, price/action band).
2. Introduce a `surface`/`tone` prop for shared `Card` component to differentiate marketing blocks from functional panels.
3. Ensure wishlist tiles inherit the same treatment (badges, actions, hover), and expose highlight chips per series.
4. Extend lint token guard to cover inline `style={{ backgroundImage }}` cases by requiring a helper that maps to tokens.

### Phase 3 – Search & Feedback Enhancements
1. Animate search reveal (width/scale) and add a mobile backdrop to prevent layout jumps.
2. Implement IntersectionObserver-based section reveals (fade + slide) for home sections and testimonials.
3. Add skeleton states for Account orders/addresses so mock data loads gracefully.
4. Audit microcopy across CTAs (“Add to Cart” → “Configure” when PDP selection is necessary).

### Phase 4 – Responsive & Spacing Rhythm
1. Normalize section padding: `py-12` on mobile, `py-20` on desktop, with consistent top/bottom margins for headings.
2. Ensure component grids collapse elegantly (two-column product grids at md, single column below sm, preserve CTA width).
3. Revisit newsletter + software hero overlays to use `--gradient-hero` tokens and lighten backgrounds on small screens.
4. Document spacing/typography rules in `docs/basic/dji-design-system-analysis.md` so future pages stay aligned.

### Phase 5 – Validation & Rollout
1. Manual sweep (desktop + mobile) for header/hero transitions, card interactions, section reveals.
2. Run `pnpm --filter dji-storefront lint` + `lint:tokens`; add a Chromatic/Storybook review for ProductCard variants.
3. Capture before/after screenshots for hero, product grid, account wishlist, and include in PR description.
4. Gather feedback, iterate, and then promote to production once stakeholders approve visual refinements.

## Deliverables Checklist
- [x] Updated header/hero with new typography, CTAs, and scroll behavior.
- [x] Product cards + wishlist tiles with new hover/separator treatments.
- [x] Animated search + section reveals and skeleton loaders in account.
- [x] Responsive spacing + overlay token alignment across marketing sections.
- [x] Documentation updates + lint guards in place.

## Validation Commands
```bash
pnpm --filter dji-storefront lint
pnpm --filter dji-storefront lint:tokens
```

## Notes
- Keep hover/animation durations ≤ 300ms and use `cubic-bezier(0.4, 0, 0.2, 1)` for consistency.
- Prefer semantic copy updates in both English and localized variants if future translations are planned.
