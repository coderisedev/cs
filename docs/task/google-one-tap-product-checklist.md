# Google One Tap – Product Checklist (Task 6.1)

## Goals
- Maintain an open-browse storefront so anonymous visitors can evaluate products without friction.
- Require authentication only when user actions need persistence, security, or personalization.
- Introduce Google One Tap + traditional login prompts at the exact decision points to maximize conversion.

## Anonymous Experience
- **Allowed without login**
  - Home, collections, product detail, blog, support content.
  - Add/remove products in cart, configure variants; cart stored in anonymous cookie.
  - Download public spec sheets or watch embedded media.
- **Persistent data**
  - Anonymous cart ID saved in cookie/local storage for 30 days.
  - When user later signs in, merge anonymous cart into account cart.

## Login Triggers
| Use case | Behavior |
| --- | --- |
| Checkout (clicking `Checkout` button) | Show modal requiring login/registration; surfaces Google One Tap + email login before collecting shipping info. |
| Account pages (`/account`, `/orders`, `/addresses`) | Redirect to login if session missing. |
| Wishlist / Favorites | Prompt login before saving item. |
| Reviews / Q&A submissions | Prompt login; show rationale (“need verified identity”). |
| High-value forms (consultation booking, restricted downloads) | Inline message requiring login with CTA. |

## Prompt Strategy
- **Primary**: Google One Tap floating prompt (triggered on checkout attempt or after 5s on login page).
- **Fallback**: “Continue with Google” button + email/password form.
- **Dismissal**: Allow “Not now” for all prompts except checkout (user can go back to cart).
- **Copywriting**: Emphasize benefits (“Sign in to save cockpit build across devices”).

## Acceptance Criteria
1. Anonymous users can browse and add to cart without login.
2. Clicking checkout without a session shows login modal (One Tap first).
3. Accessing `/account` or `/wishlist` without session redirects to login page with One Tap prompt.
4. One Tap dismissal returns user to previous state; checkout CTA remains disabled until login.
5. After login, anonymous cart merges and user routed back to original action (checkout, wishlist, etc.).
6. Analytics event logged for prompt shown/dismissed/accepted (for later instrumentation).

## Dependencies & Notes
- Requires backend support for cart merge + One Tap session endpoint (Tasks 3.x).
- Feature flag `NEXT_PUBLIC_ENABLE_GOOGLE_ONE_TAP` guards prompts until rollout.
- UX copy + modal design to be reviewed with design owner.
