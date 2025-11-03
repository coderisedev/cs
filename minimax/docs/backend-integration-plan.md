# Cockpit Simulator - 后端集成架构方案

## 项目概览
**项目名称**: Cockpit Simulator DTC独立站
**前端技术栈**: React + TypeScript + Vite + Tailwind CSS
**部署URL**: https://iskr5vedc9uj.space.minimaxi.com

## 后端架构设计

### 1. Medusa电商后端集成

#### 1.1 Medusa概述
- **功能**: 无头电商平台，处理产品、购物车、订单、支付
- **优势**: 开源、可扩展、RESTful API、支持多货币多区域

#### 1.2 集成架构

```
┌─────────────────┐
│  React Frontend │
│  (Cockpit Sim)  │
└────────┬────────┘
         │ REST API
         ↓
┌─────────────────┐      ┌──────────────┐
│  Medusa Server  │─────→│  PostgreSQL  │
│  (Node.js)      │      │  Database    │
└────────┬────────┘      └──────────────┘
         │
         ├─→ Stripe Payment
         ├─→ PayPal Payment
         └─→ Email Service
```

#### 1.3 Medusa核心功能实现

##### A. 产品管理
**需要实现的API调用**:
```typescript
// 获取所有产品
GET /store/products

// 获取单个产品
GET /store/products/:id

// 按分类筛选产品
GET /store/products?collection_id[]={id}

// 搜索产品
GET /store/products?q={query}
```

**产品数据迁移**:
- 将当前8个产品导入Medusa数据库
- 创建产品分类：A320 Series, 737 Series, 777 Series, Accessories
- 上传产品图片到Medusa Storage
- 设置产品变体（Standard、Pro等）
- 配置价格和库存

##### B. 购物车管理
**API集成**:
```typescript
// 创建购物车
POST /store/carts
{
  region_id: "reg_01..."
}

// 添加商品到购物车
POST /store/carts/:id/line-items
{
  variant_id: "variant_01...",
  quantity: 1
}

// 更新商品数量
POST /store/carts/:id/line-items/:line_id
{
  quantity: 2
}

// 删除商品
DELETE /store/carts/:id/line-items/:line_id
```

**前端购物车Context改造**:
- 用Medusa Cart ID替代本地状态
- 所有购物车操作通过API同步
- 购物车持久化（localStorage + Medusa）

##### C. 结账流程
**完整结账步骤**:

1. **配送信息** (Shipping):
```typescript
POST /store/carts/:id/shipping-address
{
  first_name: string,
  last_name: string,
  address_1: string,
  city: string,
  country_code: string,
  postal_code: string,
  phone: string
}
```

2. **选择配送方式**:
```typescript
POST /store/carts/:id/shipping-methods
{
  option_id: "so_01..."
}
```

3. **支付信息**:
```typescript
// 初始化支付会话
POST /store/carts/:id/payment-sessions

// 选择支付方式
POST /store/carts/:id/payment-session
{
  provider_id: "stripe" | "paypal"
}
```

4. **完成订单**:
```typescript
POST /store/carts/:id/complete
// 返回订单对象
```

##### D. 订单管理
```typescript
// 获取用户订单
GET /store/customers/me/orders

// 获取订单详情
GET /store/orders/:id

// 订单状态跟踪
// 状态: pending, completed, shipped, delivered, cancelled
```

#### 1.4 Medusa部署选项

**选项1: Medusa Cloud (推荐)**
- 官方托管服务
- 自动扩展
- 简单配置
- 月费约$20-50起

**选项2: 自托管**
- VPS/Cloud服务器（AWS、DigitalOcean、Vercel）
- 需要PostgreSQL数据库
- Redis（用于缓存）
- Node.js环境
- 域名和SSL证书

**快速开始命令**:
```bash
# 创建Medusa项目
npx create-medusa-app@latest

# 或使用现有项目
npm install @medusajs/medusa
npm install @medusajs/medusa-cli -g

# 运行迁移
medusa migrations run

# 创建管理员用户
medusa user -e admin@cockpit-simulator.com -p password

# 启动服务器
npm run start
```

---

### 2. Strapi CMS集成

#### 2.1 Strapi概述
- **功能**: 无头CMS，管理博客、FAQ、用户案例等内容
- **优势**: 可视化管理界面、RESTful API、GraphQL支持

#### 2.2 内容类型设计

##### A. 博客文章 (Blog Posts)
```typescript
interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string // Markdown/Rich Text
  author: {
    name: string
    avatar: string
  }
  category: 'Tutorial' | 'Review' | 'Case Study' | 'News'
  tags: string[]
  featured_image: string
  published_at: Date
  seo: {
    meta_title: string
    meta_description: string
    keywords: string[]
  }
}
```

**API调用**:
```typescript
// 获取所有文章
GET /api/blog-posts?populate=*&sort=published_at:desc

// 获取单篇文章
GET /api/blog-posts/:id?populate=*

// 按分类筛选
GET /api/blog-posts?filters[category][$eq]=Tutorial
```

##### B. FAQ系统
```typescript
interface FAQ {
  id: string
  question: string
  answer: string
  category: 'General' | 'Technical' | 'Shipping' | 'Payment'
  order: number
  helpful_count: number
}
```

##### C. 用户案例 (Case Studies)
```typescript
interface CaseStudy {
  id: string
  title: string
  customer_name: string
  customer_role: string
  avatar: string
  setup_description: string
  products_used: string[] // Medusa product IDs
  images: string[]
  testimonial: string
  rating: number
  featured: boolean
}
```

