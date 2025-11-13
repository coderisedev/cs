# FastAPI + Next.js + PostgreSQL Google OAuth Implementation

Adapts the lessons from the November 2025 Medusa outage to a stack where the backend is FastAPI, the frontend is Next.js, the database is PostgreSQL, and SQLAlchemy/Prisma-like discipline is enforced via Alembic migrations. The goal: keep Google secrets server-side, issue our own JWT/refresh tokens, and ensure popup flows persist sessions reliably.

## 1. High-Level Flow
1. **Next.js start** – The frontend calls `POST /api/auth/google/start`, which proxies to FastAPI. FastAPI creates a `state`, PKCE `code_verifier`, and `code_challenge`, stores them in Redis with the desired redirect path, and returns the Google authorization URL.
2. **User consents** – Browser goes to Google’s consent screen.
3. **Callback** – Google redirects back to `/auth/google/callback` on the Next.js site with `code` + `state`.
4. **Token exchange** – The Next.js callback route validates its state cookie and forwards `code` + `state` to FastAPI `POST /auth/google/callback`. FastAPI exchanges the code with Google, upserts the user, issues local tokens, and responds with `{ access_token, refresh_token, redirect_to }`.
5. **Session persist** – The Next.js callback route calls `/api/auth/session` (same origin) to set HttpOnly cookies `_session` and `_refresh`, revalidates caches, and redirects or closes the popup.

## 2. Backend Architecture (FastAPI)
### 2.1 Dependencies
- FastAPI, Uvicorn, Pydantic
- SQLAlchemy 2.0 async + asyncpg / SQLModel
- Alembic for migrations
- redis-py (async) for state storage
- httpx or aiohttp for HTTP calls
- google-auth (google.oauth2.id_token, google.auth.transport.requests)
- python-jose or PyJWT for signing JWTs
- passlib / argon2-cffi if supporting password login

### 2.2 Database Schema
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  google_sub TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  password_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  refresh_token_hash TEXT NOT NULL,
  user_agent TEXT,
  ip TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 2.3 Services
**GoogleAuthService**
- `start_auth(redirect_to)` → generates `state`, `code_verifier`, `code_challenge`, stores JSON in Redis (`google-state:{state}`) with TTL 300s, returns Google auth URL.
- `exchange_code(code, code_verifier)` → POST to `https://oauth2.googleapis.com/token`.
- `verify_id_token(id_token)` → `google.oauth2.id_token.verify_oauth2_token`.

**UserService**
- `upsert_google_user(payload)`:
  ```py
  user = await session.scalar(select(User).where(User.email == payload["email"]))
  if not user:
      user = User(email=payload["email"], google_sub=payload["sub"],
                  display_name=payload.get("name"), avatar_url=payload.get("picture"))
      session.add(user)
  else:
      user.google_sub = payload["sub"]
      user.display_name = payload.get("name")
      user.avatar_url = payload.get("picture")
  await session.commit()
  return user
  ```

**AuthService**
- `handle_google_callback(code, state)`:
  1. Load state entry from Redis; reject if missing (prevents replay).
  2. Exchange code using stored `code_verifier`.
  3. Verify ID token; enforce `email_verified`.
  4. Upsert user.
  5. Issue JWT: `jwt.encode({"sub": str(user.id), "actor": "customer", "email": user.email, "provider": "google", "iat": now, "exp": now + 3600}, JWT_SECRET, algorithm="HS256")`.
  6. Generate refresh token (256-bit random), hash via bcrypt/argon2, insert session row (`expires_at = now + 7d`).
  7. Return tokens + user DTO + stored `redirect_to`.

### 2.4 FastAPI Routes
| Method | Path | Description |
| --- | --- | --- |
| POST | `/auth/google/start` | Body `{redirect_to?: string}`. Returns `{auth_url}`. |
| POST | `/auth/google/callback` | Body `{code, state}`. Returns `{access_token, refresh_token, user, redirect_to}`. |
| POST | `/auth/session` | Accepts tokens, sets cookies (when frontend is cross-origin popup). |
| GET | `/auth/me` | JWT guard; returns current user. |
| POST | `/auth/refresh` | Validates refresh cookie/token, rotates session. |
| POST | `/auth/logout` | Revokes refresh token, clears cookies. |

