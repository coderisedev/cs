# Authentication Providers Comparison

## Overview

This document explains how different authentication methods work in the system and how they store data in the database.

## Authentication Methods

| Method | Description | Password Required |
|--------|-------------|-------------------|
| emailpass | Traditional email + password login | Yes (scrypt hashed) |
| Google OAuth | Login with Google account | No |
| Discord OAuth | Login with Discord account | No |

## Database Storage Comparison

### Tables Involved

- `customer` - User profile data (email, name, phone)
- `auth_identity` - Authentication identity record
- `provider_identity` - Provider-specific authentication data

### Data Structure by Provider

| Field | emailpass | Google OAuth | Discord OAuth |
|-------|-----------|--------------|---------------|
| `auth_identity.app_metadata` | `{"customer_id": "cus_xxx"}` | Empty or null | Empty or null |
| `provider_identity.provider` | `emailpass` | `google` | `discord` |
| `provider_identity.entity_id` | User email | Google sub ID (numeric) | Discord user ID |
| `provider_identity.provider_metadata` | `{"password": "scrypt_hash"}` | **Empty** | **Empty** |

### Database Record Examples

**emailpass User:**
```sql
-- auth_identity
id: authid_01KBPxxx
app_metadata: {"customer_id": "cus_01KBPxxx"}

-- provider_identity
provider: "emailpass"
entity_id: "user@example.com"
provider_metadata: {"password": "c2NyeXB0AA8..."}  -- scrypt hash
```

**Google User:**
```sql
-- auth_identity
id: authid_01K9V4xxx
app_metadata: null

-- provider_identity
provider: "google"
entity_id: "109647465181878839448"  -- Google sub ID
provider_metadata: null  -- No password!
```

**Discord User:**
```sql
-- auth_identity
id: authid_01KABxxx
app_metadata: null

-- provider_identity
provider: "discord"
entity_id: "123456789012345678"  -- Discord user ID
provider_metadata: null  -- No password!
```

## Authentication Flows

### Email + Password (with OTP Verification)

```
User enters email
    ↓
System sends 6-digit OTP to email
    ↓
User enters OTP code
    ↓
System verifies OTP (stored in Redis, 10min TTL)
    ↓
User sets password and profile info
    ↓
System creates:
  - customer record
  - auth_identity record (with customer_id)
  - provider_identity record (with scrypt password hash)
    ↓
JWT token generated, user logged in
```

### Google OAuth

```
User clicks "Login with Google"
    ↓
Redirect to Google authorization page
    ↓
Google verifies user identity (password, 2FA, etc.)
    ↓
Google returns authorization code
    ↓
Backend exchanges code for id_token
    ↓
Extract email and sub (Google user ID) from id_token
    ↓
Find or create customer record
    ↓
JWT token generated (includes provider: "google", sub)
    ↓
User logged in
```

### Discord OAuth

```
User clicks "Login with Discord"
    ↓
Redirect to Discord authorization page
    ↓
Discord verifies user identity
    ↓
Discord returns authorization code
    ↓
Backend exchanges code for access_token
    ↓
Fetch user info from Discord API
    ↓
Find or create customer record
    ↓
JWT token generated (includes provider: "discord")
    ↓
User logged in
```

## Why Third-Party Login Doesn't Need Password?

1. **Identity verification by third-party** - Google/Discord handles password verification, 2FA, etc.
2. **OAuth tokens** - Backend only needs to verify OAuth token validity
3. **entity_id as unique identifier** - Uses third-party user ID (e.g., Google sub) as identifier
4. **Trust delegation** - If Google says the user is verified, we trust that assertion

## Code Independence

| Feature | Code Path | Description |
|---------|-----------|-------------|
| OTP Registration | `/store/auth/register/*` | 4 new API routes |
| Email/Password Login | `/auth/customer/emailpass` | Medusa built-in |
| Google Login | `/auth/customer/google/callback` | Custom OAuth handler |
| Discord Login | `/auth/customer/discord/callback` | Custom OAuth handler |

## Security Considerations

### Password Storage (emailpass only)
- Algorithm: scrypt-kdf
- Parameters: logN=15, r=8, p=1
- Format: Base64 encoded scrypt output
- Never stored in plain text

### OAuth Security
- Tokens validated against provider's public keys
- Short-lived access tokens
- State parameter to prevent CSRF
- Email verification required from provider

### JWT Tokens
- Signed with HS256 using JWT_SECRET
- Contains: actor_type, actor_id, provider, exp
- 7-day expiration
- Stored in HTTP-only cookies

## Impact Analysis

The OTP email verification feature is **completely independent** from third-party login:

- Different API endpoints
- Different authentication flows
- Different data storage patterns
- No shared code paths

Changes to OTP registration will not affect Google or Discord login functionality.
