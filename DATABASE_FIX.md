# 数据库外键关系修复指南

## 问题描述
API 查询 `prompts?select=*,user_profiles(...)` 失败，错误信息：
```
Could not find a relationship between 'prompts' and 'user_profiles' in the schema cache
```

## 问题原因
原始数据库架构中，`prompts.author_id` 引用的是 `auth.users(id)`，但 API 查询尝试关联的是 `user_profiles` 表。

## 解决方案

### 方法 1：通过 Supabase 控制台修复（推荐）

1. 访问 Supabase 控制台：https://supabase.com/dashboard/project/gsrqdvzwaqycpmxvitai

2. 进入 "SQL Editor" 页面

3. 执行以下 SQL 语句来修复外键关系：

```sql
-- 删除现有的外键约束
ALTER TABLE prompts DROP CONSTRAINT IF EXISTS prompts_author_id_fkey;
ALTER TABLE likes DROP CONSTRAINT IF EXISTS likes_user_id_fkey;
ALTER TABLE favorites DROP CONSTRAINT IF EXISTS favorites_user_id_fkey;

-- 添加新的外键约束
ALTER TABLE prompts ADD CONSTRAINT prompts_author_id_fkey 
  FOREIGN KEY (author_id) REFERENCES user_profiles(id) ON DELETE CASCADE;

ALTER TABLE likes ADD CONSTRAINT likes_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;

ALTER TABLE favorites ADD CONSTRAINT favorites_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;
```

### 方法 2：使用迁移文件

如果你有 Supabase CLI，可以运行：
```bash
supabase db push
```

## 验证修复

修复后，以下 API 查询应该能正常工作：
```
https://gsrqdvzwaqycpmxvitai.supabase.co/rest/v1/prompts?select=*,user_profiles(id,username,display_name,avatar_url)&order=created_at.desc&limit=50
```

## 注意事项

1. 确保在执行 SQL 之前，`user_profiles` 表中已经有对应的用户数据
2. 如果 `prompts` 表中有 `author_id` 不存在于 `user_profiles` 表中的记录，需要先清理这些数据
3. 执行前建议备份数据库

## 相关文件

- 原始迁移文件：`supabase/migrations/20250805092127_rapid_prism.sql`
- 修复迁移文件：`supabase/migrations/20250805093000_fix_foreign_keys.sql`