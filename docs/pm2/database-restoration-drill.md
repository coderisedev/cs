# 数据库备份恢复演练指南

**文档目的**：验证数据库备份文件的完整性，并演示如何从生产环境备份中恢复出一个用于测试或开发的临时数据库（Demo 环境）。

**最后更新**：2026-01-13
**适用对象**：运维工程师、后端开发人员

---

## 准备工作

在开始演练之前，请确保你拥有服务器的 `sudo` 权限，并获取了数据库密码。

### 1. 获取数据库密码
通常可以在 `apps/medusa/.env` 文件中找到，或者查看 `~/.pgpass` 文件。

```bash
# 查看密码
grep "DATABASE_URL" apps/medusa/.env
# 或者
cat ~/.pgpass
```

### 2. 确认备份文件位置
我们的备份文件位于 `/backup/postgres/daily/`。

---

## 演练一：恢复 Medusa 数据库

我们将创建一个名为 `medusa_demo` 的新数据库，并将最新的生产环境数据导入其中。

### 第一步：找到最新的备份文件
```bash
# 列出最新的 medusa 备份
ls -t /backup/postgres/daily/medusa_production*.dump | head -n 1
```
*假设输出为：`/backup/postgres/daily/medusa_production_20260113_000001.dump`*

### 第二步：创建临时数据库
由于权限隔离，建议使用 `postgres` 超级用户创建数据库，然后将所有权移交给应用用户 `cs`。

```bash
# 1. 创建数据库
sudo -u postgres createdb medusa_demo

# 2. 修改所有者为 cs
sudo -u postgres psql -c "ALTER DATABASE medusa_demo OWNER TO cs;"
```

### 第三步：执行恢复
使用 `pg_restore` 工具将备份文件导入新数据库。

```bash
# 设置密码环境变量（替换为实际密码）
export PGPASSWORD=你的数据库密码

# 执行恢复
# -h localhost: 强制使用 TCP/IP 连接（因为我们使用了密码）
# -U cs: 使用 cs 用户身份
# -d medusa_demo: 目标数据库
pg_restore -h localhost -U cs -d medusa_demo /backup/postgres/daily/medusa_production_20260113_000001.dump
```

> **注意**：你可能会看到类似 `permission denied to change default privileges` 的警告。这是正常的，因为备份文件中包含了一些只有超级用户才能设置的权限指令，忽略即可，不影响数据完整性。

### 第四步：验证数据
查询关键表（如商品表 `product`）的数据量，确认数据已写入。

```bash
psql -h localhost -U cs -d medusa_demo -c "SELECT count(*) FROM product;"
```
*如果返回的数字大于 0，说明恢复成功。*

---

## 演练二：恢复 Strapi 数据库

同样的逻辑，我们来演练 Strapi 内容管理系统的数据库恢复。

### 第一步：找到最新的备份文件
```bash
ls -t /backup/postgres/daily/strapi_production*.dump | head -n 1
```

### 第二步：创建临时数据库
```bash
# 创建 strapi_demo 并授权给 cs
sudo -u postgres createdb strapi_demo
sudo -u postgres psql -c "ALTER DATABASE strapi_demo OWNER TO cs;"
```

### 第三步：执行恢复
```bash
export PGPASSWORD=你的数据库密码

pg_restore -h localhost -U cs -d strapi_demo /backup/postgres/daily/strapi_production_20260113_000001.dump
```

### 第四步：验证数据
查询管理员表 `admin_users`。

```bash
psql -h localhost -U cs -d strapi_demo -c "SELECT count(*) FROM admin_users;"
```

---

## 演练后清理

演练完成后，建议删除临时数据库以释放磁盘空间。

```bash
# 删除 medusa_demo
sudo -u postgres dropdb medusa_demo

# 删除 strapi_demo
sudo -u postgres dropdb strapi_demo
```

---

## 附录：核心概念

### 逻辑备份 vs 物理备份

在本次演练中，我们使用的是**逻辑备份**。

| 特性 | 逻辑备份 (Logical) | 物理备份 (Physical) |
| :--- | :--- | :--- |
| **我们用的工具** | `pg_dump` / `pg_restore` | (本次未使用) |
| **本质** | **SQL 重建指南**。包含一系列 SQL 语句（如 `CREATE TABLE`, `INSERT`），告诉数据库如何“重建”数据。 | **二进制克隆**。直接拷贝数据库的底层文件。 |
| **优点** | **极度灵活**。可以恢复到不同的操作系统、不同的数据库版本，甚至可以只恢复一张表。非常适合开发环境数据同步。 | **速度快**。适合海量数据（TB级）的灾难恢复。 |
| **适用场景** | 日常备份、迁移数据、搭建测试环境（如本次演练）。 | 全库崩溃后的紧急抢救。 |
