# Medusa 优惠券发放方案调研

Medusa 已经内置了强大的 **Discount（折扣）** 系统，能够满足大部分优惠券需求。以下是针对“给客户发放产品优惠券码”功能的三种实现方案：

## 1. 基础方案：手动创建（内置功能）
Medusa 后台（Admin）自带优惠券管理功能，无需额外安装插件。

*   **功能：** 支持创建“固定金额”、“百分比”或“免运费”折扣。
*   **规则：** 
    *   设置有效期（开始/结束时间）。
    *   限制总使用次数或每个客户的使用次数。
    *   限制特定商品、产品分类或特定的客户群组（Customer Groups）可用。
*   **发放方式：** 在后台手动创建一个 Code（例如：`WELCOME2026`），通过邮件、短信或站内信分发给客户。

## 2. 进阶方案：自动生成唯一券码（官方插件）
如果需要为每个客户生成唯一的、一次性的优惠券码，推荐使用官方插件。

*   **名称：** `medusa-plugin-discount-generator`
*   **核心逻辑：**
    1.  **模板折扣：** 在后台创建一个“动态折扣”（Dynamic Discount）作为模板。
    2.  **按需生成：** 通过 API (`POST /discount-code`) 或服务层 (`DiscountGeneratorService`) 根据模板瞬间生成一个随机且唯一的 Code。
*   **适用场景：** 自动化营销，如“注册后自动发放 9 折券”。

## 3. 自动化发放体系（集成方案）
实现全自动的“触发 -> 生成 -> 发送”流程。

*   **组件：**
    1.  **Event Bus：** 监听 Medusa 核心事件（如 `customer.created` 注册成功）。
    2.  **Subscriber：** 订阅上述事件，逻辑中调用 `DiscountGeneratorService` 生成唯一码。
    3.  **Notification：** 配合邮件插件（如 `medusa-plugin-sendgrid`）将生成的 Code 自动发送至客户邮箱。

---

## 下一步建议
1.  **确认需求：** 确定是使用“通用码”（所有人共用）还是“唯一码”（一人一码）。
2.  **检查环境：** 检查 `package.json` 确认是否已安装 `medusa-plugin-discount-generator`。
3.  **技术验证：** 若需自动发放，需配置 Event Bus（推荐使用 Redis）和邮件服务。
