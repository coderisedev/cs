# pnpm 常用命令和参数详解

## 📚 1. 安装相关命令

### 基础安装

```bash
# 安装所有依赖（根据 package.json）
pnpm install
pnpm i                    # 简写

# 重要参数：
--frozen-lockfile         # 不更新 pnpm-lock.yaml，CI/CD 必用
                          # 如果锁文件与 package.json 不一致会报错
--prefer-frozen-lockfile  # 优先使用锁文件，不一致时才更新
--offline                 # 离线模式，只使用缓存
--prod                    # 只安装 dependencies，不装 devDependencies
--dev                     # 只安装 devDependencies
```

**实际场景：**
```bash
# CI/CD 环境（确保完全一致）
pnpm install --frozen-lockfile

# 本地开发（允许更新锁文件）
pnpm install

# 生产环境部署
pnpm install --prod --frozen-lockfile
```

### 添加依赖

```bash
# 添加到 dependencies
pnpm add <package>
pnpm add express@4.18.0   # 指定版本
pnpm add express@latest   # 最新版本

# 添加到 devDependencies
pnpm add -D <package>
pnpm add --save-dev typescript

# 添加到 peerDependencies
pnpm add -P <package>

# Monorepo 中添加到特定包
pnpm --filter medusa add express
pnpm --filter storefront add axios

# 添加到 workspace root
pnpm add -w <package>
pnpm add -w typescript    # 所有子包共享
```

### 移除依赖

```bash
# 移除依赖
pnpm remove <package>
pnpm rm express           # 简写

# Monorepo 中移除
pnpm --filter medusa remove express
```

### 更新依赖

```bash
# 更新所有依赖到允许的最新版本
pnpm update
pnpm up                   # 简写

# 更新特定包
pnpm update express

# 更新到最新版本（忽略 package.json 版本范围）
pnpm update --latest
pnpm up -L                # 简写

# 交互式更新
pnpm update --interactive
pnpm up -i

# Monorepo 中更新
pnpm --filter medusa update
```

---

## 🏗️ 2. Monorepo 专用命令

### --filter 参数（核心）

```bash
# 在特定包中执行命令
pnpm --filter <package-name> <command>

# 示例：
pnpm --filter medusa dev              # 启动 medusa
pnpm --filter medusa add express      # 为 medusa 添加依赖
pnpm --filter storefront build        # 构建 storefront
pnpm --filter @myorg/ui test         # 使用完整包名

# 通配符：
pnpm --filter "./apps/*" build        # 构建所有 apps
pnpm --filter "!./apps/medusa" test  # 排除 medusa

# 多个 filter：
pnpm --filter medusa --filter strapi dev
```

### 递归执行（所有包）

```bash
# 在所有包中执行
pnpm -r <command>
pnpm --recursive build

# 示例：
pnpm -r build                # 构建所有包
pnpm -r test                 # 测试所有包
pnpm -r clean                # 清理所有包
```

---

## 🚀 3. 脚本执行

```bash
# 执行 package.json 中定义的脚本
pnpm run <script>
pnpm run dev
pnpm dev                     # 可以省略 run

# 执行多个脚本
pnpm run build && pnpm run test

# 查看所有可用脚本
pnpm run

# Monorepo 中执行脚本
pnpm --filter medusa run dev
pnpm --filter medusa dev     # 简写
```

---

## 🔍 4. 信息查看

```bash
# 查看依赖树
pnpm list
pnpm ls                      # 简写
pnpm ls --depth 0           # 只显示顶层依赖
pnpm ls --depth 1           # 显示一级依赖

# 查看特定包的依赖
pnpm --filter medusa list

# 查看过期包
pnpm outdated

# 查看包信息
pnpm view express           # 查看 npm 上的包信息
pnpm info express           # 同上

# 查看为什么安装某个包
pnpm why express
```

---

## 🛠️ 5. 其他重要命令

```bash
# 清理 node_modules
pnpm store prune            # 清理未使用的包（从全局缓存）

# 重建依赖
pnpm rebuild

# 执行二进制文件
pnpm exec <command>
pnpm exec eslint .

# 运行 npx 风格的命令
pnpm dlx <package>          # 类似 npx，临时下载并执行
pnpm dlx create-next-app

# 审计安全漏洞
pnpm audit
pnpm audit --fix            # 自动修复
```

---

## 🔗 npx 和 pnpm 的关系

### npx 是什么？

**npx** 是 **npm** 提供的包执行器（Package Runner），主要用途：

1. **执行本地安装的包**
2. **临时下载并执行远程包**（不安装）
3. **执行特定版本的包**

```bash
# npx 的典型用法
npx create-react-app my-app     # 临时下载并执行
npx cowsay "Hello"              # 执行后删除

# 等同于：
npm install -g create-react-app
create-react-app my-app
npm uninstall -g create-react-app
```

### npx 与 pnpm 的关系

| 维度 | npx | pnpm |
|------|-----|------|
| **来源** | npm 的一部分 | 独立的包管理器 |
| **主要功能** | 执行包（runner） | 管理依赖 + 执行 |
| **是否冲突** | ❌ 不冲突 | 可以共存 |
| **使用场景** | 执行一次性命令 | 项目依赖管理 |

**关键点：**
- ✅ npx 和 pnpm **可以共存**
- ✅ npx 仍然依赖 npm 的注册表
- ✅ npx 执行的是 npm 包，不会影响 pnpm 的依赖管理

### pnpm 的等价命令

