# Strapi 部署与数据同步机制详解

本文档详细解释了 Strapi 在不同环境（如从本地到 Dev/Prod 服务器）部署时，内容模型（Schema）和数据（Data）是如何同步的底层逻辑。

## 核心概念

Strapi 遵循 **"Code-First" (代码优先)** 的架构策略，这意味着：
1.  **表结构 (Schema)** 由代码定义，自动同步。
2.  **内容数据 (Content)** 属于数据库，需要手动迁移或填充。

---

## 1. 表结构是如何创建的？(Schema Sync)

当您在本地开发时，创建的 Content Types（例如 `Featured Product`）实际上是生成了 JSON 配置文件。

*   **代码来源**: 所有的模型定义都保存在 `src/api/[api-name]/content-types/[content-type]/schema.json` 文件中。
*   **版本控制**: 这些 JSON 文件会被提交到 Git 仓库。
*   **自动同步流程**:
    当代码部署到服务器并启动 Strapi (`npm run start` 或 `npm run dev`) 时：
    1.  Strapi 启动程序读取所有 `schema.json` 文件。
    2.  检查连接的数据库（PostgreSQL/MySQL）。
    3.  对比“代码定义”与“数据库现状”。
    4.  **自动执行 SQL**: 如果发现差异（如缺少表、缺少字段、字段类型变更），Strapi 会自动执行 SQL 语句来同步数据库结构。

**结论**: 您**不需要**在服务器上手动创建 Content Types。只要代码部署成功，表结构会自动就绪。

---

## 2. 初始数据是如何进入的？(Data Seeding)

这是部署中最容易混淆的部分：**数据不是代码，不会自动同步。**

*   **现状**: Strapi 自动创建了空表，但里面是空的。
*   **原因**: 生产环境的数据通常不进 Git，且不同环境的数据往往不同。
*   **解决方案**: 使用 **种子脚本 (Seed Script)** 进行初始数据填充。

### 种子脚本的工作原理
我们编写的 `npm run seed:homepage` 命令（对应 `scripts/import-homepage-seeds.js`）执行以下操作：
1.  **读取数据**: 加载 `scripts/sample-data.js` 中的预定义 JSON 数据（如 iPhone, AirPods 信息）。
2.  **写入数据库**: 调用 Strapi 的 Entity Service API，将数据写入到刚刚自动创建的表中。
3.  **处理关联**: 自动处理图片上传（如果有）和组件关联。
4.  **发布内容**: 将内容状态设置为 `published`。

---

## 3. 关键警告：Schema 变更与数据安全

**Q: 如果我删除了 schema.json 中的字段，Strapi 会自动删除数据库字段吗？**

**A: 是的，而且会导致数据丢失！**

Strapi v5 的同步机制非常严格（Aggressive）：
*   **删除字段**: 如果您在 `schema.json` 中删除了某个字段，下次 Strapi 启动时，它会检测到数据库中多出了一个“未知列”，并**自动删除该列及其所有数据**。
*   **重命名字段**: Strapi 将其视为“删除旧字段 + 添加新字段”。这意味着**旧字段的数据会被清空**，新字段是空的。

### 最佳实践
1.  **不要随意删除**: 在生产环境删除字段前，务必先备份数据库。
2.  **重命名需谨慎**: 如果需要重命名字段且保留数据，需要编写自定义的数据库迁移脚本（Migration Script），不能仅靠修改 `schema.json`。
3.  **Code-First 原则**: 始终记住，`schema.json` 是真理之源。如果代码里没有，数据库里就不会有。

---

## 4. 标准部署流程清单

当您将代码部署到新环境（Dev/Prod）时，请遵循以下标准步骤：

1.  **代码同步**: 
    ```bash
    git pull origin main
    ```
    *(这一步拉取最新的 schema.json)*

2.  **安装依赖**: 
    ```bash
    npm install
    ```

3.  **构建后台**: 
    ```bash
    npm run build
    ```

4.  **启动服务**: 
    ```bash
    npm run start
    ```
    *(关键步骤：此时 Strapi 会自动创建/更新数据库表结构)*

5.  **导入初始数据 (仅首次部署或重置时)**: 
    ```bash
    npm run seed:homepage
    ```
    *(这一步填充数据，让后台不再为空)*
