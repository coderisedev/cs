# Turborepo 完全指南

## 🚀 Turbo (Turborepo) 是什么？

**Turborepo** 是 Vercel 开发的**高性能 Monorepo 构建系统**，专门用于加速 JavaScript/TypeScript 项目的构建、测试和开发流程。

### 核心特性

1. **增量构建** - 只构建变更的部分
2. **智能缓存** - 本地和远程缓存构建结果
3. **并行执行** - 多任务并发运行
4. **任务编排** - 定义任务依赖关系
5. **多包管理** - 优化 Monorepo 工作流

---

## 📊 当前项目中的 Turbo 配置

### turbo.json 配置

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "lint": {
      "outputs": []
    },
    "test:unit": {
      "outputs": []
    },
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", "build/**", "out/**"]
    },
    "dev": {
      "cache": false
    }
  }
}
```

### package.json 中的使用

```json
{
  "scripts": {
    "lint": "turbo run lint",           // 运行所有包的 lint
    "test:unit": "turbo run test:unit", // 运行所有包的单元测试
    "build": "turbo run build",         // 构建所有包
    "typecheck": "turbo run typecheck"  // 类型检查
  },
  "devDependencies": {
    "turbo": "^2.1.1"                   // 当前安装版本 2.5.8
  }
}
```

---

## 🎯 实际应用场景

### 场景 1: 批量构建所有应用

#### 不使用 Turbo（串行，慢）

```bash
cd apps/medusa && pnpm build
cd ../strapi && pnpm build
cd ../storefront && pnpm build
# 总耗时：可能 5-10 分钟
```

#### 使用 Turbo（并行 + 缓存，快）

```bash
pnpm build

# Turbo 会：
# 1. 并行构建 medusa, strapi, storefront
# 2. 检测哪些包有变更
# 3. 只构建变更的包
# 4. 缓存构建结果
# 总耗时：可能 1-3 分钟（首次），10 秒（缓存命中）
```

### 场景 2: 统一代码检查

```bash
# 使用 Turbo 运行所有包的 lint
pnpm lint

# Turbo 执行流程：
# ├── apps/medusa (eslint)      ✓ 并行
# ├── apps/strapi (eslint)      ✓ 并行
# ├── apps/storefront (eslint)  ✓ 并行
# └── packages/config (eslint)  ✓ 并行
```

### 场景 3: 智能测试（只测试受影响的包）

```bash
# 修改了 apps/medusa/src/api/user.ts
pnpm test:unit

# Turbo 智能检测：
# ✓ apps/medusa 有变更 → 运行测试
# ✗ apps/strapi 无变更 → 跳过（使用缓存）
# ✗ apps/storefront 无变更 → 跳过（使用缓存）
```

### 场景 4: 依赖关系管理

```json
// turbo.json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],  // ^ 表示依赖包必须先构建
      "outputs": ["dist/**", "build/**", "out/**"]
    }
  }
}
```

**实际效果：**

```bash
pnpm build

# 执行顺序：
# 1. packages/config → build (shared library 先构建)
# 2. apps/medusa → build (依赖 config)
# 3. apps/strapi → build (依赖 config)
# 4. apps/storefront → build (依赖 config)
# ↑ 步骤 2-4 可以并行执行
```

---

## 💡 Turbo vs 传统方式对比

### 传统方式（没有 Turbo）

```bash
# 手动逐个执行
pnpm --filter medusa build
pnpm --filter strapi build
pnpm --filter storefront build
pnpm --filter config build

# 问题：
# ❌ 需要手动管理执行顺序
# ❌ 串行执行，速度慢
# ❌ 每次都完整构建，即使代码未变更
# ❌ 无缓存机制
```

### 使用 Turbo

```bash
# 一个命令完成
pnpm build

# 优势：
# ✅ 自动管理依赖关系
# ✅ 并行执行，速度快
# ✅ 智能检测变更，只构建需要的包
# ✅ 本地缓存，二次构建极快
# ✅ 支持远程缓存（团队共享）
```

---

## 📈 性能对比

### 场景：完整构建所有 3 个应用

| 方式 | 首次构建 | 无变更重新构建 | 只改 1 个文件 |
|------|---------|--------------|-------------|
| **手动串行** | 8 分钟 | 8 分钟 | 8 分钟 |
| **pnpm -r** | 8 分钟 | 8 分钟 | 8 分钟 |
| **Turbo 无缓存** | 3 分钟 | 3 分钟 | 1 分钟 |
| **Turbo 有缓存** | 3 分钟 | **10 秒** | **30 秒** |

---

## 🛠️ Turbo 的工作原理

### 1. 任务图（Task Graph）

```
当你运行 pnpm build 时，Turbo 创建任务图：

┌─────────────────────────────────────────┐
│        packages/config:build           │
│              (先执行)                   │
└────────┬────────────┬───────────┬──────┘
         │            │           │
    ┌────▼────┐  ┌────▼────┐ ┌───▼──────┐
    │ medusa  │  │ strapi  │ │storefront│
    │ :build  │  │ :build  │ │  :build  │
    └─────────┘  └─────────┘ └──────────┘
         (并行执行这 3 个)
```

### 2. 缓存机制

```bash
# Turbo 为每个任务生成唯一的哈希值
Hash = hash(
  source_files +        # 源代码
  dependencies +        # 依赖版本
  env_variables +       # 环境变量
  task_config          # 任务配置
)

# 如果哈希值相同 → 命中缓存
# 如果哈希值不同 → 执行任务并缓存结果
```

### 3. 并行执行

```bash
# Turbo 自动检测 CPU 核心数
# 假设 8 核 CPU

pnpm build
# ├── Worker 1: packages/config:build
# ├── Worker 2: apps/medusa:build      (等 config 完成后)
# ├── Worker 3: apps/strapi:build      (等 config 完成后)
# ├── Worker 4: apps/storefront:build  (等 config 完成后)
# └── Workers 5-8: 空闲或处理其他任务
```

---

## 🎨 配置详解

### 当前配置分析

```json
{
  "tasks": {
    "lint": {
      "outputs": []                    // 无输出文件，但结果会被缓存
    },
    "test:unit": {
      "outputs": []                    // 无输出文件
    },
    "build": {
      "dependsOn": ["^build"],        // ^ 表示上游依赖必须先构建
      "outputs": ["dist/**", "build/**", "out/**"]  // 缓存这些输出目录
    },
    "dev": {
      "cache": false                   // 开发模式不缓存
    }
  }
}
```

### 建议的增强配置

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", "build/**", "out/**", ".next/**", ".medusa/**"],
      "env": ["NODE_ENV", "DATABASE_URL", "REDIS_URL"]
    },
    "lint": {
      "outputs": [],
      "cache": true  // lint 结果可以缓存
    },
    "test:unit": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"],
      "cache": true
    },
    "typecheck": {
      "dependsOn": ["^build"],
      "outputs": [],
      "cache": true
    },
    "dev": {
      "cache": false,
      "persistent": true  // 标记为持久任务（不会自动退出）
    },
    "clean": {
      "cache": false
    }
  },
  "globalDependencies": [
    ".env",
    "tsconfig.json",
    "pnpm-workspace.yaml"
  ]
}
```

---

## 🚀 实际使用场景

### 1. CI/CD 加速

```yaml
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: pnpm/action-setup@v2
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      # 使用 Turbo 并行执行所有任务
      - name: Lint, Test, and Build
        run: |
          pnpm lint        # 并行 lint 所有包
          pnpm test:unit   # 并行测试所有包
          pnpm build       # 按依赖顺序构建
      
      # Turbo 远程缓存（可选）
      - name: Cache Turbo
        uses: actions/cache@v3
        with:
          path: .turbo
          key: ${{ runner.os }}-turbo-${{ github.sha }}
          restore-keys: |
            ${{ runner.os }}-turbo-
```

### 2. 本地开发加速

```bash
# 场景：你修改了 apps/medusa 的一个文件

# 运行测试
pnpm test:unit
# ✓ apps/medusa 测试运行 (30 秒)
# ✓ apps/strapi 使用缓存 (0 秒)
# ✓ apps/storefront 使用缓存 (0 秒)
# 总耗时：30 秒（而不是 3 分钟）

# 运行构建
pnpm build
# ✓ packages/config 使用缓存 (0 秒)
# ✓ apps/medusa 重新构建 (1 分钟)
# ✓ apps/strapi 使用缓存 (0 秒)
# ✓ apps/storefront 使用缓存 (0 秒)
# 总耗时：1 分钟（而不是 5 分钟）
```

### 3. 查看 Turbo 执行详情

```bash
# 查看详细日志
pnpm build --verbose

# 查看任务图
pnpm build --graph

# 跳过缓存强制执行
pnpm build --force

# 只构建特定包及其依赖
pnpm turbo run build --filter=medusa
```

---

## 📊 Turbo 命令速查

### 基础命令

```bash
# 运行任务
turbo run <task>
turbo run build lint test     # 运行多个任务
```

### 过滤选项

```bash
--filter=medusa              # 只运行 medusa
--filter=...medusa           # medusa 及其所有依赖
--filter=medusa...           # medusa 及依赖它的包
```

### 缓存控制

```bash
--force                      # 忽略缓存，强制执行
--no-cache                   # 不使用缓存
--output-logs=full          # 显示完整日志
```

### 调试选项

```bash
--dry-run                    # 预览执行计划
--graph                      # 生成任务依赖图
--verbose                    # 详细输出
```

### 性能选项

```bash
--concurrency=4              # 限制并发数
--continue                   # 即使某些任务失败也继续
```

---

## 💡 核心概念

### dependsOn 依赖声明

```json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"]      // ^ 表示上游包的 build
    },
    "test": {
      "dependsOn": ["build"]       // 无 ^ 表示当前包的 build
    },
    "deploy": {
      "dependsOn": ["build", "test", "^build"]  // 可组合
    }
  }
}
```

### outputs 输出声明

```json
{
  "tasks": {
    "build": {
      "outputs": [
        "dist/**",           // 编译输出
        ".next/**",          // Next.js 构建
        "coverage/**"        // 测试覆盖率
      ]
    }
  }
}
```

### cache 缓存控制

```json
{
  "tasks": {
    "dev": {
      "cache": false       // 开发服务器不缓存
    },
    "build": {
      "cache": true        // 默认为 true，可省略
    }
  }
}
```

---

## 🎓 项目收益总结

### 基于当前项目结构（3 个应用 + 多个共享包）

- ✅ **构建时间**: 从 ~8 分钟 → ~2 分钟（首次）→ ~10 秒（缓存）
- ✅ **测试速度**: 只测试变更的包
- ✅ **开发体验**: 统一的命令接口（`pnpm build` 而不是多个命令）
- ✅ **CI/CD**: 显著加速部署流程

### Turbo 解决的核心问题

1. **❌ 传统问题**: Monorepo 中有多个包，每次都要构建所有包  
   **✅ Turbo 方案**: 只构建变更的包，其他使用缓存

2. **❌ 传统问题**: 不知道包之间的依赖关系，手动管理顺序  
   **✅ Turbo 方案**: 自动分析依赖，正确的顺序并行执行

3. **❌ 传统问题**: 团队成员重复构建相同的代码  
   **✅ Turbo 方案**: 远程缓存共享（需配置）

4. **❌ 传统问题**: CI/CD 每次都完整构建，耗时长  
   **✅ Turbo 方案**: 增量构建 + 缓存，大幅加速

---

## 🚀 进阶使用

### 远程缓存配置（可选）

```bash
# 1. 登录 Vercel（提供免费远程缓存）
pnpm turbo login

# 2. 链接项目
pnpm turbo link

# 3. 团队成员共享构建结果
# 第一个人构建后，其他人可以直接使用缓存
```

### 环境变量管理

```json
{
  "tasks": {
    "build": {
      "env": ["NODE_ENV", "DATABASE_URL"],           // 任务级别
      "passThroughEnv": ["CI", "VERCEL"]            // 透传环境变量
    }
  },
  "globalEnv": ["TURBO_TOKEN", "TURBO_TEAM"],       // 全局环境变量
  "globalPassThroughEnv": ["AWS_*", "GOOGLE_*"]     // 全局透传（通配符）
}
```

### 多任务组合

```bash
# 串行执行
pnpm turbo run lint && pnpm turbo run test && pnpm turbo run build

# 并行执行（Turbo 自动处理）
pnpm turbo run lint test build

# 使用 filter 组合
pnpm turbo run build --filter=...medusa  # medusa 及其所有依赖
```

---

## 📚 最佳实践

### 1. 合理设置 outputs

```json
{
  "build": {
    "outputs": [
      "dist/**",          // ✅ 包含构建输出
      ".next/**",         // ✅ 包含框架缓存
      "!**/*.map"         // ❌ 排除 source maps（太大）
    ]
  }
}
```

### 2. 使用 dependsOn 确保顺序

```json
{
  "test": {
    "dependsOn": ["build"]         // 确保测试前先构建
  },
  "e2e": {
    "dependsOn": ["build", "^build"]  // 确保所有依赖都构建完成
  }
}
```

### 3. 开发任务禁用缓存

```json
{
  "dev": {
    "cache": false,               // 开发服务器不缓存
    "persistent": true            // 标记为持久任务
  }
}
```

### 4. CI/CD 使用远程缓存

```yaml
# 加速 CI 构建
- name: Turbo Cache
  uses: actions/cache@v3
  with:
    path: .turbo
    key: turbo-${{ github.sha }}
    restore-keys: turbo-
```

---

## 🎯 常见问题

### Q1: 缓存在哪里？

```bash
# 本地缓存位置
.turbo/cache/

# 查看缓存状态
pnpm turbo run build --summarize

# 清理缓存
rm -rf .turbo/cache/
```

### Q2: 如何调试 Turbo？

```bash
# 查看执行计划（不实际执行）
pnpm turbo run build --dry-run

# 查看详细日志
pnpm turbo run build --verbose

# 生成依赖图
pnpm turbo run build --graph=graph.html
```

### Q3: 缓存命中率低怎么办？

```bash
# 检查哪些文件导致缓存失效
pnpm turbo run build --verbose

# 常见原因：
# - 时间戳变化
# - 环境变量不一致
# - .gitignore 配置不当
# - 输出目录配置错误
```

---

## 📖 参考资源

- [Turborepo 官方文档](https://turbo.build/repo/docs)
- [Turborepo 示例](https://github.com/vercel/turbo/tree/main/examples)
- [Monorepo 最佳实践](https://turbo.build/repo/docs/handbook)
- [远程缓存配置](https://turbo.build/repo/docs/core-concepts/remote-caching)

---

**最后更新**: 2025-11-01  
**当前版本**: Turbo 2.5.8
