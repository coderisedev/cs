# Medusa 数据库迁移机制

## 概述

Medusa 2.x 使用 **MikroORM** 作为 ORM，采用 **显式迁移文件** 机制（与 Strapi 的自动同步完全不同）。

```mermaid
flowchart LR
    subgraph Strapi
        S1[修改 schema.json] --> S2[重启自动同步]
    end

    subgraph Medusa
        M1[修改 Entity] --> M2[生成迁移文件]
        M2 --> M3[审查迁移 SQL]
        M3 --> M4[执行迁移]
    end

    style S2 fill:#fff3e0
    style M2 fill:#c8e6c9
    style M3 fill:#c8e6c9
```

**关键区别：Medusa 需要显式生成和执行迁移，提供更多控制和安全性。**

## Medusa CLI 迁移命令

```mermaid
flowchart TD
    subgraph 初始化
        A[medusa db:create] --> B[medusa db:setup]
    end

    subgraph 日常开发
        C[修改 Entity 代码] --> D[medusa db:generate]
        D --> E[审查迁移文件]
        E --> F[medusa db:migrate]
    end

    subgraph 回滚
        G[medusa db:rollback] --> H[删除迁移文件]
        H --> I[重新生成迁移]
    end

    subgraph 链接同步
        J[medusa db:sync-links]
    end

    B --> C
    F --> J
```

| 命令 | 作用 | 使用场景 |
|------|------|---------|
| `medusa db:create` | 创建数据库 | 首次设置 |
| `medusa db:setup` | 创建库 + 迁移 + 同步链接 | 首次设置（一键完成） |
| `medusa db:generate [module]` | 生成迁移文件 | 修改模型后 |
| `medusa db:migrate` | 执行待处理迁移 | 部署时 |
| `medusa db:rollback [module]` | 回滚上批迁移 | 撤销错误迁移 |
| `medusa db:sync-links` | 同步模块间链接关系 | 添加新关联后 |

## 完整迁移流程

```mermaid
sequenceDiagram
    participant Dev as 开发者
    participant Code as Entity 代码
    participant CLI as Medusa CLI
    participant Migration as 迁移文件
    participant DB as PostgreSQL

    Dev->>Code: 1. 修改/创建 Entity
    Dev->>CLI: 2. medusa db:generate my-module
    CLI->>Code: 读取 Entity 定义
    CLI->>DB: 读取当前表结构
    CLI->>CLI: 对比差异
    CLI->>Migration: 生成 Migration_xxx.ts

    Dev->>Migration: 3. 审查迁移 SQL
    Note over Dev,Migration: 确认 UP/DOWN 逻辑正确

    Dev->>CLI: 4. medusa db:migrate
    CLI->>Migration: 读取待执行迁移
    CLI->>DB: 执行 SQL
    CLI->>DB: 记录到 mikro_orm_migrations 表

    Dev->>CLI: 5. medusa db:sync-links
    CLI->>DB: 同步模块间关联表
```

## Medusa 模块架构

```mermaid
flowchart TB
    subgraph Medusa Core Modules
        Product[Product Module]
        Cart[Cart Module]
        Order[Order Module]
        Customer[Customer Module]
        Auth[Auth Module]
        Payment[Payment Module]
        Inventory[Inventory Module]
    end

    subgraph Custom Modules
        Custom1[auth-google-one-tap]
        Custom2[auth-discord]
        Custom3[resend-notification]
    end

    subgraph Database
        DB[(PostgreSQL)]
    end

    Product --> DB
    Cart --> DB
    Order --> DB
    Customer --> DB
    Auth --> DB
    Payment --> DB
    Inventory --> DB
    Custom1 -.->|无自定义表| Auth
    Custom2 -.->|无自定义表| Auth
    Custom3 -.->|无自定义表| DB

    style Custom1 fill:#e3f2fd
    style Custom2 fill:#e3f2fd
    style Custom3 fill:#e3f2fd
```

**当前项目的自定义模块没有创建自定义数据表，而是扩展核心模块的功能。**

## 创建自定义模块的迁移流程

### 1. 定义 Entity（数据模型）