##### D. 下载中心 (Downloads)
```typescript
interface Download {
  id: string
  title: string
  description: string
  file_type: 'Driver' | 'Manual' | 'Software' | 'Guide'
  product: string // Medusa product ID
  file_url: string
  version: string
  release_date: Date
  file_size: string
  download_count: number
}
```

#### 2.3 Strapi部署选项

**选项1: Strapi Cloud (推荐)**
- 官方托管
- 自动备份
- 月费约$15-40起

**选项2: 自托管**
- 任何Node.js托管平台
- 需要PostgreSQL/MySQL
- 文件存储（本地或S3）

**快速开始**:
```bash
# 创建Strapi项目
npx create-strapi-app@latest cms --quickstart

# 创建内容类型
# 通过管理界面: http://localhost:1337/admin

# 启动
npm run develop
```

---

### 3. 支付集成方案

#### 3.1 Stripe集成

##### A. 前端集成
```typescript
// 安装
npm install @stripe/stripe-js

// 初始化
import { loadStripe } from '@stripe/stripe-js'
const stripe = await loadStripe('pk_test_...')

// 创建Payment Intent
const response = await fetch('/api/create-payment-intent', {
  method: 'POST',
  body: JSON.stringify({ cart_id: cartId })
})
const { client_secret } = await response.json()

// 确认支付
const { error } = await stripe.confirmCardPayment(client_secret, {
  payment_method: {
    card: cardElement,
    billing_details: { name: 'Customer Name' }
  }
})
```

##### B. Medusa Stripe Plugin
```bash
# 安装插件
npm install medusa-payment-stripe

# medusa-config.js
plugins: [
  {
    resolve: "medusa-payment-stripe",
    options: {
      api_key: process.env.STRIPE_SECRET_KEY,
      webhook_secret: process.env.STRIPE_WEBHOOK_SECRET,
    }
  }
]
```

##### C. 所需凭证
- **Publishable Key**: `pk_test_...` (前端)
- **Secret Key**: `sk_test_...` (后端)
- **Webhook Secret**: `whsec_...` (验证webhook)

#### 3.2 PayPal集成

##### A. PayPal Buttons
```typescript
// 安装
npm install @paypal/react-paypal-js

// 使用
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js'

<PayPalScriptProvider options={{ "client-id": "CLIENT_ID" }}>
  <PayPalButtons
    createOrder={(data, actions) => {
      return actions.order.create({
        purchase_units: [{
          amount: { value: total }
        }]
      })
    }}
    onApprove={async (data, actions) => {
      // 完成订单
    }}
  />
</PayPalScriptProvider>
```

##### B. Medusa PayPal Plugin
```bash
npm install medusa-payment-paypal

# 配置
plugins: [
  {
    resolve: "medusa-payment-paypal",
    options: {
      client_id: process.env.PAYPAL_CLIENT_ID,
      client_secret: process.env.PAYPAL_CLIENT_SECRET,
      sandbox: true // 测试环境
    }
  }
]
```

---

### 4. 数据流程图

```
用户浏览产品
    ↓
添加到购物车 → Medusa Cart API
    ↓
填写配送信息 → Medusa Shipping API
    ↓
选择支付方式
    ├─→ Stripe → Payment Intent → 确认支付
    └─→ PayPal → Create Order → Capture Order
    ↓
订单创建 → Medusa Order API
    ↓
发送确认邮件 ← Medusa Email Service
    ↓
用户账户 → 查看订单状态
```

---

### 5. 环境变量配置

创建 `.env.local` 文件：

```bash
# Medusa
VITE_MEDUSA_API_URL=https://api.cockpit-simulator.com
VITE_MEDUSA_PUBLISHABLE_KEY=pk_...

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# PayPal
VITE_PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...

# Strapi
VITE_STRAPI_API_URL=https://cms.cockpit-simulator.com
VITE_STRAPI_API_TOKEN=...
```

---

### 6. 实施时间线

#### 第1周: Medusa设置
- [ ] 部署Medusa实例
- [ ] 导入产品数据
- [ ] 配置区域和货币
- [ ] 测试API连接

#### 第2周: 前端集成
- [ ] 产品列表API集成
- [ ] 购物车API集成
- [ ] 结账流程集成
- [ ] 订单管理集成

#### 第3周: 支付集成
- [ ] Stripe支付集成
- [ ] PayPal支付集成
- [ ] Webhook处理
- [ ] 支付测试

#### 第4周: Strapi和内容
- [ ] 部署Strapi实例
- [ ] 创建内容类型
- [ ] 博客系统集成
- [ ] FAQ系统集成

#### 第5周: 测试和优化
- [ ] 完整流程测试
- [ ] 性能优化
- [ ] SEO优化
- [ ] 生产环境部署

---

### 7. 成本估算

| 服务 | 月费用 | 年费用 |
|------|--------|--------|
| Medusa Cloud (Pro) | $50 | $600 |
| Strapi Cloud (Pro) | $40 | $480 |
| 数据库托管 (Supabase) | $25 | $300 |
| 域名 | - | $15 |
| SSL证书 | 免费 | $0 |
| **总计** | **$115** | **$1,395** |

*自托管可降低至约$30/月*

---

### 8. 下一步行动

#### 用户需要决策:
1. **Medusa**: 使用Cloud还是自托管？
2. **Strapi**: 使用Cloud还是自托管？
3. **支付**: 提供Stripe和PayPal测试凭证
4. **域名**: 确认域名（如cockpit-simulator.com）

#### 开发团队准备:
1. 等待用户确认后端配置
2. 准备Medusa产品导入脚本
3. 设计Strapi内容结构
4. 准备支付集成代码

---

## 技术支持

如有任何问题，请提供：
- 选择的托管方案
- API凭证（测试环境）
- 具体功能需求
- 预算限制

我将立即开始相应的集成开发工作。
