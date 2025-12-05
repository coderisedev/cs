# OTP Email Registration Implementation

**Date:** 2025-12-05
**Status:** Completed
**Feature:** Email OTP verification during user registration

## Overview

Implemented a 6-digit email OTP (One-Time Password) verification system for user registration. Users now enter their email first, receive a verification code, and then complete their profile after verification.

## User Flow

1. **Email Entry** - User enters email address
2. **OTP Sent** - System sends 6-digit code to email
3. **OTP Verification** - User enters the code (10 min expiry, max 3 attempts)
4. **Profile Completion** - User sets password and enters name
5. **Account Created** - User is automatically logged in

## Technical Implementation

### Backend (Medusa)

#### New Files Created

| File | Description |
|------|-------------|
| `apps/medusa/src/utils/otp.ts` | OTP generation utilities, Redis key helpers, constants |
| `apps/medusa/src/api/store/auth/register/initiate/route.ts` | POST endpoint to send OTP email |
| `apps/medusa/src/api/store/auth/register/verify/route.ts` | POST endpoint to verify OTP code |
| `apps/medusa/src/api/store/auth/register/complete/route.ts` | POST endpoint to complete registration |
| `apps/medusa/src/api/store/auth/register/resend/route.ts` | POST endpoint to resend OTP |
| `apps/medusa/src/modules/resend-notification/emails/otp-verification.tsx` | React Email template for OTP |

#### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/store/auth/register/initiate` | POST | Validates email, generates OTP, stores in Redis, sends email |
| `/store/auth/register/verify` | POST | Validates OTP, marks email as verified |
| `/store/auth/register/complete` | POST | Creates customer + auth identity, returns JWT |
| `/store/auth/register/resend` | POST | Resends OTP with 60s cooldown |

#### Key Dependencies Added

```json
{
  "ioredis": "^5.8.2",
  "scrypt-kdf": "^4.0.0"
}
```

### Frontend (Next.js Storefront)

#### New/Modified Files

| File | Description |
|------|-------------|
| `apps/dji-storefront/src/components/auth/otp-input.tsx` | 6-digit OTP input component |
| `apps/dji-storefront/src/components/auth/login-client.tsx` | Updated with 4-view registration flow |
| `apps/dji-storefront/src/lib/actions/auth.ts` | Added 4 new server actions |

#### View States

```typescript
type ViewType = "signin" | "register" | "verify-otp" | "complete-profile"
```

### Data Storage

#### Redis (OTP Storage)

```typescript
interface PendingVerification {
  email: string
  otp: string
  verified: boolean
  attempts: number
  createdAt: number
}
// Key format: otp:register:{email}
// TTL: 600 seconds (10 minutes)
```

#### PostgreSQL (Auth Identity)

Creates proper Medusa auth records:
- `auth_identity` table: Contains `app_metadata.customer_id`
- `provider_identity` table: Contains hashed password in `provider_metadata.password`

## Challenges & Solutions

### 1. Resend Email Domain Verification

**Problem:** Initial setup used `onboarding@resend.dev` test email which only sends to verified email addresses.

**Solution:** Verified `aidenlux.com` domain in Resend with DNS records (DKIM, SPF, MX).

### 2. Password Hashing Compatibility

**Problem:** Initial implementation stored password in customer metadata, but Medusa's `emailpass` provider expects auth_identity records with scrypt-hashed passwords.

**Solution:**
- Use `scrypt-kdf` package (same as Medusa)
- Create proper `auth_identity` and `provider_identity` records
- Hash password with params: `{ logN: 15, r: 8, p: 1 }`

### 3. Scrypt Memory Limit Error

**Problem:** Node.js crypto.scrypt with `N=2^15` exceeded memory limits.

**Solution:** Use `scrypt-kdf` package which handles this properly with native bindings.

### 4. ESM Module Import

**Problem:** `scrypt-kdf` is an ESM module, couldn't use regular `import` in CommonJS context.

**Solution:** Dynamic import with type assertion:
```typescript
const scryptModule: any = await import("scrypt-kdf")
const hash = await scryptModule.default.kdf(password, { logN: 15, r: 8, p: 1 })
```

### 5. Frontend Environment Variables

**Problem:** Server actions using wrong environment variable prefix.

**Solution:** Use `MEDUSA_BACKEND_URL` (server-side) instead of `NEXT_PUBLIC_MEDUSA_BACKEND_URL`.

## Configuration

### Environment Variables (`.env.dev`)

```bash
# Resend Email (Production Mode)
RESEND_API_KEY=re_xxx
RESEND_FROM_EMAIL=noreply@aidenlux.com
RESEND_FROM_NAME=Cockpit Simulator
```

### DNS Records for Resend

| Type | Name | Value |
|------|------|-------|
| TXT | `resend._domainkey` | DKIM public key |
| MX | `send` | `feedback-smtp.us-east-1.amazonses.com` (priority 10) |
| TXT | `send` | `v=spf1 include:amazonses.com ~all` |

## Security Features

- **OTP Expiry:** 10 minutes
- **Max Attempts:** 3 per OTP
- **Resend Cooldown:** 60 seconds
- **Password Hashing:** scrypt with secure parameters
- **Email Normalization:** Lowercase and trim

## Testing Checklist

- [x] OTP email delivery
- [x] OTP verification (correct code)
- [x] OTP verification (incorrect code - attempt tracking)
- [x] OTP expiration
- [x] Resend cooldown
- [x] Complete registration
- [x] Login with new account
- [x] Duplicate email prevention

## Future Improvements

1. Add rate limiting on initiate endpoint
2. Add CAPTCHA for abuse prevention
3. Support phone number OTP as alternative
4. Add "Remember this device" option
5. Implement password reset with same OTP flow