```typescript
// src/modules/wishlist/models/wishlist.ts
import { model } from "@medusajs/framework/utils"

const Wishlist = model.define("wishlist", {
  id: model.id().primaryKey(),
  customer_id: model.text(),
  product_id: model.text(),
  created_at: model.dateTime(),
})

export default Wishlist
```

### 2. 生成迁移文件

```bash
# 为特定模块生成迁移
medusa db:generate wishlist
```

**生成的迁移文件结构：**

```mermaid
flowchart LR
    subgraph 迁移文件
        A[Migration_20240115_wishlist.ts]
    end

    subgraph 文件内容
        B[up 方法: CREATE TABLE]
        C[down 方法: DROP TABLE]
    end

    A --> B
    A --> C
```

```typescript
// src/modules/wishlist/migrations/Migration_20240115_wishlist.ts
import { Migration } from "@mikro-orm/migrations"

export class Migration20240115Wishlist extends Migration {
  async up(): Promise<void> {
    this.addSql(`
      CREATE TABLE IF NOT EXISTS "wishlist" (
        "id" varchar NOT NULL,
        "customer_id" varchar NOT NULL,
        "product_id" varchar NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "wishlist_pkey" PRIMARY KEY ("id")
      );
    `)
    this.addSql(`
      CREATE INDEX "idx_wishlist_customer" ON "wishlist" ("customer_id");
    `)
  }

  async down(): Promise<void> {
    this.addSql(`DROP TABLE IF EXISTS "wishlist";`)
  }
}
```

### 3. 执行迁移

```bash
# 执行所有待处理迁移
medusa db:migrate
```

```mermaid
sequenceDiagram
    participant CLI as medusa db:migrate
    participant DB as PostgreSQL

    CLI->>DB: 查询 mikro_orm_migrations 表
    DB-->>CLI: 已执行的迁移列表

    CLI->>CLI: 找到未执行的迁移文件

    loop 每个待执行迁移
        CLI->>DB: BEGIN TRANSACTION
        CLI->>DB: 执行 up() 中的 SQL
        CLI->>DB: INSERT INTO mikro_orm_migrations
        CLI->>DB: COMMIT
    end

    CLI-->>CLI: 迁移完成
```

## 迁移版本控制

```mermaid
erDiagram
    mikro_orm_migrations {
        int id PK
        varchar name "迁移文件名"
        timestamp executed_at "执行时间"
    }
```

```sql
-- 查看已执行的迁移
SELECT * FROM mikro_orm_migrations ORDER BY executed_at;

-- 示例输出
--  id |              name                    |       executed_at
-- ----+--------------------------------------+------------------------
--   1 | Migration20240101_Initial            | 2024-01-01 10:00:00
--   2 | Migration20240115_Wishlist           | 2024-01-15 14:30:00
```

## 回滚操作

```mermaid
flowchart TD
    A[发现迁移问题] --> B{问题类型?}

    B -->|逻辑错误| C[medusa db:rollback module]
    B -->|数据问题| D[手动修复数据]

    C --> E[执行 down 方法]
    E --> F[从 mikro_orm_migrations 删除记录]
    F --> G[修改 Entity]
    G --> H[重新生成迁移]
    H --> I[medusa db:migrate]

    D --> J[编写修复脚本]
    J --> K[medusa exec fix-script.ts]
```

```bash
# 回滚特定模块的最后一批迁移
medusa db:rollback wishlist

# 回滚所有模块的最后一批迁移
medusa db:rollback
```

## 模块间链接（Links）

Medusa 使用 Links 系统处理模块间的关联：

```mermaid
flowchart TB
    subgraph Product Module
        P[Product]
    end

    subgraph Inventory Module
        I[InventoryItem]
    end

    subgraph Link Table
        L[product_inventory_item_link]
    end

    P -.->|定义 Link| L
    I -.->|定义 Link| L

    style L fill:#fff3e0
```

```bash
# 当添加或修改模块间链接后
medusa db:sync-links
```

## 部署流程对比

### 开发环境

```mermaid
flowchart LR
    A[修改 Entity] --> B[db:generate]
    B --> C[审查迁移]
    C --> D[db:migrate]
    D --> E[测试功能]

    style B fill:#c8e6c9
    style C fill:#fff3e0
```

