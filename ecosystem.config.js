// ecosystem.config.js
module.exports = {
  apps: [{
    name: "ai-prompt-platform",
    script: "yarn",
    args: "start",
    cwd: "/opt/ai-prompt/ai-prompt-platform", // 明确指定工作目录
    env: {
      PORT: 8085,
      NODE_ENV: "production"
    }
  }]
};
// pm2 delete ai-prom  # 删除原有错误实例
// pm2 start ecosystem.config.js
// pm2 save