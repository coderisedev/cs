# Medusa + Google OAuth Integration Plan

## 1. Google Cloud Setup
1. In Google Cloud Console, create OAuth client:
   - **OAuth Consent Screen**: configure user-facing info.
   - **Credentials → Create Credentials → OAuth client ID**.
   - App type: "Web application".
   - Authorized redirect URIs: point to Medusa backend callback, e.g. `https://<medusa-host>/store/google/callback` (add dev/prod variants).
2. Save `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.
3. Ensure required APIs (Google People API) are enabled.

## 2. Medusa Plugin Configuration
1. Install `medusa-plugin-auth` if not already:
   ```bash
   pnpm add medusa-plugin-auth
   ```
2. In `medusa-config.js`, configure the plugin:
   ```js
   const plugins = [
     {
       resolve: "medusa-plugin-auth",
       options: {
         providers: {
           google: {
             clientId: process.env.GOOGLE_CLIENT_ID,
             clientSecret: process.env.GOOGLE_CLIENT_SECRET,
             callbackUrl: `${process.env.MEDUSA_BACKEND_URL}/store/google/callback`,
             scopes: ["profile", "email"],
           },
         },
       },
     },
   ]
   ```
3. Add `.env` entries:
   ```env
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   MEDUSA_BACKEND_URL=https://medusa.localhost:9000
   ```
4. Restart Medusa. The plugin exposes `/store/auth/google` (init) and `/store/google/callback` (handler).

## 3. Backend Verification
- Test `GET /store/auth/google` in browser → should redirect to Google.
- After consent, ensure Medusa creates/links customer and issues `_medusa_jwt`.
- Check Medusa logs for auth plugin errors.

## 4. Frontend Wiring (apps/dji-storefront)
1. Add “Continue with Google” button on login page:
   ```ts
   const medusaGoogleUrl = `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/auth/google`
   window.location.href = medusaGoogleUrl
   ```
2. Ensure `NEXT_PUBLIC_MEDUSA_BACKEND_URL` matches backend domain.
3. After redirect back, `_medusa_jwt` cookie should be set for the storefront domain. Configure Medusa CORS/cookie domain if backend & frontend differ.
4. Handle loading/error states when user returns from Google.

## 5. Edge Cases & Security
- Decide how to handle unverified emails (Google returns `email_verified`).
- Ensure Medusa’s customer uniqueness (plugin typically merges on email).
- Provide logout route clearing `_medusa_jwt`.
- Update cookie settings (`COOKIE_DOMAIN`, `JWT_SECRET`) if necessary.

## 6. Testing
- Use test Google account.
- Scenarios: new customer, existing customer, error/cancel flow.
- Validate on both local/dev/prod domains.

## 7. Deployment Notes
- Update Google OAuth credentials with production redirect URIs.
- Store secrets in deployment environment (Render, Railway, etc.).
- Document flow for QA/support.
