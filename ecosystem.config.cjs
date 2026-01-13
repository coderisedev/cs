module.exports = {
  apps: [
    {
      name: "medusa-backend",
      cwd: "./apps/medusa",
      script: "npm",
      args: "run start",
      env: {
        NODE_ENV: "production",
        PORT: 9000
      },
      // Logging
      out_file: "./logs/medusa-out.log",
      error_file: "./logs/medusa-error.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      merge_logs: true,
      // Restart policy
      max_restarts: 10,
      restart_delay: 3000,
      autorestart: true,
      // Performance
      max_memory_restart: "1G"
    },
    {
      name: "strapi-cms",
      cwd: "./apps/strapi",
      script: "npm",
      args: "run start",
      env: {
        NODE_ENV: "production",
        PORT: 1337
      },
      // Logging
      out_file: "./logs/strapi-out.log",
      error_file: "./logs/strapi-error.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      merge_logs: true,
      // Restart policy
      max_restarts: 10,
      restart_delay: 3000,
      autorestart: true,
      // Performance
      max_memory_restart: "1G"
    }
  ]
};
