// ecosystem.config.js - PM2 配置文件
// 使用方式:
//   pm2 start ecosystem.config.js           # 启动（development）
//   pm2 start ecosystem.config.js --env production  # 启动（production）
//   pm2 reload ecosystem.config.js          # 零停机重载
//   pm2 stop ai-prompt-platform             # 停止
//   pm2 delete ai-prompt-platform           # 删除进程
//   pm2 save                                # 保存进程列表（开机自启）
//   pm2 startup                             # 生成开机自启脚本

module.exports = {
  apps: [
    {
      // ── 基础配置 ──────────────────────────────────────────────
      name: "ai-prompt-platform",
      script: "node_modules/.bin/next",
      args: "start",
      cwd: __dirname, // 确保从 ecosystem.config.js 所在目录启动

      // ── 进程模式 ──────────────────────────────────────────────
      // fork:    单进程，Next.js 自带高效异步，推荐普通服务器使用
      // cluster: 多进程，充分利用多核 CPU（需要 instances > 1 才有效）
      exec_mode: "fork",
      instances: 1, // fork 模式固定为 1；cluster 模式可改为 2 或 "max"

      // ── 环境变量（默认 development）────────────────────────────
      env: {
        NODE_ENV: "development",
        PORT: 3000,
      },

      // ── 环境变量（production）──────────────────────────────────
      env_production: {
        NODE_ENV: "production",
        PORT: 3000,
        // 敏感变量建议通过服务器 .env 文件注入，不要写在此处
      },

      // ── 自动重启策略 ──────────────────────────────────────────
      watch: false,                 // 生产环境关闭文件监听（避免频繁重启）
      max_memory_restart: "512M",   // 内存超出时自动重启
      restart_delay: 3000,          // 异常退出后等待 3 秒再重启（ms）
      max_restarts: 10,             // 最大连续重启次数，超出后停止重试
      min_uptime: "10s",            // 进程须存活 10s 才算启动成功

      // ── 日志配置 ──────────────────────────────────────────────
      output: "./logs/pm2-out.log",    // 标准输出日志
      error: "./logs/pm2-error.log",   // 错误日志
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,                // cluster 模式下合并所有实例日志

      // ── 优雅关闭 ──────────────────────────────────────────────
      kill_timeout: 5000,           // 强制杀死前等待 5 秒（等现有请求处理完）
      listen_timeout: 10000,        // 等待进程监听端口的超时时间（ms）
      shutdown_with_message: true,  // 向进程发送 shutdown 消息（Next.js 支持）
    },
  ],
};