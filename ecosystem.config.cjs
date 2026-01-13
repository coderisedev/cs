module.exports = {
  apps: [
    {
      name: "medusa-backend",
      cwd: "./apps/medusa",
      script: "npm",
      args: "run start",

      // 环境变量
      env: {
        NODE_ENV: "production",
        PORT: 9000
      },

      // 进程模式 - Medusa 建议单实例，使用 fork 模式
      // 因为 Medusa 内部有自己的连接池管理
      instances: 1,
      exec_mode: "fork",

      // 日志配置
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      merge_logs: true,
      // 使用 PM2 默认日志目录，便于 pm2-logrotate 管理

      // 重启策略
      max_restarts: 10,
      min_uptime: "30s",        // 启动后 30s 内崩溃才计入重启次数
      restart_delay: 5000,      // 重启间隔 5s
      autorestart: true,

      // 内存限制
      max_memory_restart: "800M",

      // 优雅关闭
      kill_timeout: 10000,      // 10s 优雅关闭时间
      wait_ready: true,         // 等待 ready 信号
      listen_timeout: 30000,    // 启动超时 30s

      // 健康检查（可选）
      // exp_backoff_restart_delay: 100,  // 指数退避重启
    },
    {
      name: "strapi-cms",
      cwd: "./apps/strapi",
      script: "npm",
      args: "run start",

      // 环境变量
      env: {
        NODE_ENV: "production",
        PORT: 1337
      },

      // 进程模式
      instances: 1,
      exec_mode: "fork",

      // 日志配置
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      merge_logs: true,

      // 重启策略
      max_restarts: 10,
      min_uptime: "30s",
      restart_delay: 5000,
      autorestart: true,

      // 内存限制
      max_memory_restart: "800M",

      // 优雅关闭
      kill_timeout: 10000,
      wait_ready: true,
      listen_timeout: 30000,
    }
  ]
};
