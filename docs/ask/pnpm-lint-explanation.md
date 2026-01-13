# pnpm lint 检查内容详解

在这个项目中，运行 `pnpm lint` 主要是通过 **TurboRepo** 触发各个子项目（workspaces）的 lint 检查。

目前最主要且规则最严格的检查发生在 `apps/dji-storefront`（前端商店）项目中。

以下是 `pnpm lint` 具体检查的内容：

### 1. 核心规则 (Base Rules)
它会强制执行以下标准和最佳实践：
*   **JavaScript/TypeScript 语法**: 检查常见的语法错误和潜在 bug (基于 `eslint:recommended` 和 `@typescript-eslint/recommended`)。
*   **React 最佳实践**:
    *   检查 JSX 语法正确性。
    *   **Hooks 规则**: 强制检查 `useEffect`, `useCallback` 等 Hooks 的依赖项数组是否完整（这是最常见的 React bug 来源）。
    *   无需显式引入 React (针对 Next.js 的优化)。
*   **代码风格**: 比如禁止使用 `var`，强制使用 `const` 等。

### 2. 项目特有的“红线” (Project-Specific Restrictions)
这是本项目最特殊的检查规则，旨在维护设计系统的一致性：
*   ❌ **禁止直接使用 Medusa UI**:
    *   如果代码中出现了 `import ... from "@medusajs/ui"`，Lint 会报错。
    *   **要求**: 必须使用项目自己封装的 "DJI storefront UI kit"。
*   ❌ **禁止使用 Medusa Icons**:
    *   如果代码中出现了 `import ... from "@medusajs/icons"`，Lint 会报错。
    *   **要求**: 必须使用 `lucide-react` 或者项目自定义的 DJI icons。

### 3. Storybook 检查
由于项目使用了 Storybook，它还会检查 `.stories.tsx` 文件是否符合 Storybook 的编写规范（基于 `plugin:storybook/recommended`）。

### 4. 零容忍策略 (Zero Tolerance)
在 `apps/dji-storefront` 中，lint 命令配置了 `--max-warnings=0`。
这意味着：**任何一个警告（Warning）都会被视为错误（Error），导致检查失败。** 必须修复所有问题才能通过。

### 总结
当你运行 `pnpm lint` 时，你主要是在验证：
1.  没有语法错误。
2.  React Hooks 依赖写对了。
3.  **没有偷懒直接用 `@medusajs/ui` 或 `@medusajs/icons`，而是用了项目自定义的组件库。**
