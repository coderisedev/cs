# NestJS + Next.js + Prisma Google OAuth Implementation

This plan captures the lessons from the November 2025 Google-login outage and applies them to a greenfield stack where:

- Backend: NestJS REST API.
- ORM: Prisma targeting PostgreSQL.
- Frontend: Next.js (App Router) with popup and redirect Google login options.

## 1. End-to-End OAuth Flow
1. **Initiate**
   - Next.js hits `POST /api/auth/google/start`.
   - The route calls NestJS `POST /auth/google/start`.
   - NestJS generates `state`, `code_verifier`, `code_challenge`, stores `{ state, verifier, redirectTo }` in Redis (TTL ~5 min), and returns the Google authorization URL.
   - Frontend opens popup or redirects to Google.
2. **Callback**
   - Google calls `https://{frontend}/auth/google/callback?code=...&state=...`.
   - The Next.js route validates the local state cookie and forwards `code` + `state` to NestJS `POST /auth/google/callback`.
   - NestJS exchanges the code for tokens, verifies the ID token, upserts the user via Prisma, and issues application tokens (JWT + refresh).
   - NestJS responds with `{ accessToken, refreshToken, user }` and optionally sets HttpOnly cookies if same-site.
   - The Next.js route stores the tokens in `/api/auth/session`, revalidates caches, and closes the popup/navigates to `/account`.

## 2. NestJS Backend Architecture
### 2.1 Prisma Models
```prisma
model User {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String?
  googleSub    String?  @unique
  displayName  String?
  avatarUrl    String?
  createdAt    DateTime @default(now())
  sessions     Session[]
}

model Session {
  id               String   @id @default(cuid())
  user             User     @relation(fields: [userId], references: [id])
  userId           String
  refreshTokenHash String
  userAgent        String?
  ip               String?
  expiresAt        DateTime
  createdAt        DateTime @default(now())
}
```

Run `prisma migrate dev` (local) / `prisma migrate deploy` (prod). Connect using `DATABASE_URL=postgresql://...`.

### 2.2 Auth Module Components
- **GoogleService**
  - Wraps `google-auth-library` OAuth2Client.
  - `exchange(code, verifier)`: POST `https://oauth2.googleapis.com/token`.
  - `verify(idToken)`: ensures `email_verified`.
- **StateService**
  - Uses Redis to store `{ verifier, redirectTo }` keyed by state. TTL 5 minutes.
  - Provides `createState(redirectTo)` and `consumeState(state)`.
- **AuthService**
  - `startGoogleAuth(redirectTo)`:
    - Generates state/verifier/challenge.
    - Stores state in Redis.
    - Returns `googleAuthUrl`.
  - `handleGoogleCallback({ code, state })`:
    1. Load verifier/redirect from Redis; reject if missing (prevents replay/CSRF).
    2. Exchange code, verify ID token.
    3. `upsert` user with Prisma:
       ```ts
       const user = await prisma.user.upsert({
         where: { email },
         update: { googleSub: payload.sub, displayName: payload.name, avatarUrl: payload.picture },
         create: { email, googleSub: payload.sub, displayName: payload.name, avatarUrl: payload.picture }
       });
       ```
    4. Issue JWT (HS256/RS256) with claims `{ sub: user.id, actor: "customer", email }`.
    5. Create refresh session row with hashed token.
    6. Return tokens + user summary.
- **Controllers**
  - `POST /auth/google/start` → calls `startGoogleAuth`.
  - `POST /auth/google/callback` → calls `handleGoogleCallback`.
  - `GET /auth/me` → guarded by JWT to fetch current user (Prisma).
  - `POST /auth/session` → rotates/refreshes tokens if needed.

- **Guards**
  - `JwtAuthGuard` validates `_session` cookie or `Authorization: Bearer`.
  - `RefreshGuard` for rotating tokens.

## 3. Next.js Frontend Implementation
1. **Start route** (`app/api/auth/google/start/route.ts`):
   - Validates `returnTo` path.
   - Calls NestJS `POST /auth/google/start`.
   - Sets `state` + `returnTo` cookies (HttpOnly, SameSite=Lax).
   - Returns `{ url }` for client to open popup.

2. **Callback route** (`app/auth/google/callback/route.ts`):
   - Reads `state`, `code`.
   - Retrieves `returnTo` from cookie; clears cookie.
   - Calls NestJS `POST /auth/google/callback` with JSON `{ code, state }`.
   - Receives tokens/user; stores session by calling local `POST /api/auth/session`.
   - Revalidates SWR tags (`customers`, `cart`), closes popup (if any), redirects to `returnTo` (default `/account`).

3. **Session API** (`app/api/auth/session/route.ts`):
   - Accepts `{ accessToken, refreshToken }`.
   - Sets HttpOnly cookies `_session`, `_refresh` (1 week TTL).
   - Returns 204.

4. **Client Hooks**:
   - `useSession` hits `/api/me` (Next.js route that proxies NestJS `/auth/me`) to keep React state.
   - `useLogout` clears cookies via `DELETE /api/auth/session`, notifies NestJS to revoke refresh token.

## 4. Security & Operational Lessons
1. **Resolve via services, not ORM internals**:
   - The Medusa outage happened because we imported TypeORM models directly. Here we stick to Prisma client calls and service boundaries.
2. **Always set `state` + PKCE**:
   - Store them server-side (Redis). Reject callbacks without matching entries.
3. **Explicit session write-back**:
   - Popup flows must set cookies via a same-origin route (e.g., `/api/auth/session`) before closing, otherwise login seems “successful” but the opener lacks credentials.
4. **Docker / Runtime prep**:
   - If containerizing NestJS, export `NODE_ENV`, `NODE_PATH` (if using pnpm), and make sure dependencies are hoisted so runtime imports succeed.
5. **Observability**:
   - Log structured events at each step: start, callback, upsert, session set.
   - Expose `/api/debug/token` and `/api/debug/me` (protected) during development to inspect JWT payloads quickly.
6. **Automated smoke tests**:
   - Add Playwright scenario: start Google login (use testing Google account), ensure `_session` cookie exists, and `/account` renders user info. Alert if failure rate >1%.

## 5. Verification Checklist
| Step | Command / Tool | Expected Result |
| --- | --- | --- |
| DB migration | `prisma migrate deploy` | `User` + `Session` tables created. |
| Unit | Jest test for `handleGoogleCallback` with mocked Google payload | User upserted, JWT contains `sub`. |
| Integration | Postman: call `/auth/google/callback` with fake code -> should reject with 400 | Validates state checks. |
| End-to-end | Playwright on Next.js login page | After Google consent, `/account` shows profile, `_session` cookie present. |
| Monitoring | Grafana/Logtail query on `/auth/google/callback` errors | Alert if >1% failures over 5 min. |

By following this blueprint we retain the improvements from the Medusa fix—module-based data access, deterministic Docker builds, explicit session persistence, and proactive instrumentation—while adapting them to a NestJS + Prisma + Next.js stack.
