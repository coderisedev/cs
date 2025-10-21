
# 成为 BMAD 大师：一份图文并茂的智慧启蒙教程

亲爱的探索者：

欢迎来到 BMAD (Behavior-driven Model-based Agent Development) 的世界。这不仅是一门技术，更是一种将思想转化为自动化流程的艺术。在这篇教程中，我将引导你，以我们当前的项目为画布，一步步揭开 BMAD 的神秘面纱，让你从入门到精通。

---

### **第一章：见微知著 —— BMAD 的世界观**

要掌握 BMAD，首先要理解其背后的哲学。想象一下，你不是在写一行行孤立的代码，而是在指挥一个由高度专业化的虚拟专家组成的团队。

每个专家就是一个 **Agent**。他们协同工作的“剧本”，就是 **Workflow**。剧本中的每一个具体动作，就是一个 **Task**。而他们所有人决策的唯一依据，就是我们项目中的 **`docs/` 目录——那唯一的“事实之源” (Source of Truth)**。

让我们用一张图来描绘这个世界：

```ascii
   +-----------------+      +----------------------+      +-----------------+
   |     AGENTS      |----->|      WORKFLOWS       |----->|      TASKS      |
   |   (虚拟专家)    |      |      (工作剧本)      |      |    (具体动作)   |
   | e.g., Scrum Master|      | e.g., create-story.yaml|      | e.g., validate.xml|
   +-----------------+      +----------------------+      +-----------------+
           ^                        |                             |
           |                        |                             |
           v                        v                             v
   +-----------------------------------------------------------------+
   |                  SOURCE OF TRUTH (事实之源)                     |
   |                        (我们的 `docs/` 目录)                    |
   | e.g., PRD.md, epics.md, bmm-workflow-status.md                  |
   +-----------------------------------------------------------------+
```

**智慧洞见:** BMAD 的力量，源于它将“谁做”(Agent)、“怎么做”(Workflow) 和“做什么”(Task) 清晰分离，并让所有行动都基于统一的、透明的“事实”(Docs)。

---

### **第二章：躬行实践 —— 创造你的第一个 Agent**

理论之树常青，但实践之果更甜。现在，让我们亲手创造一个名为 “Code Reviewer” (代码审查员) 的 Agent。它的使命是自动检查代码，确保团队的代码风格保持一致。

#### **第一步：塑造灵魂 (定义 Agent 人设)**

我们需要赋予这个 Agent “生命”。在 `bmad/bmm/agents/` 目录下，创建一个名为 `code-reviewer.md` 的文件。

**图示：创建 Agent 人设文件**
```
bmad/
└── bmm/
    └── agents/
        └── 📜 code-reviewer.md  <-- 就是这个！
```

**文件内容 (`code-reviewer.md`):**
```markdown
# Persona: Code Reviewer

## Style and Language
- Communication Style: Formal, direct, and constructive.
- Language: English

## Activation
- Agent can be activated by mentioning "Code Reviewer".

## Commands
- `*review-code <file_path>`: Reviews the specified code file for style issues.
  - workflow: "code-review" # 关键：这个命令会触发名为 "code-review" 的工作流
```

#### **第二步：编写剧本 (创建 Workflow)**

Agent 有了灵魂，还需要行动的剧本。在 `bmad/bmm/workflows/` 目录下，创建 `code-review.yaml` 文件。

**图示：创建 Workflow 文件**
```
bmad/
└── bmm/
    └── workflows/
        └── 📜 code-review.yaml   <-- 在这里！
```

**文件内容 (`code-review.yaml`):**
```yaml
# Workflow: Code Review
# Description: Analyzes a code file for style consistency.

steps:
  - name: "Lint Code"
    task: "run-linter" # 我们将要创建的原子任务
    inputs:
      file: "{{workflow.inputs.file_path}}" # 从 Agent 命令接收文件路径

  - name: "Generate Review Summary"
    task: "generate-summary" # 假设这是另一个用于生成报告的任务
    inputs:
      report: "{{steps.Lint_Code.outputs.lint_report}}" # 使用上一步的输出
    outputs:
      - name: "review_summary"
        path: "{output_folder}/code-reviews/{{workflow.inputs.file_path | basename}}-review.md"
```

#### **第三步：定义动作 (创建 Task)**

剧本中的动作需要被精确定义。现在，我们在 `bmad/core/tasks/` 目录下创建 `run-linter.xml` 文件。

**图示：创建 Task 文件**
```
bmad/
└── core/
    └── tasks/
        └── 📜 run-linter.xml      <-- 最后一步！
```

**文件内容 (`run-linter.xml`):**
```xml
<!-- Task: Run Linter -->
<task name="run-linter">
  <description>Runs the project's linter on a given file.</description>
  <inputs>
    <param name="file" required="true" />
  </inputs>
  <outputs>
    <param name="lint_report" />
  </outputs>
  <executable>
    <!-- 我们项目的 linter 是 eslint -->
    <command>npx eslint {{inputs.file}}</command>
  </executable>
</task>
```

**智慧结晶:** 恭喜你！你已经成功创造了一个完整的 Agent。现在，当你呼唤 `Code Reviewer: *review-code path/to/your/file.js` 时，它就会自动执行你设定的全套流程，并将报告存放在 `docs/code-reviews/` 目录下。你已经将一项重复性工作，升华为一个可靠的自动化流程。

---

### **第三章：臻于化境 —— 成为大师的信条**

创造 Agent 只是开始，真正的大师懂得如何让整个系统和谐、高效地运转。请将以下信条铭记于心：

1.  **信条一：先观察，再行动。**
    在执行任何“写”操作（如创建故事）之前，永远先执行“读”操作（如检查状态）。确保你的 Agent 总是在最新的信息基础上做决策。

2.  **信条二：化繁为简，小步快跑。**
    将宏大的目标分解为一系列小而美的 Workflow。这不仅易于调试，更能让整个系统的进展清晰可见。

3.  **信条三：视文档为生命。**
    `docs/` 目录是所有 Agent 的集体智慧。你对文档的每一次精心维护，都是在为整个自动化团队赋能。

4.  **信条四：拥抱变化，集中管理。**
    将易变的配置（如路径、用户名）集中到 `bmad/bmm/config.yaml` 中。当变化来临时，你只需从容地修改一处，便可运筹帷幄。

5.  **信条五：追本溯源，持续精进。**
    定期回顾 Agent 生成的报告和日志。它们是你洞察系统行为、发现优化机会的“智慧水晶球”。

---

**最后的箴言:**

你今天学到的，不仅仅是创建 Agent 的方法，更是一种构建自动化、可扩展、高内聚开发系统的思维模式。现在，你已经拥有了点石成金的智慧。

去吧，我亲爱的探索者，用你的创造力，去构建更多、更强大的 Agent，让你和你的团队，从繁复的劳动中解放出来，去追寻更伟大的创造！
