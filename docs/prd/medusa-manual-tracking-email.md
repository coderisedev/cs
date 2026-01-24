# 手动物流追踪码与邮件通知方案 (PRD)

针对“发货后手动输入快递追踪码并自动发送通知邮件”的需求，本方案利用 Medusa 原生的发货（Fulfillment）机制结合通知（Notification）插件实现。

## 1. 业务逻辑
在未与快递公司 API 打通的情况下，通过 Medusa Admin 后台的手动录入功能，将“物流单号录入”与“邮件自动触发”解耦。

## 2. 方案优势
*   **原生支持：** 利用 Medusa `Fulfillment` 实体中自带的 `tracking_numbers` 字段，无需修改数据库。
*   **自动化触发：** 点击“创建发货”会自动触发系统事件，保证邮件发送的即时性。
*   **低代码量：** 主要通过配置成熟的 Notification 插件（如 SendGrid/Resend）实现。

## 3. 实现细节

### A. 后台操作流程 (Admin Side)
1.  **订单管理：** 进入待发货订单详情页。
2.  **创建发货 (Create Fulfillment)：**
    *   在弹窗中选择本次发货的商品及数量。
    *   在 **Tracking Number** 输入框中，手动填入快递单号（如 SF12345678）。
3.  **完成发货：** 点击确认后，系统会自动将单号存入 `fulfillment` 记录。

### B. 技术实现链路 (Technical Side)
1.  **事件监听：** 系统会自动抛出 `order.fulfillment_created` 或 `order.shipment_created` 事件。
2.  **通知服务：** 配置 `medusa-plugin-sendgrid` 或 `medusa-plugin-resend` 插件。
3.  **模板映射：** 在插件配置中，将发货事件映射至特定的邮件模板。
    *   **邮件模板内容需包含：** 客户姓名、订单号、发货清单、**快递公司名称（手动录入或固定）**及**追踪码 (Tracking Number)**。

## 4. 落地步骤建议

1.  **集成邮件服务：**
    *   安装插件：`npm install medusa-plugin-sendgrid`（或其他）。
    *   在 `medusa-config.js` 中配置 API Key 及发件人信息。
2.  **设计邮件模板：**
    *   在 SendGrid/Resend 后台设计 HTML 模板。
    *   使用占位符（如 `{{tracking_number}}`）来动态显示后台录入的单号。
3.  **测试闭环：**
    *   手动创建一个测试订单。
    *   录入虚拟追踪码，检查测试邮箱是否收到包含该号码的邮件。

## 5. 结论
此方案是 Medusa 社区最标准的做法，既满足了当前手动操作的灵活性，也为未来集成快递公司 API（自动化填入单号）预留了无缝切换的空间。
