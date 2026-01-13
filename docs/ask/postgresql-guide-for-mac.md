# PostgreSQL macOS 开发避坑指南 (对比 Linux/Ubuntu)

**最后更新**: 2026-01-13
**适用场景**: 本地 Mac 开发，Ubuntu 服务器部署
**目标**: 解决 macOS 上 Postgres 安装、权限和启动管理的痛点

---

## 1. 核心差异概览

| 特性 | Ubuntu (生产环境) | macOS (本地开发) |
| :--- | :--- | :--- |
| **安装方式** | `apt install postgresql` | 推荐 **Homebrew** (`brew install postgresql`)<br>或 Postgres.app (GUI) |
| **默认用户** | `postgres` (Linux 系统用户) | **当前登录用户** (如 `yourname`) |
| **认证机制** | **Peer** (sudo -u postgres 刷脸) | **Trust** (本地无密码) 或 **Login** (当前用户) |
| **启动服务** | `systemctl start postgresql` | `brew services start postgresql` |
| **超级管理员**| `postgres` | **当前 Mac 用户名** |

---

## 2. 最大的“文化冲击”：找不到 postgres 用户？

在 Ubuntu 上，我们习惯了 `sudo -u postgres psql`。
**但在 Mac (Homebrew 安装) 上，这个命令通常会报错！**

### 为什么？
Homebrew 安装的 PostgreSQL 默认**不会**创建 `postgres` 这个系统用户。
它默认使用**您当前的 Mac 用户名**作为数据库的超级管理员。

### Mac 上的正确操作姿势

#### 1. 登录数据库 (超级管理员)
*   **Ubuntu**: `sudo -u postgres psql`
*   **macOS**: 直接输入 `psql postgres`
    *   *解释*: 尝试连接 `postgres` 数据库。因为 Mac 上默认配置了 Trust 模式，且当前用户就是超管，所以直接进入。

#### 2. 创建应用用户 (如 `cs`)
在 Mac 上，您不需要切换用户，直接用当前用户创建即可：

```bash
# Mac 终端直接运行
createuser -s cs --password
# 输入两遍密码
```

---

## 3. 安装与启动 (Homebrew 方案)

这是最符合开发者习惯的方案。

### 安装
```bash
brew install postgresql@16
```

### 启动服务
不要用 `pg_ctl` 手动启动，使用 Homebrew Services 管理：

```bash
# 后台启动服务 (开机自启)
brew services start postgresql@16

# 停止服务
brew services stop postgresql@16

# 重启服务
brew services restart postgresql@16
```

### 验证安装
```bash
psql postgres -c "SELECT version();"
```

---

## 4. 常见问题：Peer Authentication Failed

在 Mac 上开发时，最常遇到的报错之一是连接 Medusa/Strapi 时出现：
`FATAL: password authentication failed for user "cs"`

即使你觉得密码是对的。

### 原因
Mac 上的 `pg_hba.conf` 默认配置通常比较宽松 (`trust`)，但也可能因版本不同而默认为严格模式。

### 解决方案
找到配置文件位置：
```bash
# 查看配置文件路径
psql postgres -c "SHOW hba_file;"
```
*通常在 `/opt/homebrew/var/postgres/pg_hba.conf` (Apple Silicon) 或 `/usr/local/var/postgres/pg_hba.conf` (Intel)*

**开发环境推荐配置 (pg_hba.conf)**：
将本地连接设置为 `trust` (仅限本地开发！)，这样就不用纠结密码了。

```text
# TYPE  DATABASE        USER            ADDRESS                 METHOD
host    all             all             127.0.0.1/32            trust
host    all             all             ::1/128                 trust
```
*修改后记得 `brew services restart postgresql@16`*

---

## 5. 命令对照表 (Ubuntu vs Mac)

| 操作 | Ubuntu (部署环境) | macOS (Homebrew 开发环境) |
| :--- | :--- | :--- |
| **进入控制台** | `sudo -u postgres psql` | `psql postgres` |
| **创建库** | `sudo -u postgres createdb mydb` | `createdb mydb` |
| **创建用户** | `sudo -u postgres createuser cs`| `createuser cs` |
| **重启服务** | `sudo systemctl restart postgresql` | `brew services restart postgresql@16` |
| **日志位置** | `/var/log/postgresql/` | `/opt/homebrew/var/log/postgres.log` |

---

## 6. 如果你更喜欢 GUI (Postgres.app)

有些 Mac 开发者不喜欢命令行管理服务，可以使用 **Postgres.app**。
*   它是一个 Mac App，打开就是启动，关闭就是停止。
*   **区别**：它的二进制文件路径不同，需要把 `/Applications/Postgres.app/Contents/Versions/latest/bin` 加到 PATH 环境变量中，否则终端里敲 `psql` 会提示找不到命令。

---

## 总结

在 Mac 上开发 Medusa/Strapi 时，请记住：
1.  **别用 sudo**：不要试图 `sudo -u postgres`，直接用你的终端用户操作。
2.  **默认库**：登录时显式指定 `psql postgres`，否则它会尝试连接与你用户名同名的数据库（如果不存在就会报错）。
3.  **服务管理**：用 `brew services`，别自己折腾 `pg_ctl`。
