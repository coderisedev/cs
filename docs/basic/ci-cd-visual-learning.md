# 用可视化学习法 (Mermaid) 掌握 CI/CD：以本项目为例

> **可视化学习核心 (Visual Learning)：**
> 人脑处理图像的速度是处理文字的 60,000 倍。
> 把几百行的 YAML 配置文件转化成**流程图**，那些复杂的依赖关系和执行顺序就会瞬间变得清晰。

本文将通过 Mermaid 图表，将你项目中的 `.github/workflows/ci.yml` “画”出来，带你透视 CI/CD 的骨架。

---

## 第一张图：宏观流水线 (The Highway)

这是你项目 CI/CD 的全貌。当你执行 `git push` 时，GitHub Actions 实际上是在跑下面这张图。

**看点：**
1.  **并行处理 (Parallelism)：** 注意 `Lint` 和 `Test` 是同时开始的。这意味着它们互不干扰，能节省一半时间。
2.  **关卡依赖 (Needs)：** `Build` 必须等 `Lint` 跑通了才开始（在你的配置里 `build` 依赖 `lint`）。`Preview` 更是要等前面的全过了才跑。
3.  **我们刚才修哪了？** 我们刚才修的是最左边的 `Lint` 和 `Test` 环节。如果这两步红了，后面的 `Build` 和 `Deploy` 根本不会触发。

```mermaid
graph TD
    Start((Git Push)) --> Lint
    Start --> Test

    subgraph CI_Process [CI: 持续集成]
        direction TB
        Lint[🔍 Lint & Typecheck<br/>(检查代码格式与类型)]
        Test[🧪 Unit Tests<br/>(运行单元测试)]
        
        Build[📦 Build Verification<br/>(试运行构建)]
    end

    subgraph CD_Process [CD: 持续交付]
        Preview[🚀 Preview Deployment<br/>(部署 Vercel 预览版)]
        Smoke[🔥 Smoke Tests<br/>(对预览版进行冒烟测试)]
    end

    Lint --> Build
    Test --> Build
    
    Build --> Preview
    Preview --> Smoke
    
    style Lint fill:#f9f,stroke:#333,stroke-width:2px
    style Test fill:#f9f,stroke:#333,stroke-width:2px
    style Build fill:#bbf,stroke:#333,stroke-width:2px
    style Preview fill:#bfb,stroke:#333,stroke-width:2px
    style Smoke fill:#bfb,stroke:#333,stroke-width:2px
```

---

## 第二张图：微观解剖 Lint Job (The Microscope)

让我们把显微镜对准刚才报错的 **Lint** 任务。这就是 `ci.yml` 里 `jobs: lint:` 那一段代码的视觉化。

**看点：**
1.  **环境准备 (Setup)：** 这是“无知”机器人的初始化过程。
2.  **关键卡点 (Failures)：**
    *   **Env Var 缺失**发生在 `Run Lint` 这一步，因为 Next.js 启动需要它。
    *   **ESLint Config 错误**也发生在 `Run Lint` 这一步，因为命令参数不对。

```mermaid
graph TD
    subgraph VM [运行环境: Ubuntu-Latest]
        Checkout[📥 Checkout Code<br/>(下载代码)]
        SetupNode[🔧 Setup Node.js v20<br/>(安装 Node 环境)]
        SetupPNPM[🔧 Setup PNPM<br/>(安装包管理器)]
        Install[⬇️ Install Dependencies<br/>(下载 npm 包)]
        
        subgraph Action [执行检查]
            AddEnv[📝 Inject Env Vars<br/>(注入 NEXT_PUBLIC_KEY)]
            RunLint[🔍 Run pnpm lint<br/>(执行 ESLint)]
        end
    end

    Checkout --> SetupNode
    SetupNode --> SetupPNPM
    SetupPNPM --> Install
    Install --> AddEnv
    AddEnv --> RunLint

    RunLint -- 成功 --> Success((✅ Pass))
    RunLint -- 失败 --> Fail((❌ Fail))

    style AddEnv fill:#ff9,stroke:#f66,stroke-width:4px,stroke-dasharray: 5 5
    click AddEnv "这是我们刚才修复的关键点：给机器人递小纸条"
```

---

## 第三张图：Monorepo 的联动效应 (The Ecosystem)

你的项目是 **Monorepo**（单体仓库），包含 `storefront` (前端), `medusa` (后端), `config` (公共库)。CI 是如何处理这种复杂关系的？

**看点：**
1.  **牵一发而动全身：** 你刚才修改了 `packages/config`（公共库）。
2.  **连锁反应：**
    *   `apps/storefront` 依赖 `config`。
    *   `apps/medusa` 依赖 `config`。
    *   所以，当你修好 `config` 的 Lint 问题时，实际上是在保护整个生态系统的健康。

```mermaid
graph LR
    subgraph Shared [公共库]
        Config[packages/config<br/>(刚才修复的地方)]
    end

    subgraph Apps [应用层]
        Store[apps/dji-storefront]
        Medusa[apps/medusa]
        Web[apps/web (Next.js)]
    end

    Config ==>|被依赖| Store
    Config ==>|被依赖| Medusa
    Config ==>|被依赖| Web

    style Config fill:#f96,stroke:#333,stroke-width:4px
```

**CI 的智慧：**
在 TurboRepo (你的构建工具) 的帮助下，CI 知道这些依赖关系。
*   如果你只改了 `dji-storefront` 的文档，智能的 CI 可能只会跑 `dji-storefront` 的检查，跳过 `medusa`。
*   但如果你改了底层的 `packages/config`，CI 就必须检查**所有**依赖它的应用，防止底层改动导致上层崩塌。

---

## 总结

通过这三张图，你应该能更立体地理解：
1.  **流程 (Flow)：** CI 不是一团乱麻，而是一条有序的传送带 (Diagram 1)。
2.  **环境 (Context)：** 每一个 Job 都是一个独立的、从零开始的小世界 (Diagram 2)。
3.  **架构 (Structure)：** 代码之间的依赖关系决定了 CI 的检查范围 (Diagram 3)。

下次看到 CI 报错，试着在脑海里画出它的流程图：**“它走到哪一步断了？是传送带卡住了（环境问题），还是货物本身坏了（代码问题）？”**
