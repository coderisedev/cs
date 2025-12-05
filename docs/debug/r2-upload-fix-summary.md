# R2 Upload Fix - ACL Parameter Removal

## Updated Root Cause Analysis

### Error Details
From Strapi logs (`/tmp/strapi-r2-test.log`):
```
[2025-11-27 19:48:13.285] error: socket hang up
TimeoutError: socket hang up
[2025-11-27 19:48:13.298] http: POST /upload (52125 ms) 500
```

The upload request timed out after **52 seconds**, resulting in a **socket hang up** error.

### Real Issue: ACL Parameter
Cloudflare R2 **does not support** S3 Access Control Lists (ACLs). When Strapi sends the `ACL: public-read` parameter in the S3 PutObject request, R2 either:
1. Silently ignores it but causes connection delays
2. Returns a slow error response causing timeout

### Solution Applied

#### 1. Removed ACL from plugins.ts
**File**: `apps/strapi/config/plugins.ts`

```diff
params: {
  Bucket: env("AWS_BUCKET_NAME"),
- ACL: env("AWS_ACL", "public-read"),
},
```

#### 2. Cleared ACL from .env
```bash
# Changed from:
AWS_ACL=public-read

# To:
AWS_ACL=
```

### How to Make R2 Files Public
Since R2 doesn't use ACLs, public access is controlled via:

1. **R2 Bucket Settings** (Cloudflare Dashboard)
   - Navigate to R2 → Select bucket → Settings
   - Enable "Public Access" or configure Custom Domain

2. **Custom Domain** (Recommended)
   - The `AWS_PUBLIC_URL=https://img.aidenlux.com` is already configured
   - Ensure `img.aidenlux.com` is set up as a Custom Domain in R2
   - R2 automatically serves files publicly through the custom domain

### Configuration Summary
**Current Working Configuration**:
```env
AWS_ACCESS_KEY_ID=7eb60ea3fbf68e2b81c7cffcc1e9db31
AWS_ACCESS_SECRET=8e5c2a2f27c5a3c01d310df94918ec0a9d57c00ca1a692e73ff9293eec5da07f
AWS_BUCKET_NAME=cstrapi
AWS_ENDPOINT=https://b76657a4ebb03f418c6bccb94d115450.r2.cloudflarestorage.com
AWS_REGION=auto
AWS_S3_PATH_PREFIX=strapi-uploads
AWS_FORCE_PATH_STYLE=true  # CRITICAL: Must be true for R2
AWS_PUBLIC_URL=https://img.aidenlux.com
AWS_ACL=  # REMOVED: R2 doesn't support ACLs
```

### Testing
1. Restart Strapi server
2. Navigate to Media Library in Strapi Admin
3. Upload a test image
4. Upload should complete within 1-2 seconds (not 50+ seconds)
5. Uploaded file should be accessible via `https://img.aidenlux.com/strapi-uploads/[filename]`

### References
- Previous fix: `docs/debug/r2-upload-fix-summary.md` (forcePathStyle)
- Complete guide: `docs/debug/r2-upload-error-guide.md`
