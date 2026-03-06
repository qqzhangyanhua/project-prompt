# PostgreSQL 外键与会话表修复指南

## 适用场景

本项目已切换为直连 PostgreSQL。如果你遇到以下问题，可按本文修复：

- 登录后无法读取用户信息
- 提示词作者关联失败
- 点赞/收藏写入报外键错误

## 常见错误

### 1) user_profiles 仍引用 auth.users

报错示例：

```text
insert or update on table "user_profiles" violates foreign key constraint
```

### 2) likes/favorites 与 user_profiles 关联不一致

报错示例：

```text
insert or update on table "likes" violates foreign key constraint
```

## 一键修复顺序

确保设置了 `DATABASE_URL` 后，按顺序执行：

```bash
psql "$DATABASE_URL" -f supabase/migrations/20250805092127_rapid_prism.sql
psql "$DATABASE_URL" -f supabase/migrations/20250805093000_fix_foreign_keys.sql
psql "$DATABASE_URL" -f supabase/migrations/20260306211000_direct_postgres_auth.sql
psql "$DATABASE_URL" -f supabase/migrations/20260306224000_seed_minimal_data.sql
```

## 验证

### 1) 验证会话与用户结构

```sql
\d+ user_profiles
\d+ user_sessions
```

应包含：

- `user_profiles.email`
- `user_profiles.password_hash`
- `user_sessions.token_hash/user_id/expires_at`

### 2) 验证业务查询

```sql
SELECT p.id, p.title, up.username
FROM prompts p
LEFT JOIN user_profiles up ON up.id = p.author_id
ORDER BY p.created_at DESC
LIMIT 10;
```

### 3) 验证应用接口

```bash
curl http://localhost:3000/api/health/db
```

返回 `status: ok` 即通过。

## 注意事项

1. 执行迁移前先备份数据库。
2. 生产环境请使用强密码并替换 seed 账号。
3. 如果历史数据中存在脏外键，先清理再执行迁移。

## 相关文件

- `supabase/migrations/20250805092127_rapid_prism.sql`
- `supabase/migrations/20250805093000_fix_foreign_keys.sql`
- `supabase/migrations/20260306211000_direct_postgres_auth.sql`
- `supabase/migrations/20260306224000_seed_minimal_data.sql`
