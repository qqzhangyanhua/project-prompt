---
type: "manual"
---

# PromptHub 项目开发规则

## 项目概述

PromptHub 是一个基于 Next.js 13 + TypeScript + Supabase + Tailwind CSS 的 AI 提示词分享平台。

## 技术栈规范

### 核心技术
- **框架**: Next.js 13+ (App Router)
- **语言**: TypeScript (严格模式)
- **数据库**: Supabase
- **样式**: Tailwind CSS + shadcn/ui
- **状态管理**: React Hooks + Zustand
- **包管理**: pnpm

## 代码规范

### 1. TypeScript 规范

#### 严格类型安全
- **禁止使用 `any` 类型**，所有类型都必须明确定义
- 使用 `interface` 定义对象类型，使用 `type` 定义联合类型
- 所有函数参数和返回值都必须有明确的类型注解
- 使用泛型提高代码复用性

```typescript
// ✅ 正确示例
interface User {
  id: string;
  name: string;
  email: string;
}

type Status = 'pending' | 'approved' | 'rejected';

function getUser(id: string): Promise<User | null> {
  // 实现
}

// ❌ 错误示例
function getUser(id: any): any {
  // 禁止使用 any
}
```

#### 类型定义位置
- 全局类型定义放在 `types/` 目录
- 组件相关类型定义在组件文件内部
- API 相关类型定义在 `lib/` 目录对应文件中

### 2. 组件开发规范

#### 组件拆分原则
- **单个组件不超过 400 行代码**
- 复杂组件必须拆分为多个子组件
- 每个组件只负责一个功能
- 优先使用函数组件和 Hooks

#### 组件命名规范
- 组件文件使用 PascalCase：`PromptCard.tsx`
- 组件内部函数使用 camelCase：`handleSubmit`
- 常量使用 UPPER_SNAKE_CASE：`MAX_PROMPT_LENGTH`

#### 组件结构模板
```typescript
"use client";

import React from "react";
import { ComponentProps } from "./types";

interface Props {
  // 明确定义 props 类型
}

export function ComponentName({ prop1, prop2 }: Props) {
  // 1. Hooks
  // 2. 状态定义
  // 3. 事件处理函数
  // 4. 副作用
  // 5. 渲染逻辑
  
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

### 3. 样式规范

#### Tailwind CSS 优先
- **优先使用 Tailwind CSS 类名**
- 避免编写自定义 CSS，除非 Tailwind 无法满足需求
- 使用 `cn()` 工具函数合并类名
- 响应式设计使用 Tailwind 的响应式前缀

```typescript
// ✅ 正确示例
<div className={cn(
  "flex items-center justify-between p-4",
  "bg-white dark:bg-gray-800",
  "border border-gray-200 dark:border-gray-700",
  isActive && "bg-blue-50 border-blue-200"
)}>

// ❌ 错误示例
<div className="custom-card-style">
```

#### shadcn/ui 组件使用
- 优先使用 shadcn/ui 提供的组件
- 需要自定义样式时，通过 `className` 属性覆盖
- 保持设计系统的一致性

### 4. 文件组织规范

#### 目录结构
```
app/                    # Next.js App Router 页面
├── (auth)/            # 路由组
├── api/               # API 路由
├── globals.css        # 全局样式
└── layout.tsx         # 根布局

components/            # 可复用组件
├── ui/               # shadcn/ui 组件
└── [ComponentName].tsx

hooks/                # 自定义 Hooks
lib/                  # 工具函数和配置
├── auth.ts           # 认证相关
├── supabase.ts       # 数据库配置
├── utils.ts          # 通用工具函数
└── prompts.ts        # 业务逻辑

stores/               # 状态管理
types/                # 全局类型定义
supabase/             # 数据库迁移和配置
```

#### 文件命名规范
- 组件文件：`PascalCase.tsx`
- 工具文件：`camelCase.ts`
- 页面文件：`page.tsx`、`layout.tsx`
- 类型文件：`camelCase.types.ts`

### 5. 数据处理规范

#### Supabase 使用规范
- 所有数据库操作都要有错误处理
- 使用 TypeScript 类型定义数据库表结构
- 敏感操作需要用户认证检查
- 使用 RLS (Row Level Security) 保护数据

```typescript
// ✅ 正确示例
async function getPrompts(): Promise<Prompt[] | null> {
  try {
    const { data, error } = await supabase
      .from('prompts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('获取提示词失败:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('网络错误:', error);
    return null;
  }
}
```

#### 状态管理
- 简单状态使用 `useState`
- 复杂状态使用 Zustand
- 服务器状态考虑使用 SWR 或 React Query

### 6. 性能优化规范

#### 组件优化
- 使用 `React.memo` 包装纯组件
- 使用 `useMemo` 和 `useCallback` 优化计算和函数
- 避免在渲染函数中创建对象和函数

#### 图片优化
- 使用 Next.js `Image` 组件
- 提供合适的 `alt` 属性
- 使用适当的图片格式和尺寸

#### 代码分割
- 使用动态导入 `lazy loading`
- 路由级别的代码分割
- 第三方库按需导入

### 7. 错误处理规范

#### 错误边界
- 关键组件使用 Error Boundary
- 提供友好的错误提示
- 记录错误日志用于调试

#### 用户反馈
- 使用 `sonner` 提供 toast 提示
- 加载状态使用 loading 组件
- 表单验证提供即时反馈

### 8. 安全规范

#### 认证和授权
- 所有敏感操作都要验证用户身份
- 使用 Supabase Auth 进行用户管理
- 实施适当的权限控制

#### 数据验证
- 前端和后端都要进行数据验证
- 使用 zod 或类似库进行类型验证
- 防止 XSS 和 CSRF 攻击

### 9. 测试规范

#### 单元测试
- 关键业务逻辑必须有单元测试
- 使用 Jest + React Testing Library
- 测试覆盖率不低于 80%

#### 集成测试
- API 接口需要集成测试
- 关键用户流程需要 E2E 测试

### 10. 代码提交规范

#### Commit Message 格式
```
type(scope): description

feat: 新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式调整
refactor: 代码重构
test: 测试相关
chore: 构建工具或辅助工具的变动
```

#### 代码审查
- 所有代码都要经过 Code Review
- 确保符合项目规范
- 检查类型安全和性能问题

## 开发工具配置

### ESLint 配置
- 启用 TypeScript 严格模式
- 使用 Next.js 推荐配置
- 自定义规则确保代码质量

### Prettier 配置
- 统一代码格式
- 与 ESLint 集成
- 保存时自动格式化

### VS Code 推荐插件
- TypeScript Importer
- Tailwind CSS IntelliSense
- ES7+ React/Redux/React-Native snippets
- Prettier - Code formatter
- ESLint

## 部署规范

### 环境配置
- 开发环境：`development`
- 预发布环境：`staging`
- 生产环境：`production`

### 环境变量
- 使用 `.env.local` 存储本地环境变量
- 生产环境变量通过部署平台配置
- 敏感信息不得提交到代码库

### 构建优化
- 启用 Next.js 生产优化
- 配置适当的缓存策略
- 监控构建大小和性能

---

**注意**: 本规范是活文档，会根据项目发展和技术更新持续完善。所有团队成员都应该遵循这些规范，确保代码质量和项目的可维护性。