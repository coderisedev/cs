# Medusa Product Media on Cloudflare R2

## 1. Prepare Cloudflare R2
1. Create an R2 bucket (e.g., `dji-products`).
2. Generate API tokens (Access Key / Secret) with read/write permissions.
3. Note the values:
   - `R2_ACCOUNT_ID`
   - `R2_BUCKET`
   - `R2_ACCESS_KEY_ID`
   - `R2_SECRET_ACCESS_KEY`
   - Optional public base URL (default `https://<account>.r2.cloudflarestorage.com/<bucket>` or custom domain).

## 2. Medusa Environment Variables
Add to `.env` / deployment config:
```
AWS_ACCESS_KEY_ID=<R2_ACCESS_KEY_ID>
AWS_SECRET_ACCESS_KEY=<R2_SECRET_ACCESS_KEY>
AWS_REGION=auto
S3_ENDPOINT=https://<R2_ACCOUNT_ID>.r2.cloudflarestorage.com
S3_BUCKET=<R2_BUCKET>
S3_FORCE_PATH_STYLE=true
```
These reuse S3-style names but point to R2.

## 3. Configure S3 Upload Plugin
- Install if needed: `pnpm add @medusajs/medusa-file-s3`.
- In `medusa-config.js`:
```js
const plugins = [
  {
    resolve: "@medusajs/medusa-file-s3",
    options: {
      s3_url: process.env.S3_ENDPOINT,
      bucket: process.env.S3_BUCKET,
      region: process.env.AWS_REGION,
      access_key_id: process.env.AWS_ACCESS_KEY_ID,
      secret_access_key: process.env.AWS_SECRET_ACCESS_KEY,
      s3_force_path_style: process.env.S3_FORCE_PATH_STYLE === "true",
    },
  },
  // other plugins
]
```
This directs Medusa's upload service to R2’s S3-compatible API.

## 4. Restart & Verify
- Restart Medusa (`pnpm develop`/`pnpm start`).
- Upload a product image via Medusa Admin; the URL should point to the R2 endpoint.
- Confirm files appear in the R2 bucket.

## 5. Custom Domains / CDN
- If using a custom domain for R2, configure it via Cloudflare (R2 Custom Domains or Worker) and adjust your front-end media resolver accordingly.
- Ensure Next.js `next.config.js` allows the R2 (or custom CDN) domain for `<Image>`.

With these steps, Medusa product uploads will be stored in Cloudflare R2 instead of the local filesystem.
