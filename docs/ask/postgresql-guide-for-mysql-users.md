# PostgreSQL 基础与实战总结（致 MySQL 用户）

**最后更新**: 2026-01-13
**适用场景**: 当前 Medusa + Strapi 项目
**目标读者**: 熟悉 MySQL 但对 PostgreSQL 感到陌生的开发者

---

## 1. 核心解惑：为什么安装后不需要设置密码？

这是 MySQL 用户转 PostgreSQL 时最大的“文化冲击”。

### MySQL 的逻辑
MySQL 是基于 **“账户/密码”** 的。即使在本地，`root` 用户也是数据库内的一个账户，通常需要密码（或者在安装时设置为空）。它并不太关心你是哪个操作系统用户启动的命令，只关心你连接时提供的 `-u root -p`。

### PostgreSQL 的逻辑：Peer Authentication (身份映射)
PostgreSQL 在 Linux 上默认使用 **Peer Authentication** 机制。

*   **原理**：PostgreSQL 会问操作系统内核：“现在运行 `psql` 命令的这个 OS 用户是谁？”
*   **规则**：如果 OS 用户名 == 数据库用户名，则直接放行，**不需要密码**。

#### 在本项目中的体现

1.  **超级管理员 (postgres)**
    *   安装 PostgreSQL 时，系统自动创建了一个名为 `postgres` 的 Linux 用户。
    *   同时，数据库里也默认有一个超级管理员叫 `postgres`。
    *   **操作**：`sudo -u postgres psql`
    *   **解释**：我用 `sudo` 切换成 Linux 用户 `postgres`，然后执行 `psql`。数据库发现 OS 用户是 `postgres`，匹配数据库用户 `postgres`，于是**免密登录**。

2.  **应用用户 (cs)**
    *   我们在项目中创建了一个数据库用户 `cs`，并设置了密码。
    *   Medusa/Strapi 是通过 **TCP/IP (`localhost:5432`)** 连接的。
    *   **规则变化**：一旦走网络端口（哪怕是 localhost），Peer 认证通常失效（取决于 `pg_hba.conf` 配置），转而强制要求 **密码认证 (md5/scram-sha-256)**。
    *   这就是为什么您的 `.env` 文件里必须写密码，而命令行 `sudo -u postgres` 却不用。

---

## 2. 架构映射：MySQL vs PostgreSQL

在本项目中，Medusa 和 Strapi 共用一个 PostgreSQL 实例。

| 概念 | MySQL | PostgreSQL | 本项目现状 |
| :--- | :--- | :--- | :--- |
| **实例** | MySQL Server | PostgreSQL Cluster | 只有一个 Cluster 运行在 5432 端口 |
| **数据库** | Database | Database | `medusa_production`<br>`strapi_production` |
| **层级** | 无 (库下直接是表) | **Schema (模式)** | 默认都在 `public` Schema 下。<br>结构：Instance -> DB -> Schema -> Table |
| **用户** | `user@host` | Role (角色) | `cs` (拥有者), `postgres` (超管) |
| **JSON** | Text / JSON 类型 | **JSONB** (二进制 JSON) | Medusa 极其依赖 JSONB 存储 metadata，查询速度远超 MySQL |

---

## 3. 命令速查表 (MySQL 老手专用)

| 操作 | MySQL 命令 | PostgreSQL 命令 | 备注 |
| :--- | :--- | :--- | :--- |
| **登录(超管)** | `mysql -u root -p` | `sudo -u postgres psql` | 走 Peer 认证 |
| **登录(应用)** | `mysql -u cs -p -h 127.0.0.1` | `psql -U cs -h localhost -d dbname` | 需密码 |
| **列出数据库** | `SHOW DATABASES;` | `\l` | List |
| **切换数据库** | `USE dbname;` | `\c dbname` | Connect |
| **列出表** | `SHOW TABLES;` | `\dt` | Display Tables |
| **查看表结构** | `DESC table;` | `\d table` | Display |
| **查看详细结构**| `SHOW CREATE TABLE table;`| `\d+ table` | 加上 `+` 显示更多细节 |
| **退出** | `exit` | `\q` | Quit |
| **纵向显示** | `\G` (行尾) | `\x` (开关) | 开启扩展显示模式 |

> **提示**：PostgreSQL 的 `\` (反斜杠) 命令也就是 "Meta-Commands"，是 `psql` 客户端特有的，不是 SQL 语句，所以不需要分号结尾。

---

## 4. 本项目实战常用操作

基于之前的演练和日常维护，以下是您最可能用到的命令。

### 场景一：查看 Medusa 的商品数据
```bash
# 1. 登录
sudo -u postgres psql

# 2. 连接 Medusa 库
\c medusa_production

# 3. 开启扩展显示（防止列太多折行乱码）
\x

# 4. 查询
SELECT id, title, handle FROM product LIMIT 5;
```

### 场景二：强制踢出所有连接（用于删除/恢复数据库时）
MySQL 直接 Drop 就行，但 PostgreSQL 为了安全，如果有应用连接着数据库，禁止删除。

```sql
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE datname = 'medusa_production' 
  AND pid <> pg_backend_pid();
```

### 场景三：查看磁盘占用
PostgreSQL 提供了很方便的函数来查看大小。

```sql
-- 查看所有数据库大小
\l+

-- 查看当前库中最大的 5 张表
SELECT 
    relname AS "Table",
    pg_size_pretty(pg_total_relation_size(relid)) AS "Size"
FROM pg_catalog.pg_statio_user_tables 
ORDER BY pg_total_relation_size(relid) DESC
LIMIT 5;
```

---

## 5. 高级特性在本项目中的应用

### JSONB (Binary JSON)
Medusa 的 `product` 表有一个 `metadata` 字段。
*   **MySQL**: 存 JSON 字符串，查询时要解析，慢。
*   **PostgreSQL**: 存 **JSONB**。它是二进制格式，解析过的，支持索引。
    *   *威力*：您可以直接查询 `metadata->>'color' = 'red'` 的商品，速度和普通字段一样快。

### Extensions (扩展)
PostgreSQL 支持插件化。在 `medusa_production` 中，您会发现使用了 `uuid-ossp` 扩展。
*   命令：`\dx` (查看已安装扩展)
*   作用：Medusa 依赖它在数据库层面生成 UUID，而不是完全依赖代码生成。

---

## 总结

1.  **权限**：`sudo -u postgres` 是利用 Linux 身份直接“刷脸”进数据库，非常安全且方便。
2.  **指令**：记住 `\l`, `\c`, `\dt`, `\d` 这四个元命令，能覆盖 90% 的日常查看需求。
3.  **优势**：对于 Medusa 这种重度依赖 JSON 结构的无头电商系统，PostgreSQL 的 JSONB 性能是它成为首选数据库的核心原因。