### 生产环境

```mermaid
flowchart TD
    A[代码仓库] --> B[CI/CD Pipeline]

    subgraph 部署流程
        B --> C[构建 Docker 镜像]
        C --> D[启动新容器]
        D --> E[容器启动脚本]
    end

    subgraph 容器启动
        E --> F{检查迁移}
        F -->|有待处理| G[medusa db:migrate]
        F -->|无待处理| H[medusa start]
        G --> I[medusa db:sync-links]
        I --> H
    end

    style G fill:#c8e6c9
    style I fill:#c8e6c9
```

**推荐的启动脚本：**

```bash
#!/bin/bash
# entrypoint.sh

# 执行待处理迁移
medusa db:migrate

# 同步模块链接
medusa db:sync-links

# 启动服务
medusa start
```

## 与 Strapi 的对比总结

```mermaid
flowchart TB
    subgraph Strapi 自动同步
        S1[修改 schema.json]
        S2[重启服务]
        S3[自动检测变更]
        S4[自动 ALTER TABLE]

        S1 --> S2 --> S3 --> S4
    end

    subgraph Medusa 显式迁移
        M1[修改 Entity]
        M2[db:generate 生成迁移]
        M3[审查迁移文件]
        M4[db:migrate 执行迁移]
        M5[提交迁移文件到 Git]

        M1 --> M2 --> M3 --> M4 --> M5
    end

    style S4 fill:#fff3e0
    style M3 fill:#c8e6c9
    style M5 fill:#c8e6c9
```

| 特性 | Strapi | Medusa |
|------|--------|--------|
| 迁移机制 | 自动同步 | 显式迁移文件 |
| 版本控制 | 无迁移文件 | 迁移文件提交到 Git |
| 回滚能力 | 无法回滚 | 支持 `db:rollback` |
| 审查机会 | 无 | 可审查 SQL |
| 团队协作 | 可能冲突 | 迁移文件合并 |
| 数据安全 | 不删除列 | 完全控制 |
| 适用场景 | 快速原型 | 生产级应用 |

## 最佳实践

### 1. 迁移文件命名

```
Migration_YYYYMMDD_ModuleName_Description.ts
```

### 2. 审查清单

```mermaid
flowchart TD
    A[生成迁移文件] --> B{检查 UP 方法}
    B --> C{检查 DOWN 方法}
    C --> D{检查索引}
    D --> E{检查约束}
    E --> F{检查数据迁移}
    F --> G[提交代码]

    B -.->|问题| H[修改 Entity 重新生成]
    C -.->|问题| H
    D -.->|问题| H
    E -.->|问题| H
    F -.->|需要| I[添加数据迁移逻辑]
```

### 3. 生产部署检查

```bash
# 部署前在 staging 验证
medusa db:migrate --dry-run  # 如果支持

# 备份数据库
pg_dump -U medusa medusa_prod > backup_$(date +%Y%m%d).sql

# 执行迁移
medusa db:migrate

# 验证
psql -U medusa -d medusa_prod -c "\dt"
```

## 常见问题

### Q: 迁移文件冲突怎么办？

```mermaid
flowchart TD
    A[Git 合并冲突] --> B[保留两个迁移文件]
    B --> C[检查执行顺序]
    C --> D{有依赖冲突?}
    D -->|是| E[修改时间戳调整顺序]
    D -->|否| F[直接提交]
```

### Q: 如何迁移现有数据？

```typescript
// 在迁移文件的 up() 方法中
async up(): Promise<void> {
  // 1. 添加新列
  this.addSql(`ALTER TABLE "product" ADD COLUMN "sku" varchar;`)

  // 2. 迁移数据
  this.addSql(`UPDATE "product" SET "sku" = "handle" WHERE "sku" IS NULL;`)

  // 3. 设置约束
  this.addSql(`ALTER TABLE "product" ALTER COLUMN "sku" SET NOT NULL;`)
}
```

### Q: 如何跳过某个模块的迁移？

```bash
# 只迁移特定模块
medusa db:migrate --modules=product,order

# 生成特定模块的迁移
medusa db:generate product
```
