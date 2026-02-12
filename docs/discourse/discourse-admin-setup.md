# Discourse 管理面板配置指南

本文档供 Discourse 管理员操作，目的是将论坛的登录认证切换到官网（Medusa/Next.js Storefront）作为唯一身份提供方。

切换完成后：
- 论坛不再显示自己的登录/注册表单
- 所有登录、注册操作都跳转到官网完成
- 已有论坛账号通过邮箱自动关联到官网账号

---

## 前提条件

- 拥有 Discourse 管理员权限
- 官网 SSO 端点已部署上线（地址见下方）

---

## 第一步：进入设置页面

登录 Discourse 管理后台：

```
https://community.cockpit-simulator.com/admin/site_settings
```

页面顶部有搜索框，后续每一项都可以直接搜索设置名称。

---

## 第二步：配置 DiscourseConnect（共 7 项）

按以下顺序逐一搜索并配置：

### 1. `discourse_connect_secret`

> 搜索 `discourse_connect_secret`

```
RCScMUg0ozQ13Py1
```

这是官网和论坛之间的共享签名密钥，**必须和官网侧完全一致**。复制粘贴，注意不要有多余空格。

---

### 2. `discourse_connect_url`

> 搜索 `discourse_connect_url`

```
https://prd.aidenlux.com/api/discourse/sso
```

这是官网的 SSO 端点地址。当用户在论坛点「登录」时，会被重定向到这个地址。

---

### 3. `enable_discourse_connect`

> 搜索 `enable_discourse_connect`

设为 **启用（勾选）**。

**注意：启用后论坛将立即禁用本地登录表单。** 请确保前两步的 secret 和 url 都已正确填写后再启用此项。如果配置有误，管理员可以通过命令行恢复（见文末「紧急回退」）。

---

### 4. `discourse_connect_overrides_email`

> 搜索 `discourse_connect_overrides_email`

设为 **启用（勾选）**。

作用：每次 SSO 登录时，用官网的邮箱覆盖论坛侧的邮箱。确保两端邮箱始终一致。

---

### 5. `discourse_connect_overrides_name`

> 搜索 `discourse_connect_overrides_name`

设为 **启用（勾选）**。

作用：每次 SSO 登录时，用官网的姓名覆盖论坛侧的显示名。

---

### 6. `logout_redirect`

> 搜索 `logout_redirect`

```
https://prd.aidenlux.com
```

作用：用户在论坛点「登出」后跳转到官网首页。

---

### 7. `verbose_discourse_connect_logging`

> 搜索 `verbose_discourse_connect_logging`

设为 **启用（勾选）**。

作用：在 `/admin/logs` 中输出详细的 SSO 日志。**上线稳定后可以关闭。**

---

## 配置汇总

确认所有设置与下表一致：

| 设置项 | 值 |
|--------|-----|
| `discourse_connect_secret` | `RCScMUg0ozQ13Py1` |
| `discourse_connect_url` | `https://prd.aidenlux.com/api/discourse/sso` |
| `enable_discourse_connect` | ✅ 启用 |
| `discourse_connect_overrides_email` | ✅ 启用 |
| `discourse_connect_overrides_name` | ✅ 启用 |
| `logout_redirect` | `https://prd.aidenlux.com` |
| `verbose_discourse_connect_logging` | ✅ 启用 |

---

## 第三步：验证

配置完成后，按以下步骤验证 SSO 是否正常工作。

### 测试 1：未登录访问论坛

1. 打开浏览器隐身窗口
2. 访问 `https://community.cockpit-simulator.com`
3. 点击「登录」按钮
4. **预期**：跳转到官网登录页（`prd.aidenlux.com`）
5. 输入官网账号密码登录
6. **预期**：自动跳转回论坛，并且已登录，显示与官网一致的用户名

### 测试 2：已登录访问论坛

1. 先在官网 `https://prd.aidenlux.com` 登录
2. 新标签页打开 `https://community.cockpit-simulator.com`
3. **预期**：经过一次快速跳转后自动登录（用户几乎无感知）

### 测试 3：论坛登出

1. 在论坛点「登出」
2. **预期**：跳转到 `https://prd.aidenlux.com`

### 测试 4：查看日志

如果测试遇到问题，检查 SSO 日志：

```
https://community.cockpit-simulator.com/admin/logs
```

搜索 `sso` 或 `discourse_connect` 相关条目。

---

## 紧急回退

如果 SSO 配置有误导致所有人（包括管理员）无法登录，可以通过服务器命令行禁用 SSO：

```bash
# 进入 Discourse 容器
cd /var/discourse
./launcher enter app

# 在容器内执行
discourse disable_discourse_connect
```

这会立即禁用 DiscourseConnect 并恢复本地登录表单，管理员可以用原密码登录后重新调整配置。

---

## 后续操作（非紧急）

以下设置可以在 SSO 稳定运行后视需要调整：

| 设置项 | 说明 |
|--------|------|
| `verbose_discourse_connect_logging` | 稳定后设为关闭，减少日志量 |
| `discourse_connect_overrides_username` | 如需同步用户名可启用 |
| `discourse_connect_overrides_avatar` | 如需同步头像可启用（需要官网侧传 `avatar_url`） |
