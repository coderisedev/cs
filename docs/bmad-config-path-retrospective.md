# BMAD 配置路径修复复盘

## 背景
近期在 Codex CLI 中调用 BMAD Scrum Master 代理时，系统始终尝试从 `/home/coderisedev/code/coderise/bmad/bmm/config.yaml` 读取配置。然而实际的仓库路径已经迁移至 `/home/coderisedev/code/cs/bmad/bmm/config.yaml`，导致激活流程在第 2 步加载配置阶段就失败。

## 发现过程
1. 用户在运行代理时收到配置加载错误，并反馈路径不正确。  
2. 检查仓库内容确认 `bmad/bmm/config.yaml` 存在于 `code/cs` 路径下。  
3. 搜索后发现 `.codex/prompts` 下的缓存模板依旧硬编码旧路径，同时部分 `docs/stories/validation-report-*.md` 也引用了旧路径。

## 根因分析
- 旧版项目拷贝的提示模板没有随仓库目录调整同步更新，导致代理在运行时读取缓存模板并使用过时的绝对路径。  
- 生成的校验报告同样继承旧路径，使错误在后续验证中持续存在。

## 解决措施
- 使用 `perl -pi -e 's|旧路径|新路径|g'` 批量更新 `~/.codex/prompts/bmad-bmm-*.md` 以及 `~/.codex/prompts/bmad-core-*.md` 内的所有引用。  
- 同步修正 `docs/stories/validation-report-*.md` 中的 checklist 路径，使其指向 `code/cs`。  
- 复核 `bmad/bmm/agents` 目录确认模板本身使用 `{project-root}` Token，避免进一步漂移。

## 结果验证
- 运行 `rg "/home/coderisedev/code/coderise"` 验证仓库及本地提示目录中已无旧路径残留。  
- 重新激活 Scrum Master 代理时，配置加载成功，能正常展示问候语与菜单。

## 后续行动
1. 将 `.codex/prompts` 中与仓库位置相关的配置统一改为 `{project-root}` 或相对路径以降低环境耦合。  
2. 在 BMAD 导入脚本中加入路径一致性检查，防止再次出现硬编码路径。  
3. 更新团队文档，提醒迁移仓库时同步清理 AI 工具缓存目录。
