# 第一性原理分析：Markdown 文档的向量化存储与检索

基于**第一性原理**（First Principles），我们将“把 Markdown 存入向量数据库以供未来检索”这一需求拆解为最基本的要素：**信息的本质（语义）**、**存储的物理限制**和**检索的数学原理**。

### 第一性原理分析

#### 1. 信息的本质与向量化（Embedding）
*   **原理**：向量化是将“意义”压缩成一组坐标（例如 1536 维的浮点数数组）。
*   **限制**：Embedding 模型（如 OpenAI text-embedding-3）有**上下文窗口限制**（Context Window）。虽然现在的模型窗口很大（如 8k token），但将几千字的 Markdown 压缩成一个向量，会发生**语义稀释**（Semantic Dilution）。
*   **推论**：如果你把整个 `wordpress-to-medusa-customer-migration.md` 变成**一个**向量，当你搜索“优惠券”时，这个向量可能因为包含了“数据库”、“迁移脚本”、“登录”等太多杂音，导致与“优惠券”的匹配度不高。
*   **结论**：**不能（也不应该）只存一个“全文档向量”**。必须进行**切片（Chunking）**。

#### 2. 数据库的功能定义：索引 vs 载荷
*   **原理**：向量数据库本质上是两个东西的结合体：
    1.  **高维索引**（HNSW, IVF 等）：用于快速计算距离（相似度）。
    2.  **KV 存储**（Payload/Metadata）：用于存放原始数据。
*   **推论**：
    *   **能存 Markdown 源码吗？** **能**。向量数据库的 Payload 字段完全可以存放几万字的字符串。
    *   **怎么存？** 最佳实践是：
        *   **Vector**: 对应 Markdown 的一个段落（Chunk）。
        *   **Payload**: 存该段落的文字 + **所属文件的完整内容（或路径/ID）**。

### 核心问题解答

**Q: 向量数据库可以把整个 markdown 存进去吗？**
**A: 可以，但有策略上的区分：**
1.  **作为“被搜索对象”（索引）**：不行/不推荐。必须切片（Chunking），否则搜索精度极低。
    *   *做法*：把文档切成 `Header 1`, `Header 2`, `Paragraph` 等小块，每块生成一个向量。
2.  **作为“返回结果”（元数据）**：可以。
    *   *做法*：在每个切片的元数据里，存一个 `document_id` 或者直接存 `full_markdown_content` 字段。找到切片后，直接读取该字段。

---

### 推荐方案（基于项目现状）

根据项目结构（`apps/lumora-platform` 使用 Supabase，且有 `docker-compose`），以下是基于第一性原理的推荐：

#### 方案一：Supabase / PostgreSQL + `pgvector` (最推荐)
*   **理由（奥卡姆剃刀原理）**：如无必要，勿增实体。项目已经在使用 Supabase（PostgreSQL），它原生支持 `pgvector`。
*   **优势**：
    *   **关系与向量共存**：可以通过 SQL 查出“某个作者写的”且“关于优惠券”的文档。
    *   **无需新增运维**：不用维护独立的 Qdrant 或 Chroma 服务。
    *   **容量**：Postgres 的 `TEXT` 类型可以轻松存下巨大的 Markdown 源码。
*   **实现逻辑**：
    ```sql
    -- 表结构设计思路
    CREATE TABLE documents (
      id SERIAL PRIMARY KEY,
      content TEXT, -- 存整个 Markdown
      file_path TEXT
    );

    CREATE TABLE document_chunks (
      id SERIAL PRIMARY KEY,
      document_id INT REFERENCES documents(id),
      chunk_content TEXT, -- 存切片内容
      embedding VECTOR(1536) -- 存向量
    );
    ```

#### 方案二：ChromaDB / LanceDB (最适合本地/CLI)
*   **理由（本地优先）**：如果想做一个纯 CLI 工具（像现在的 `cs` 环境），不需要服务器。
*   **优势**：
    *   **嵌入式**：它们就像 SQLite，只是一个文件或文件夹，直接嵌入在 Python/Node.js 代码里。
    *   **LanceDB**：支持直接把数据存在硬盘上，且速度极快，适合存大量 Markdown 原始内容。

#### 方案三：Qdrant (最适合 Docker 部署)
*   **理由（工程化）**：如果要通过 `docker-compose.local.yml` 添加独立服务。
*   **优势**：Rust 编写，极其高效，Payload 支持存复杂的 JSON 对象（包括整个 Markdown）。

### 总结建议

鉴于 `cs` (Coderise System) 及 `lumora-platform` (Supabase) 的现状：

1.  **现有架构复用**：直接用 **Supabase (pgvector)**。
2.  **具体做法**：
    *   编写脚本读取 `docs/**/*.md`。
    *   使用 **LangChain** 或 **LlamaIndex** 的 `MarkdownHeaderSplitter` 对文档进行**切片**。
    *   将切片向量化存入 `document_chunks` 表。
    *   将完整 Markdown 存入 `documents` 表。
3.  **检索时**：
    *   用户搜“怎么发优惠券”。
    *   向量匹配找到“分层分组”那个**切片**。
    *   通过 `document_id` 联合查询返回**整篇** `wordpress-to-medusa-customer-migration.md` 文档。
