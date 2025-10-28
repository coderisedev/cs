# GitHub 远程 MCP 使用方法（Codex CLI）

Date: 2025-10-27
Owner: Platform / DevEx

## 目标
- 在 Codex CLI 中启用 GitHub 远程 MCP（Hosted by GitHub）。
- 使用 PAT 完成认证，支持 GitHub.com 与 GHES/ghe.com。
- 提供最小连通性自检与常见问题处理。

## 前置条件
- GitHub PAT（最小权限）：
  - `repo`, `read:org`（如需拉 GHCR：`read:packages`）
- Codex CLI（支持 MCP 配置文件 `~/.config/codex/mcp.json`）
- 可选：GHES / 数据驻留（需要提供 `https://<your-ghe-or-ghe.com-domain>`）

## Codex CLI 配置
- 文件路径：`~/.config/codex/mcp.json`
- 推荐内容（远程 HTTP + 本地 Docker 备选）：

```
{
  "inputs": [
    {
      "type": "promptString",
      "id": "github_pat",
      "description": "GitHub Personal Access Token (scopes: repo, read:org; add read:packages if needed)",
      "password": true
    },
    {
      "type": "promptString",
      "id": "github_host",
      "description": "Optional GHES/ghe.com host (e.g., https://ghe.example.com). Leave empty for github.com",
      "password": false
    }
  ],
  "servers": {
    "github": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp/",
      "headers": {
        "Authorization": "Bearer ${input:github_pat}"
      }
    },
    "github-local": {
      "command": "docker",
      "args": [
        "run", "-i", "--rm",
        "-e", "GITHUB_PERSONAL_ACCESS_TOKEN",
        "-e", "GITHUB_HOST",
        "-e", "GITHUB_TOOLSETS",
        "ghcr.io/github/github-mcp-server"
      ],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${input:github_pat}",
        "GITHUB_HOST": "${input:github_host}",
        "GITHUB_TOOLSETS": "repos,issues,pull_requests,actions,code_security"
      }
    }
  }
}
```

- 使用方式：
  1. 启动 Codex CLI，选择 `github`（远程）服务器；按提示输入 PAT。
  2. 若需 GHES/ghe.com：选择 `github-local`（本地 Docker）并填写 `github_host`。

## 最小连通性自检
- REST 直连（验证 PAT 与网络）：
  ```bash
  export GITHUB_PAT=your_token
  curl -s -H "Authorization: token $GITHUB_PAT" \
    "https://api.github.com/user/repos?per_page=5" | jq -r '.[].full_name'
  ```
- 远程 MCP（HTTP）协议自检：
  1) 初始化并取会话：
     ```bash
     export GITHUB_PAT=your_token
     URL=https://api.githubcopilot.com/mcp/
     SID=$(curl -sS -D - -o /dev/null \
       -H "Authorization: Bearer $GITHUB_PAT" \
       -H 'Content-Type: application/json' \
       -d '{"jsonrpc":"2.0","id":"1","method":"initialize","params":{"protocolVersion":"2024-10-07","clientInfo":{"name":"codex-cli","version":"0.1.0"},"capabilities":{}}}' \
       "$URL" | tr -d '\r' | sed -n 's/^mcp-session-id: \(.*\)$/\1/p' | tail -n1)
     echo "session=$SID"
     ```
  2) 列工具：
     ```bash
     curl -sS \
       -H "Authorization: Bearer $GITHUB_PAT" \
       -H "Mcp-Session-Id: $SID" \
       -H 'Content-Type: application/json' \
       -d '{"jsonrpc":"2.0","id":"2","method":"tools/list","params":{}}' \
       "$URL" | jq '.result.tools | length'
     ```

## 常见问题
- 401/403：PAT 无效或权限不足；确保具备 `repo`, `read:org`（必要时 `read:packages`）。
- GHES 连接失败：确认 `GITHUB_HOST` 为 `https://` 前缀且可达；如使用 Docker 模式，镜像需能拉取。
- 工具过多影响效果：通过 `GITHUB_TOOLSETS`（例如 `repos,issues,pull_requests,actions`）精简。
- VS Code/其他 IDE：参考上游仓库 README 的安装向导（OAuth 支持依宿主而定）。

## 安全建议
- PAT 不入库；本地通过输入或环境变量注入：
  ```bash
  export GITHUB_PAT=your_token
  ```
- 最小权限 + 定期轮换；必要时单独为项目生成专用 PAT。
- `.env` 入 .gitignore，限制文件权限：
  ```bash
  chmod 600 ~/.config/codex/mcp.json
  ```

## 参考
- GitHub MCP Server 仓库：`github/github-mcp-server`
- 远程端点：`https://api.githubcopilot.com/mcp/`
- Toolsets 与更多示例：见上游 README（工具清单、参数说明）

