目标是：**全世界统一成一个站点，用英文 + 美元（USD）**，不再按来访者的国家/地区切换。

下面给你两套做法——**最小改动**（保留 `/us` 前缀但对用户“固定为 US”），和**干净路由**（去掉国家前缀 `/` 纯净域名）。你任选其一。

前端是 apps/dji-storefront
---

# 方案 A｜最小改动（推荐：改动最少，最快上线）

> 思路：保留模板的 `/us` 路由结构和 Region 机制，但**强制永远使用 US**，关闭一切地理检测与回退。

**后端（Medusa Admin / API）**

1. 只保留一个 Region（或将“主 Region”设为默认）

   * 货币：USD
   * 语言（可选）：英语
   * Countries：至少包含 US；如果你要**允许全球地址下单**，需要把可寄送国家都加入这个 Region（即“Global USD Region”）。
   * 税率、配送配置、销售渠道按需设定。

**前端（Next.js Storefront）**
2) `.env`

```bash
NEXT_PUBLIC_DEFAULT_REGION=us
# 如果有 REGION_ID（后端已知），也一并写入便于前端创建购物车
NEXT_PUBLIC_REGION_ID=<your_us_region_id>
```

3. `src/middleware.ts`

* 关闭地理识别 & 重定向，只保留“如果没有国家段就跳到 /us”的逻辑。
* 或者更简单：任何国家段都**301 到 /us**。

```ts
// 伪代码示例
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(req: NextRequest) {
  const url = req.nextUrl
  const pathname = url.pathname

  // ① 已是 /us 前缀 -> 放行
  if (pathname === "/us" || pathname.startsWith("/us/")) {
    return NextResponse.next()
  }

  // ② 其他任何国家前缀，统统 301 到 /us 保持统一
  // 匹配 /xx 或 /xx/ ...（两位或多位字母国家码）
  const countryPrefix = /^\/[a-z]{2}(\/|$)/i
  if (countryPrefix.test(pathname)) {
    url.pathname = pathname.replace(countryPrefix, "/us$1")
    return NextResponse.redirect(url, 301)
  }

  // ③ 根路径或非前缀路由 -> 301 到 /us
  url.pathname = `/us${pathname === "/" ? "" : pathname}`
  return NextResponse.redirect(url, 301)
}
```

4. **创建购物车/取价一律使用 US Region**

* 查 `cart` 创建位置（通常在 cart provider / hooks）：

```ts
await medusaClient.carts.create({
  region_id: process.env.NEXT_PUBLIC_REGION_ID, // 必须是 US region id
  // sales_channel_id: <可选>
})
```

* 拉取商品价格时传 `region_id`（某些模板已自动处理），保证价格统一为 USD。

5. UI：隐藏国家切换组件或把选择固定为“United States / USD”。

> 优点：基本不改目录结构/页面文件；风险小，最快交付。
> 缺点：URL 依然是 `/us/...`，但对大多数用户无影响。

---

# 方案 B｜干净路由（/ 没有国家前缀）

> 思路：把 `app/[countryCode]/...` 改成无国家段的普通路由，同时在代码里把“国家/Region”从 URL 参数改为**常量**。

**后端**

1. 同方案 A：建立/保留一个 USD Region（“US 或 Global-USD”），按需要加入能寄送的国家清单。

**前端**
2) **删除/停用中间件**

* 直接移除 `src/middleware.ts`（或让它 `return NextResponse.next()` 不做任何事）。

3. **重构路由目录**

* 把 `app/[countryCode]/layout.tsx` / `page.tsx` 等文件**上移**到 `app/` 根：

  * `app/[countryCode]/page.tsx` → `app/page.tsx`
  * `app/[countryCode]/products/...` → `app/products/...`
  * 依次类推。
* 将所有读取 `params.countryCode` 的地方，替换为**常量**：

```ts
export const DEFAULT_COUNTRY = "us";
export const DEFAULT_REGION_ID = process.env.NEXT_PUBLIC_REGION_ID!;
```

4. **把“国家上下文”替换成“Region 常量上下文”**

* 如果项目里有 `CountryProvider` / `RegionProvider` 之类 Context，把其来源从 `params` 改为常量：

```tsx
<RegionProvider
  countryCode="us"
  regionId={process.env.NEXT_PUBLIC_REGION_ID}
/>
```

5. **购物车/价格统一 USD**

* 同方案 A：创建购物车时固定 `region_id=US_REGION_ID`；商品价格查询用同一个 region。

6. **移除（或固化）国家切换入口**

* 去掉“切换国家/货币”UI，或保留但仅显示“US / USD”不可改。

> 优点：URL 更干净（无 `/us`）。
> 缺点：需要改动路由 & 若干读取 params 的代码，测试量稍大。

---

## 常见坑 & 处理建议

* **国际地址能否下单？**
  Medusa 的“地址国家”必须属于某个 Region 的国家列表。要做“全球地址 + USD 结算”，请把你愿意寄送的国家**都加入同一 USD Region**；税率、配送方式按需配置。
* **后端多 Region 残留**
  若后端仍保留多个 Region，前端又改成常量 USD，容易出现“价格不匹配/购物车 region 不一致”。要么只保留一个 Region，要么确保所有创建/查询都指向 USD Region。
* **中间件仍在重定向**
  忘记移除/关掉 `x-vercel-ip-country` 识别会导致访问被重定向到其他国家段。务必停用。
* **SSR 缓存与 Cookie**
  之前的模板可能读 `country_code` cookie。统一站点时，清理这段读取逻辑或强制写 `us`。

---

## 一键检查清单

* [ ] Admin 里仅一个（或主）Region：USD + 目标国家列表
* [ ] `.env`：`NEXT_PUBLIC_DEFAULT_REGION=us`，`NEXT_PUBLIC_REGION_ID=<US ID>`
* [ ] 关掉/删除 `middleware.ts` 的地理识别与前缀强制（或固定 301 到 `/us`）
* [ ] 创建购物车统一 `region_id=US_REGION_ID`
* [ ] 商品价格查询统一 `region_id=US_REGION_ID`
* [ ] 去除“切换国家/货币”UI（或固定为 US/USD）
* [ ] 路由是否保留 `/us`（方案 A）还是彻底移除（方案 B）

---

如果你把**仓库链接或 `src/middleware.ts` + 购物车创建的代码片段**发我（隐去敏感信息即可），我直接给你贴**对口的最小改动 diff**，保证全站锁到英文 + USD。