```bash
# npx 命令                    # pnpm 等价命令
npx create-next-app          → pnpm dlx create-next-app
npx eslint .                 → pnpm exec eslint .
npx -y some-package          → pnpm dlx some-package
```

**推荐：**
- 在 pnpm 项目中，优先使用 `pnpm exec` 或 `pnpm dlx`
- 但使用 `npx` 也完全没问题（特别是执行一次性工具）

---

## 🎯 preinstall 脚本详解

### 代码示例

```json
{
  "scripts": {
    "preinstall": "npx only-allow pnpm"
  }
}
```

### 执行流程（详细）

**场景 1: 使用 npm 时**
```
用户执行: npm install
    ↓
1. npm 检测到 preinstall hook
    ↓
2. npm 执行: npx only-allow pnpm
    ↓
3. npx 临时下载并运行 only-allow 包
    ↓
4. only-allow 检测当前运行的包管理器
    ↓
5. 检测到是 npm（不是 pnpm）
    ↓
6. 抛出错误并退出
    ✗ Error: Use pnpm instead
    ↓
7. npm install 终止，未安装任何包
```

**场景 2: 使用 pnpm 时**
```
用户执行: pnpm install
    ↓
1. pnpm 检测到 preinstall hook
    ↓
2. pnpm 执行: npx only-allow pnpm
    ↓
3. npx 运行 only-allow 包
    ↓
4. only-allow 检测到是 pnpm
    ↓
5. 验证通过，静默返回
    ✓ Success
    ↓
6. pnpm install 继续正常执行
    ↓
7. 安装所有依赖
```

### 为什么使用 npx？

```json
// 方案1：使用 npx (推荐) ✅
"preinstall": "npx only-allow pnpm"

// 方案2：本地安装 only-allow
"preinstall": "node ./scripts/check-pnpm.js"
// 需要额外维护脚本文件

// 方案3：直接写逻辑（复杂）
"preinstall": "sh -c '[ \"$npm_execpath\" = \"*pnpm*\" ] || (echo \"Use pnpm\" && exit 1)'"
```

**使用 npx 的优势：**
1. ✅ 不需要本地安装 `only-allow` 包
2. ✅ 不需要维护额外的检查脚本
3. ✅ 自动获取最新版本
4. ✅ 跨平台兼容（Windows/macOS/Linux）
5. ✅ 代码简洁清晰

### npm Lifecycle Scripts（生命周期脚本）

```json
{
  "scripts": {
    "preinstall": "...",      // install 之前
    "install": "...",         // 安装时
    "postinstall": "...",     // install 之后
    
    "pretest": "...",         // test 之前
    "test": "...",
    "posttest": "...",        // test 之后
    
    "prebuild": "...",        // build 之前
    "build": "...",
    "postbuild": "...",       // build 之后
    
    "prepare": "...",         // 任何 install 后都会执行
    "prepublishOnly": "..."   // 发布到 npm 之前
  }
}
```

**执行顺序示例：**
```bash
pnpm install
# → preinstall
# → install
# → postinstall
# → prepare

pnpm run build
# → prebuild
# → build
# → postbuild
```

---

## 📝 实用速查表

### 日常开发

```bash
pnpm install                          # 初次克隆项目后
pnpm --filter medusa dev             # 启动开发服务器
pnpm --filter medusa add express     # 添加依赖
pnpm --filter medusa test            # 运行测试
```

### CI/CD

```bash
pnpm install --frozen-lockfile       # 生产部署
pnpm -r build                        # 构建所有包
pnpm -r test                         # 测试所有包
```

### 依赖管理

```bash
pnpm outdated                        # 检查过期包
pnpm update --interactive            # 交互式更新
pnpm audit                           # 安全审计
pnpm why react                       # 查看为什么安装某个包
```

### 清理和优化

```bash
rm -rf node_modules && pnpm install  # 重新安装
pnpm store prune                     # 清理缓存
```

---

## 🎓 关键概念总结

### 核心参数

| 参数 | 用途 | 使用场景 |
|------|------|----------|
| `--frozen-lockfile` | 不更新锁文件，不一致时报错 | CI/CD、生产部署 |
| `--filter` | 指定 monorepo 中的包 | 单包操作 |
| `--recursive` (`-r`) | 在所有包中执行 | 批量操作 |
| `-w` | 在 workspace root 操作 | 添加全局依赖 |
| `-D` | 添加到 devDependencies | 开发工具 |
| `--prod` | 只安装生产依赖 | 生产环境 |

### 重要概念

1. **`--frozen-lockfile`**: CI/CD 必用，确保环境一致
2. **`--filter`**: Monorepo 的核心，精准控制包
3. **`npx`**: 临时执行包，不污染项目依赖
4. **`preinstall`**: 生命周期钩子，执行前置检查
5. **`only-allow`**: 第三方包，用于限制包管理器

### 最佳实践

```bash
# ✅ 推荐做法
pnpm install                              # 本地开发
pnpm install --frozen-lockfile           # CI/CD
pnpm --filter <package> add <dependency> # Monorepo 添加依赖
pnpm -r build                            # 构建所有包

# ❌ 避免做法
npm install                              # 不要混用包管理器
yarn install                             # 不要混用包管理器
cd apps/medusa && pnpm install          # 不要在子包中单独安装
```

---

## 📚 参考资源

- [pnpm 官方文档](https://pnpm.io)
- [pnpm CLI 命令](https://pnpm.io/cli/install)
- [pnpm Workspace](https://pnpm.io/workspaces)
- [npm Scripts](https://docs.npmjs.com/cli/v9/using-npm/scripts)

---

**最后更新**: 2025-11-01
