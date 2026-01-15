module.exports = {
  apps: [
    {
      name: "medusa-backend",
      cwd: "/home/coderisedev/cs/apps/medusa",
      script: "npm",
      args: "run start",
      instances: 1,            // Single instance (Medusa CLI doesn't support cluster mode)
      exec_mode: "fork",       // Fork mode for Medusa
      watch: false,
      autorestart: true,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
      },
      // Graceful shutdown
      kill_timeout: 5000,
      // Error handling
      max_restarts: 10,
      restart_delay: 1000,
    },
  ],
};
