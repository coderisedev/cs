# 如何找到 WordPress 用户迁移及优惠券发放文档

**问题**：用户询问在 `docs` 目录下关于从 WordPress 导出用户进行分组并发放优惠券的总结文档。

**找到的文档**：
`docs/prd/wordpress-to-medusa-customer-migration.md` (WordPress 老客户迁移至 Medusa 方案)

**查找方法与命令**：

1. **关键词搜索 (WordPress)**：
   使用 `grep` 递归搜索核心技术栈关键词：
   ```bash
   grep -r "WordPress" docs/
   ```

2. **多关键词过滤 (分组/优惠券)**：
   使用扩展正则表达式同时匹配多个核心业务关键词：
   ```bash
   grep -rE "优惠券|分组|coupon|group" docs/
   ```

3. **内容确认**：
   通过 `cat` 或 `read_file` 查看文档结构，确认其包含“数据导出、脚本分层、后台配置、邮件发送”的完整闭环流程。

**总结**：
该文档详细记录了将 WooCommerce 客户按历史消费金额导入 Medusa 并分配至不同 `Customer Group`，以实现定向优惠券发放的端到端方案。
