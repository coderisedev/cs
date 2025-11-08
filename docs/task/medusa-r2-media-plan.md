# Medusa 媒体迁移到 Cloudflare R2 规划

目标：让 Medusa（产品图片、上传文件）与 Strapi 共用同一个 R2 Bucket（`cstrapi`），但落在不同前缀（如 `medusa-uploads/`），统一走自定义域 `https://img.aidenlux.com`。

## 背景与上下文

- **整体架构**：Next.js `apps/dji-storefront` 作为体验层，Medusa 负责电商交易，Strapi 负责 Blog / Product Detail 等内容，前端统一通过 `src/lib/data/*` 的 server helpers 拉取数据。
- **当前媒体策略**：Strapi 已迁移到 Cloudflare R2，并通过 `@strapi/provider-upload-aws-s3` + 自定义域 `img.aidenlux.com` 暴露 `strapi-uploads/` 前缀。
- **问题痛点**：Medusa 仍使用默认文件服务（本地磁盘或旧 S3），媒体分散导致 CDN 与缓存策略不统一，无法重用 `img.aidenlux.com`，也增加了备份成本。
- **迁移目标**：让 Medusa 也写入同一 bucket，只是使用 `medusa-uploads/` 前缀，与 Strapi 的 `strapi-uploads/` 相互隔离但共享域名/ACL，方便后续自动化与监控。
- **相关资料**：`docs/basic/medusa-r2-uploads.md` 记录了 R2 域名接入与权限策略；本规划聚焦 Medusa 端的实现步骤。

## 现状
- Medusa 产品图片目前存放在其默认文件服务（可能是本地 `uploads/` 或旧 S3）。
- Strapi 已使用 `cstrapi` bucket + 自定义域 `img.aidenlux.com`，路径为 `strapi-uploads/...`。
- 我们希望 Medusa 也写入同一 bucket，方便 CDN 统一、权限管理、备份。

## 方案设计
1. **采用 Medusa S3 File Service**
   - 使用官方的 `@medusajs/file-s3`（或旧包 `medusa-file-s3`，视当前 Medusa 版本而定）。
   - 通过 `medusa-config.js` 注册 S3 file service，并设置 `s3_url`, `bucket`, `endpoint`, `region`, `prefix`。

2. **R2 参数与 Strapi 共用**
   - `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY`：复用 Strapi 配置。
   - `AWS_ENDPOINT=https://b76657a4ebb03f418c6bccb94d115450.r2.cloudflarestorage.com`
   - `AWS_REGION=auto`，`AWS_FORCE_PATH_STYLE=true`。
   - `AWS_BUCKET_NAME=cstrapi`。
   - `AWS_PUBLIC_URL=https://img.aidenlux.com`
   - **Medusa 专用前缀**：`MEDUSA_FILE_PREFIX=medusa-uploads`，Strapi 保持 `strapi-uploads`。

3. **Medusa 配置步骤**
   - 在 `apps/medusa/package.json` 安装 `@medusajs/file-s3`（与 `@medusajs/framework` 同版本）。
   - 更新 `apps/medusa/medusa-config.ts`，通过 `modules[Modules.FILE]` 注册 Cloudflare R2 提供方：
     ```ts
     import { Modules, defineConfig, loadEnv } from "@medusajs/framework/utils"
     // ...
     export default defineConfig({
       projectConfig: { /* 数据库、CORS 等 */ },
       modules: {
         [Modules.FILE]: {
           providers: [
             {
               id: "r2-file-storage",
               resolve: "@medusajs/file-s3",
               options: {
                 access_key_id: process.env.AWS_ACCESS_KEY_ID,
                 secret_access_key:
                   process.env.AWS_SECRET_ACCESS_KEY ??
                   process.env.AWS_ACCESS_SECRET,
                 bucket: process.env.AWS_BUCKET_NAME,
                 region: process.env.AWS_REGION ?? "auto",
                 endpoint: process.env.AWS_ENDPOINT,
                 file_url: process.env.AWS_PUBLIC_URL,
                 prefix: process.env.MEDUSA_FILE_PREFIX ?? "medusa-uploads/",
                 cache_control: process.env.MEDUSA_FILE_CACHE_CONTROL,
                 download_file_duration:
                   Number(process.env.MEDUSA_FILE_DOWNLOAD_TTL ?? 0) || undefined,
                 additional_client_config: {
                   forcePathStyle:
                     (process.env.MEDUSA_FILE_FORCE_PATH_STYLE ??
                       process.env.AWS_FORCE_PATH_STYLE ??
                       "true") === "true",
                 },
               },
             },
           ],
         },
       },
     })
     ```
   - `apps/medusa/.env`（未纳入 Git）使用真实的 Cloudflare R2 Access Key / Secret，`.env.template` 保留示例值，`.env.test` 提供假的本地端点以便自动化测试。
   - 重启 Medusa 服务：`pnpm --filter medusa dev`（或 `medusa start`）。

4. **前端对接**
   - 产品图片 URL 来自 Medusa API，本身就是 `file.url`，无需修改 Next.js，只需确保返回的 URL 已是 `https://img.aidenlux.com/medusa-uploads/...`。
   - 若 Medusa 返回相对路径，可在 Next.js 层拼接 `AWS_PUBLIC_URL`。

5. **数据迁移**
   - 旧有图片若存本地，需要脚本将 `uploads/` 文件上传到 R2 对应前缀，并在数据库（`product_images` 等表）里替换 URL。
   - 如果旧图片本身可继续访问，也可暂时不迁移，只从新增开始使用 R2。

6. **ACL / 公开访问**
   - R2 bucket 已通过 `img.aidenlux.com` 对外开放，Medusa 上传对象时 ACL 仍设为 `public-read`。
   - 目录结构：
     - `strapi-uploads/...`
     - `medusa-uploads/...`

7. **验证清单**
   - `pnpm --filter medusa dev` 后在 Medusa Admin 上传一张产品图片，确认 `product_images.url` 指向 `https://img.aidenlux.com/medusa-uploads/...`。
   - 直接访问该 URL，或在 R2 控制台中查看对象，确认路径落在 `medusa-uploads/` 前缀。
   - 观察 Medusa 终端输出与 `apps/medusa/.medusa/server/logs`，确保无 `SignatureDoesNotMatch` / `AccessDenied` 错误。
   - 如果需要自动化回归，可编写脚本命中 `/admin/uploads` 接口并断言响应 URL。

8. **后续工作**
   - 在 README / 部署文档中记录 Medusa R2 配置与变量。
   - 若未来还要上 legend（CN、EU 站），可以按 region 前缀划分，例如 `medusa-us/`, `medusa-eu/`。
   - 结合 `docs/task/product-detail-strapi-mapping.md` 的产品内容方案，确保产品详情页同时从 Medusa（基础信息 + SKU）和 Strapi（富文本/媒体）读取时，所有图片都指向 R2。

准备就绪后再进入实施阶段（安装依赖、改配置、迁移数据）。如需外包或多成员协作，可把本规划与 `docs/basic/medusa-r2-uploads.md` 一并分享，确保团队了解域名、凭证与依赖版本。
