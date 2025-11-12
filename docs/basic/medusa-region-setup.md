## Single-Region Medusa Setup

- Keep just one `region` row in the Medusa DB (US, USD). Its generated ID (e.g. `reg_01K9KE3SV4Q4J745N8T19YTCMH`) drives every consumer-facing flow, so never hard-code someone else’s ID.
- All carts/orders/prices must include that `region_id`. If the ID doesn’t exist, `/store/carts` returns 404 and logs “No regions found”.
- Medusa itself reads regions from the DB—you don’t set `REGION_ID` in its `.env`. Instead, make sure seeds/config use the real ID whenever they create carts or price sets.
- Frontend (Next.js) must carry the same ID:
  - Set `NEXT_PUBLIC_REGION_ID` to your US region ID in Vercel (Production & Preview). Rebuild after any change so Next.js bundles pick up the new constant.
  - Keep a matching fallback in `apps/dji-storefront/src/lib/constants.ts` (`US_REGION_ID`).
  - `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` must also be present, otherwise Medusa rejects `/store/*` calls.
- Verify after deploy: curl `_next/static/...` bundle to confirm the ID, run “Add to Cart”, check Medusa logs—no “No regions found”.
- Admin access: enable `MEDUSA_ADMIN_DISABLE=false`, create admins via `pnpm medusa user -e … -p …` inside the container. Current one is `admin@aidenlux.com / BsoFf!472Z`.

## Frontend & Backend Config Checklist

1. **Medusa VM**
   - DB `region` table has only the US row with ID `reg_01K9KE3SV4Q4J745N8T19YTCMH`.
   - `deploy/gce/medusa.env` keeps `MEDUSA_ADMIN_DISABLE=false` so `/app` works.
   - Publishable key created via Admin → Settings → Publishable API Keys.
2. **Vercel (apps/dji-storefront)**
   - `NEXT_PUBLIC_REGION_ID=reg_01K9KE3SV4Q4J745N8T19YTCMH`
   - `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=<pk_…>`
   - `MEDUSA_BACKEND_URL=https://api.aidenlux.com`
   - (Optional toggles: Google popup/One Tap, Strapi URLs, etc.)
   - Redeploy after editing env vars to bake them into the bundle.
3. **App code**
   - `US_REGION_ID` constant matches the same ID as a fallback.
   - Cart server actions always call `sdk.store.cart.create({ region_id: US_REGION_ID })`.
4. **Validation**
- After deploy, Playwright/real browser: “Add to Cart” increments cart.
- Medusa logs show `/store/carts` 200, no `No regions found`.
- Admin login tested via `admin@aidenlux.com / BsoFf!472Z`.

---

## 中文速记：单区域 Medusa 配置要点

1. **后端（Medusa）**
   - 数据库只保留一个 Region（US/美元），记住该 Region 的 ID（例如 `reg_01K9KE3SV4Q4J745N8T19YTCMH`），不要沿用别的环境的 ID。
   - 任何后端脚本/服务在创建购物车、订单、价格或库存时都必须使用这个 ID，否则会出现 “No regions found”。
   - 管理后台保持开启 (`MEDUSA_ADMIN_DISABLE=false`)，管理员账号通过 `pnpm medusa user -e ... -p ...` 创建。

2. **前端（Vercel 上的 dji-storefront）**
   - 环境变量必须配置：  
     - `NEXT_PUBLIC_REGION_ID=reg_01K9KE3SV4Q4J745N8T19YTCMH`  
     - `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=<Medusa 后台生成的 pk_...>`  
     - `MEDUSA_BACKEND_URL=https://api.aidenlux.com`
   - 修改这些变量后一定要重新部署 Next.js，新的常量才会写入 bundle。
   - 代码中 `US_REGION_ID` 也要保持与数据库一致，以防 env 缺省。

3. **验证流程**
   - 重建后访问 `/us/products`，点击 “Add to Cart” 应该成功；Medusa 日志不再出现 `No regions found`。
   - 如遇 404/500，第一时间检查 Region ID 是否一致、Publishable Key 是否被正确注入前端。
   - 后台登录使用 `admin@aidenlux.com / BsoFf!472Z`（必要时再重置）。