Use dependency injection for DB session + Redis. Leverage FastAPI’s `Depends` to attach `current_user`.

## 3. Frontend (Next.js)
1. **`POST /api/auth/google/start`**  
   - Validates `returnTo`.  
   - Calls FastAPI start endpoint.  
   - Sets `google_state` & `google_return_to` cookies (HttpOnly, SameSite=Lax).  
   - Returns `auth_url`.

2. **`/auth/google/callback` route**  
   - Reads search params `code`, `state`.  
   - Asserts cookie state matches; otherwise show error.  
   - Calls FastAPI `/auth/google/callback`.  
   - Receives tokens + `redirect_to`.  
   - Calls local `POST /api/auth/session` to set `_session`/`_refresh` cookies (HttpOnly, Secure, Lax).  
   - Revalidates `customers`, `cart` tags, closes popup (if `window.opener`) via `postMessage`, and navigates to `redirect_to` or `/account`.

3. **Session utilities**  
   - `useSession` hits `/api/me` (proxies FastAPI `/auth/me`) to keep client state.  
   - `useLogout` calls `/api/auth/logout`, clears cookies, revalidates caches.

4. **Popup messaging** – Mirror the pattern we shipped in Medusa: popup renders success/failure message and `postMessage` payload `{ source: "google-oauth-popup", success, redirectUrl }` to the opener.

## 4. Security & Operational Lessons
1. **Never bypass official data layers** – Use SQLAlchemy sessions exclusively; don’t reintroduce the “import TypeORM models directly” mistake that caused blank `actor_id`.  
2. **Complete JWT claims** – Include `sub`, `actor`, `email`, `provider`, `iat`, `exp`. Downstream APIs depend on `sub` to authorize quickly.  
3. **State/PKCE storage** – Keep state entries in Redis (value includes `code_verifier` + intended redirect). Delete on use to prevent replay.  
4. **Session write-back** – Popup workflows require an explicit `/api/auth/session` call to set cookies before closing; otherwise users see “success” but remain logged out (the exact failure we chased for a day).  
5. **Docker/runtime hygiene** – If packaging FastAPI, ensure dependencies are installable (poetry/pip). For pnpm-like setups, export `PYTHONPATH`/`NODE_PATH` to avoid “Cannot find module” issues.  
6. **Instrumentation** – Log structured events: start, callback, user upsert, token issue. Include correlation ID = state. Add metrics (success/failure counts, durations).  
7. **Debug tooling** – Provide `/api/debug/token` & `/api/debug/me` (restricted to dev) to introspect JWT payloads quickly. This shaved hours off troubleshooting during the Medusa fix.  
8. **Alerts** – Trigger alerts if `/auth/google/callback` failure rate >1% or if `/auth/me` starts returning 401 for recent logins.

## 5. Testing & Verification
| Level | What to test | Tooling |
| --- | --- | --- |
| Unit | `handle_google_callback` with mocked Google responses; ensures user upsert + token issue | pytest + respx/httpx mocking |
| Integration | Spin up FastAPI + test Postgres; call `/auth/google/callback` with fake code; expect 400 when state missing | pytest-asyncio |
| E2E | Playwright hitting Next.js login page using a test Google account; expect `_session` cookie + `/account` content | Playwright |
| Debug | `curl -H "Authorization: Bearer <token>" /auth/me` | Manual |

By applying this plan, a FastAPI backend can deliver reliable Google SSO, leveraging the core insights from the Medusa remediation: keep auth logic server-side, use official service layers, wire Docker/runtime variables explicitly, and instrument every stage so regressions surface within minutes—not after “1 天 1 夜” of guesswork.
