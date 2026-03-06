# PromptHub - AI 提示词分享平台

PromptHub 是一个面向 AI 爱好者、内容创作者和开发者的提示词发现与分享平台。

## 功能特性

### 🎯 核心功能
- **智能浏览** - 卡片流布局，支持最新/热门排序
- **精准筛选** - 多分类筛选和关键词搜索
- **互动体验** - 点赞、收藏、一键复制
- **内容发布** - 简洁的发布流程，支持标签管理
- **用户中心** - 个人主页展示发布和收藏内容

### 🎨 设计特色
- 极致简洁的用户界面
- 响应式设计，完美适配各种设备
- 流畅的交互动画和微交互
- 现代化的视觉设计语言

### 🔧 技术栈
- **前端**: Next.js 13 + React + TypeScript
- **样式**: Tailwind CSS + shadcn/ui
- **后端**: 直连 PostgreSQL + Next.js Route Handlers
- **部署**: 支持 Vercel、Netlify 等平台

## 快速开始

### 环境要求
- Node.js 18+
- PostgreSQL 15+

### 安装步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd prompthub
```

2. **安装依赖**
```bash
pnpm install
```

3. **配置环境变量**
```bash
cp .env.example .env.local
```

编辑 `.env.local` 文件，填入 PostgreSQL 连接串：
```env
DATABASE_URL=postgresql://username:password@localhost:5432/prompthub
```

4. **数据库设置**
- 推荐使用内置脚本执行迁移与 seed：
```bash
pnpm run db:migrate
pnpm run db:seed
```

也可手动执行 SQL 文件（顺序同上）。

测试账号（seed 数据）：
- email: `demo@prompthub.local`
- password: `Test@123456`

5. **启动开发服务器**
```bash
pnpm run dev
```

访问 `http://localhost:3000` 即可看到应用。

数据库健康检查：
```bash
curl http://localhost:3000/api/health/db
```

## 项目结构

```
prompthub/
├── app/                    # Next.js 13 App Router
│   ├── auth/              # 认证页面
│   ├── profile/           # 用户主页
│   ├── prompt/[id]/       # 提示词详情页
│   ├── publish/           # 发布页面
│   └── page.tsx           # 首页
├── components/            # 可复用组件
│   ├── ui/               # shadcn/ui 组件
│   ├── Header.tsx        # 导航头部
│   ├── Layout.tsx        # 布局组件
│   ├── PromptCard.tsx    # 提示词卡片
│   └── ...
├── lib/                  # 工具函数和配置
│   ├── server/           # PostgreSQL 服务端查询与会话逻辑
│   ├── auth.ts           # 认证相关
│   └── prompts.ts        # 提示词相关API
├── hooks/                # 自定义 React Hooks
└── supabase/             # 数据库迁移文件
    └── migrations/
```

## 数据库设计

### 核心表结构

- **user_profiles** - 用户扩展信息
- **categories** - 提示词分类
- **prompts** - 提示词内容
- **tags** - 标签管理
- **prompt_tags** - 提示词标签关联
- **likes** - 点赞记录
- **favorites** - 收藏记录

### 安全策略
- 启用行级安全 (RLS)
- 用户只能编辑自己的内容
- 合理的权限控制和数据隔离

## 开发指南

### 组件开发原则
- 使用 TypeScript 确保类型安全
- 组件职责单一，便于复用
- 遵循 React 最佳实践

### 状态管理
- 使用 React Hooks 进行状态管理
- 自定义 useAuth Hook 管理用户状态
- Zustand 用于复杂的全局状态（可选）

### API 设计
- 统一的错误处理机制
- 类型安全的 API 调用
- 合理的数据缓存策略

## 部署

### Vercel 部署
```bash
pnpm run build
vercel --prod
```

### 环境变量配置
确保在部署平台配置以下环境变量：
- `DATABASE_URL`

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 联系我们

如有问题或建议，欢迎提交 Issue 或 Pull Request。

---

⭐ 如果这个项目对你有帮助，请给我们一个 Star！
