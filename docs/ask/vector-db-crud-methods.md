# 向量数据库的 CRUD：SQL 派 vs API/SDK 派

关于向量数据库是否具有类似 SQL 的命令进行 CRUD（增删改查）操作，这取决于所选数据库的架构设计。主要分为两大流派：

### 1. 原生 SQL 派 (如 Supabase/pgvector)
如果使用 **Supabase (PostgreSQL + pgvector)** 方案，答案是 **YES**。它直接将向量能力集成进标准 SQL 语法中。

**第一性原理**：不引入新语法，只引入新数据类型。

#### CRUD 演示 (PostgreSQL + pgvector)

*   **Create (插入)**：
    ```sql
    INSERT INTO document_chunks (content, embedding)
    VALUES ('如何发放优惠券...', '[0.1, -0.2, 0.5, ...]');
    ```

*   **Read (语义搜索)**：在 SQL 中，向量搜索本质上是基于距离的 **`ORDER BY` (排序)**。
    ```sql
    -- 找出最相似的 5 条记录 (<-> 代表计算 Euclidean 距离)
    SELECT content
    FROM document_chunks
    ORDER BY embedding <-> '[0.1, -0.2, 0.5, ...]'
    LIMIT 5;
    ```

*   **Update/Delete**：完全遵循标准 SQL 的 `UPDATE` 和 `DELETE` 语法。

---

### 2. API / SDK 派 (如 Qdrant, Chroma, Pinecone)
大多数专用的向量数据库（Native Vector DBs）**不支持**标准 SQL。它们通常采用 **RESTful API** 或 **gRPC**，操作逻辑更接近 NoSQL（如 MongoDB）。

#### CRUD 演示 (以 Qdrant 为例)

*   **Create (Upsert)**：
    ```python
    client.upsert(
        collection_name="docs",
        points=[PointStruct(id=1, vector=[0.1, ...], payload={"text": "..."})]
    )
    ```

*   **Read (Search)**：调用专门的 `search` 函数。
    ```python
    client.search(
        collection_name="docs",
        query_vector=[0.1, -0.2, ...],
        limit=5
    )
    ```
    *注：虽然不是 SQL，但它们支持**过滤对象**（类似 `WHERE` 子句），用于筛选元数据。*

---

### 总结对比

| 维度 | SQL 派 (pgvector) | SDK 派 (Qdrant/Chroma) | 根本原因 |
| :--- | :--- | :--- | :--- |
| **交互方式** | 字符串 (SQL 语句) | 对象/JSON (函数调用) | **SQL** 基于关系代数；**SDK** 基于面向对象/RPC。 |
| **学习曲线** | 低 (复用 SQL 经验) | 中 (需学习私有 SDK) | SQL 是通用工业标准。 |
| **搜索本质** | `ORDER BY` 距离运算 | `.search()` 专用接口 | SQL 将相似性视为**排序条件**；专用库将其视为**核心索引**。 |
| **元数据过滤** | 极其强大 (JOIN/WHERE) | 较强 (Filter 语法) | 关系型数据库天生擅长处理结构化元数据。 |

**方案建议**：
鉴于本项目已集成 **Supabase**，使用 **pgvector** 是认知负担最低的路径。它允许你在同一个数据库中通过熟悉的 `SELECT` 语法同时处理业务逻辑和 AI 向量检索。
