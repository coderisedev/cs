# Cloudflare R2 Upload Error Debug Guide

## 问题现象
用户在 Strapi 后台上传图片到 Cloudflare R2 时报错。

## 环境配置检查

### 当前配置
```bash
AWS_ACCESS_KEY_ID=7eb60ea3fbf68e2b81c7cffcc1e9db31
AWS_ACCESS_SECRET=8e5c2a2f27c5a3c01d310df94918ec0a9d57c00ca1a692e73ff9293eec5da07f
AWS_BUCKET_NAME=cstrapi
AWS_ENDPOINT=https://b76657a4ebb03f418c6bccb94d115450.r2.cloudflarestorage.com
AWS_REGION=auto
AWS_ACL=public-read
AWS_S3_PATH_PREFIX=strapi-uploads
AWS_FORCE_PATH_STYLE=false
AWS_PUBLIC_URL=https://img.aidenlux.com
```

### plugins.ts 配置
```typescript
upload: {
  config: {
    provider: "@strapi/provider-upload-aws-s3",
    providerOptions: {
      baseUrl: env("AWS_PUBLIC_URL"),
      rootPath: env("AWS_S3_PATH_PREFIX", ""),
      s3Options: {
        credentials: {
          accessKeyId: env("AWS_ACCESS_KEY_ID"),
          secretAccessKey: env("AWS_ACCESS_SECRET"),
        },
        endpoint: env("AWS_ENDPOINT"),
        region: env("AWS_REGION", "auto"),
        forcePathStyle: env.bool("AWS_FORCE_PATH_STYLE", true),
        signatureVersion: "v4",
        params: {
          Bucket: env("AWS_BUCKET_NAME"),
          ACL: env("AWS_ACL", "public-read"),
        },
      },
    },
  },
}
```

## 常见问题排查

### 1. forcePathStyle 配置问题
**症状**: `AWS_FORCE_PATH_STYLE=false` 与 `plugins.ts` 中的默认值 `true` 不一致。

**R2 要求**: Cloudflare R2 **不支持** path-style URLs，必须使用 virtual-hosted-style。

**解决方案**: 确保 `.env` 设置为 `AWS_FORCE_PATH_STYLE=false`（已正确设置）。

### 2. ACL 权限问题
**症状**: R2 不完全支持 S3 的 ACL。

**R2 限制**: Cloudflare R2 会忽略 ACL 参数，存储桶的公开访问由 R2 Dashboard 设置控制。

**解决方案**: 
- 在 Cloudflare Dashboard → R2 → Bucket Settings 中确保 bucket 设置为 Public 或配置了 Custom Domain。
- 可选：移除 `AWS_ACL` 参数或设置为空字符串。

### 3. CORS 配置
**症状**: 浏览器控制台显示 CORS 错误。

**解决方案**: 在 Cloudflare R2 Dashboard 中配置 CORS 规则：
```json
[
  {
    "AllowedOrigins": ["http://localhost:1337", "https://your-domain.com"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

### 4. Public URL 配置
**症状**: 上传成功但图片链接无法访问。

**当前设置**: `AWS_PUBLIC_URL=https://img.aidenlux.com`

**验证**: 确保 `img.aidenlux.com` 已在 R2 Dashboard 中配置为 Custom Domain 并绑定到 `cstrapi` bucket。

### 5. 认证失败
**症状**: 403 Forbidden 或 SignatureDoesNotMatch 错误。

**解决方案**:
- 验证 R2 API Token 的 Access Key ID 和 Secret Access Key 是否正确。
- 确保 Token 具有对应 bucket 的读写权限。
- 检查时区和系统时间是否正确（影响签名计算）。

## 调试步骤

1. **查看 Strapi 日志**:
   ```bash
   # 检查终端输出或日志文件
   tail -f apps/strapi/.strapi/logs/*.log
   ```

2. **测试 R2 连接**:
   ```bash
   # 使用 AWS CLI 测试（需安装 aws-cli）
   aws s3 ls s3://cstrapi \
     --endpoint-url https://b76657a4ebb03f418c6bccb94d115450.r2.cloudflarestorage.com \
     --region auto
   ```

3. **浏览器开发者工具**:
   - Network 标签：查看 Upload 请求的状态码和响应
   - Console 标签：查看 JavaScript 错误

4. **Strapi Admin**:
   - Settings → Media Library → 尝试上传小文件测试
   - 查看 Network 请求的完整 error response

## 可能的错误信息

### InvalidRequest: The authorization mechanism you have provided is not supported
**原因**: 签名版本或认证方式不正确。
**解决**: Strapi 配置已设置 `signatureVersion: "v4"`，应该正确。

### SignatureDoesNotMatch
**原因**: Secret Access Key 错误或系统时间不准。
**解决**: 
1. 重新生成 R2 API Token
2. 检查系统时间: `date`

### NoSuchBucket
**原因**: Bucket 名称错误或不存在。
**解决**: 在 R2 Dashboard 确认 bucket 名称为 `cstrapi`。

### AccessDenied
**原因**: API Token 权限不足。
**解决**: 在 Cloudflare Dashboard 重新生成具有 Object Read & Write 权限的 API Token。

## 推荐配置调整

如果问题持续，尝试以下配置：

1. **简化上传配置** (临时测试):
   ```bash
   # .env
   AWS_FORCE_PATH_STYLE=false
   AWS_ACL=  # 留空
   AWS_S3_PATH_PREFIX=  # 留空
   ```

2. **启用详细日志**:
   ```typescript
   // config/env/development/plugins.ts
   upload: {
     config: {
       provider: "@strapi/provider-upload-aws-s3",
       providerOptions: {
         // ... 现有配置
         s3Options: {
           // ... 现有配置
           logger: console,  // 添加此行
         },
       },
     },
   },
   ```

## 下一步
请提供具体的错误信息（从浏览器 Console 或 Strapi 日志），以便进行更精确的排查。
