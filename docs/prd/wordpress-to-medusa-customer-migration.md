# WordPress 老客户迁移至 Medusa 方案

针对"老系统 WordPress 商城客户数据迁移到新 Medusa 系统，按历史消费分层发放定向优惠券"的需求。

## 背景

- 老系统：WordPress（WooCommerce）商城
- 新系统：Medusa，已支持用户自注册、Google 一键登录，计划实现邮件验证码登录
- 目标：将老客户导入新系统，按历史订单金额分层加入不同 Customer Group，配合定向优惠券使用

## 核心问题

WordPress（WooCommerce）和 Medusa 的用户体系完全独立，密码哈希算法不同，无法直接"打通"认证。但**客户数据迁移**是完全可行的。

## 端到端完整流程

```
WordPress 导出客户 CSV（含历史订单总额）
        ↓
迁移脚本批量创建 Medusa 客户账号
        ↓
脚本按历史消费金额将客户分层加入不同 Customer Group
  ├── VIP_Gold（消费≥$2000）
  ├── VIP_Silver（消费≥$1000）
  └── VIP_Bronze（消费<$1000）
        ↓
Admin 后台为每个 Group 创建不同折扣码 + 指定产品 + 有效期
        ↓
按层级发送不同营销邮件：告知对应优惠码 + 新系统登录方式
        ↓
老客户输入邮箱 → 收验证码 → 登录成功 → 购物时使用专属优惠码 ✓
```

## 实施步骤

### 步骤一：从 WordPress 导出老客户数据（含消费金额）

WooCommerce 后台导出客户 CSV，或通过数据库查询获取每个客户的历史累计消费：

```sql
-- WordPress 数据库查询客户累计消费
SELECT
  pm_email.meta_value AS email,
  pm_first.meta_value AS first_name,
  pm_last.meta_value AS last_name,
  SUM(pm_total.meta_value) AS total_spent
FROM wp_posts AS orders
JOIN wp_postmeta AS pm_email ON orders.ID = pm_email.post_id AND pm_email.meta_key = '_billing_email'
JOIN wp_postmeta AS pm_first ON orders.ID = pm_first.post_id AND pm_first.meta_key = '_billing_first_name'
JOIN wp_postmeta AS pm_last ON orders.ID = pm_last.post_id AND pm_last.meta_key = '_billing_last_name'
JOIN wp_postmeta AS pm_total ON orders.ID = pm_total.post_id AND pm_total.meta_key = '_order_total'
WHERE orders.post_type = 'shop_order'
  AND orders.post_status IN ('wc-completed', 'wc-processing')
GROUP BY pm_email.meta_value, pm_first.meta_value, pm_last.meta_value
```

导出为 JSON 格式供迁移脚本使用。

### 步骤二：迁移脚本完成导入 + 分层分组

```typescript
import Medusa from "@medusajs/js-sdk"
import oldCustomers from "./wordpress-export.json"

const client = new Medusa({ baseUrl: "http://localhost:9000" })

// 1. 定义分层规则
const tiers = [
  { name: "VIP_Gold",   minSpend: 2000 },  // 消费≥$2000
  { name: "VIP_Silver", minSpend: 1000 },  // 消费≥$1000
  { name: "VIP_Bronze", minSpend: 0    },  // 其余客户
]

// 2. 创建各层级的 Customer Group
const groups: Record<string, string> = {}
for (const tier of tiers) {
  const group = await client.admin.customerGroups.create({
    name: tier.name
  })
  groups[tier.name] = group.id
}

// 3. 导入客户并按消费金额分组
const tierBuckets: Record<string, string[]> = {
  VIP_Gold: [],
  VIP_Silver: [],
  VIP_Bronze: [],
}

for (const old of oldCustomers) {
  const customer = await client.admin.customers.create({
    email: old.email,
    first_name: old.first_name,
    last_name: old.last_name,
    // 不设密码，用户通过邮件验证码或 Google 登录
  })

  // 按历史消费金额分配层级（从高到低匹配）
  if (old.total_spent >= 2000) {
    tierBuckets.VIP_Gold.push(customer.id)
  } else if (old.total_spent >= 1000) {
    tierBuckets.VIP_Silver.push(customer.id)
  } else {
    tierBuckets.VIP_Bronze.push(customer.id)
  }
}

// 4. 批量加入对应的组
for (const tier of tiers) {
  if (tierBuckets[tier.name].length > 0) {
    await client.admin.customerGroups.addCustomers(groups[tier.name], {
      customer_ids: tierBuckets[tier.name]
    })
  }
}

// 完成！之后在 Admin 后台为每个组创建不同的折扣码即可
```

### 步骤三：Admin 后台配置分层折扣码

为每个 Customer Group 创建对应的折扣码：

| 客户层级 | 历史消费 | 折扣码 | 优惠力度 | 适用产品 |
|:---|:---|:---|:---|:---|
| Gold | ≥$2000 | `GOLD-20OFF` | 20% off | 指定产品 |
| Silver | ≥$1000 | `SILVER-15OFF` | 15% off | 指定产品 |
| Bronze | <$1000 | `BRONZE-10OFF` | 10% off | 指定产品 |

每个折扣码配置（参考 [定向客户优惠券发放方案](./medusa-targeted-discount-plan.md)）：
1. 绑定对应的 Customer Group
2. 指定适用产品
3. 设置有效期（Start Date / End Date）
4. 开启"每人限用一次"

### 步骤四：按层级发送不同营销邮件

各层级邮件模板不同，内容包含：
- 新系统已为您保留账号
- 登录方式：输入邮箱 → 收取验证码 → 登录（或使用 Google 一键登录）
- 专属优惠码（对应层级的码）
- 适用产品和有效期说明
- 可根据层级调整措辞（如 Gold 客户强调"尊享"）

## 分层规则的灵活性

分层规则可以根据业务需要自由调整：

- **金额阈值**：可以改为 $500 / $1500 / $5000 等任意值
- **层级数量**：可以分2层、3层、5层都行
- **优惠类型**：固定金额（$50 off）或百分比（20% off）均可
- **附加条件**：还可以结合订单次数、最近购买时间等维度

所有这些调整都只影响迁移脚本的分层逻辑和 Admin 后台配置，不需要额外开发。

## 优惠码的"发放"机制

Medusa 的折扣机制是**验证制**，不是"发到账户里"：

| 方式 | 说明 | 开发量 |
|:---|:---|:---|
| **基础方式** | 邮件通知优惠码，客户结账时手动输入 | 0 |
| **进阶方式** | 前端检测用户 Customer Group，购物车/结账页自动显示可用优惠 | 少量前端 |
| **最佳体验** | 登录后账户页或 Banner 展示"您有专属优惠"，引导使用 | 少量前端 |

安全保障：即使优惠码被泄露，只有对应 Customer Group 内的用户才能成功使用。

## 登录方式：邮件验证码（推荐）

采用邮件验证码登录（参考 [Email OTP 登录方案](./email-otp-login-plan.md)）的优势：

- 老客户无需设置密码，输入邮箱即可收码登录
- 注册和登录流程统一：输入邮箱 → 收验证码 → 进入系统
- 彻底避免密码迁移问题
- 同时保留 Google 一键登录作为辅助

## 为什么这是最佳方案

| 考虑点 | 说明 |
|:---|:---|
| **开发量** | 一个迁移脚本 + Email OTP 登录模块 |
| **用户体验** | 无密码登录，老客户零门槛使用新系统 |
| **安全性** | 不迁移密码 + 每次登录验证邮箱所有权 + 优惠码组验证 |
| **精准营销** | 按消费金额分层，高价值客户获得更大优惠 |
| **灵活可控** | 分层规则、优惠力度随时可调 |

## 总结

整个方案的核心开发工作：
1. **迁移脚本**（一次性）：导入客户 + 按历史消费分层加组
2. **Email OTP 登录模块**：让老客户无密码登录
3. **Admin 配置**（无代码）：为每个层级创建折扣码绑定对应客户组
4. **营销邮件**（无代码）：按层级发送不同优惠码和登录方式

不需要两个系统实时打通，不需要迁移密码，不需要开发"发券到账户"功能。

## 相关文档

- [定向客户优惠券发放方案](./medusa-targeted-discount-plan.md)
- [邮件验证码登录方案](./email-otp-login-plan.md)
