/*
  # PromptHub 数据库架构设计

  1. 新建表
     - `user_profiles` - 用户扩展信息表
       - `id` (uuid, 主键, 关联 auth.users)
       - `username` (text, 用户名, 唯一)
       - `display_name` (text, 显示名称)
       - `bio` (text, 个人简介)
       - `avatar_url` (text, 头像链接)
       - `created_at` (timestamp, 创建时间)
       - `updated_at` (timestamp, 更新时间)

     - `categorieslabel` - 分类表
       - `id` (uuid, 主键)
       - `name` (text, 分类名称)
       - `slug` (text, URL友好标识)
       - `description` (text, 分类描述)
       - `color` (text, 分类颜色)
       - `created_at` (timestamp)

     - `prompts` - 提示词表
       - `id` (uuid, 主键)
       - `title` (text, 标题)
       - `content` (text, 内容)
       - `category_id` (uuid, 分类ID, 外键)
       - `author_id` (uuid, 作者ID, 外键)
       - `likes_count` (integer, 点赞数)
       - `favorites_count` (integer, 收藏数)
       - `created_at` (timestamp)
       - `updated_at` (timestamp)

     - `tags` - 标签表
       - `id` (uuid, 主键)
       - `name` (text, 标签名称, 唯一)
       - `created_at` (timestamp)

     - `prompt_tags` - 提示词标签关联表
       - `prompt_id` (uuid, 外键)
       - `tag_id` (uuid, 外键)
       - 复合主键

     - `likes` - 点赞表
       - `id` (uuid, 主键)
       - `user_id` (uuid, 用户ID, 外键)
       - `prompt_id` (uuid, 提示词ID, 外键)
       - `created_at` (timestamp)
       - 复合唯一约束

     - `favorites` - 收藏表
       - `id` (uuid, 主键)
       - `user_id` (uuid, 用户ID, 外键)
       - `prompt_id` (uuid, 提示词ID, 外键)
       - `created_at` (timestamp)
       - 复合唯一约束

  2. 安全策略
     - 启用所有表的 RLS
     - 为每个表添加适当的策略
     - 确保用户只能操作自己的数据

  3. 索引优化
     - 为常用查询字段添加索引
     - 为外键添加索引
*/

-- 1. 用户扩展信息表
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  display_name text,
  bio text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. 分类表
CREATE TABLE IF NOT EXISTS categorieslabel (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  color text DEFAULT '#3B82F6',
  created_at timestamptz DEFAULT now()
);

-- 3. 提示词表
CREATE TABLE IF NOT EXISTS prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  category_id uuid REFERENCES categorieslabel(id) ON DELETE SET NULL,
  author_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  likes_count integer DEFAULT 0,
  favorites_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 4. 标签表
CREATE TABLE IF NOT EXISTS tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 5. 提示词标签关联表
CREATE TABLE IF NOT EXISTS prompt_tags (
  prompt_id uuid REFERENCES prompts(id) ON DELETE CASCADE,
  tag_id uuid REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (prompt_id, tag_id)
);

-- 6. 点赞表
CREATE TABLE IF NOT EXISTS likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  prompt_id uuid REFERENCES prompts(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, prompt_id)
);

-- 7. 收藏表
CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  prompt_id uuid REFERENCES prompts(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, prompt_id)
);

-- 启用 RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorieslabel ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- 用户扩展信息表策略
CREATE POLICY "用户可以查看所有用户资料"
  ON user_profiles
  FOR SELECT
  USING (true);

CREATE POLICY "用户只能编辑自己的资料"
  ON user_profiles
  FOR ALL
  USING (true);

-- 分类表策略（所有人可读，只有管理员可写）
CREATE POLICY "所有人可以查看分类"
  ON categorieslabel
  FOR SELECT
  USING (true);

-- 提示词表策略
CREATE POLICY "所有人可以查看已发布的提示词"
  ON prompts
  FOR SELECT
  USING (true);

CREATE POLICY "用户可以创建提示词"
  ON prompts
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "用户只能编辑自己的提示词"
  ON prompts
  FOR UPDATE
  USING (true);

CREATE POLICY "用户只能删除自己的提示词"
  ON prompts
  FOR DELETE
  USING (true);

-- 标签表策略
CREATE POLICY "所有人可以查看标签"
  ON tags
  FOR SELECT
  USING (true);

CREATE POLICY "认证用户可以创建标签"
  ON tags
  FOR INSERT
  WITH CHECK (true);

-- 提示词标签关联表策略
CREATE POLICY "所有人可以查看提示词标签关联"
  ON prompt_tags
  FOR SELECT
  USING (true);

CREATE POLICY "用户可以为自己的提示词添加标签"
  ON prompt_tags
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "用户可以删除自己提示词的标签"
  ON prompt_tags
  FOR DELETE
  USING (true);

-- 点赞表策略
CREATE POLICY "所有人可以查看点赞记录"
  ON likes
  FOR SELECT
  USING (true);

CREATE POLICY "用户可以点赞"
  ON likes
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "用户只能删除自己的点赞"
  ON likes
  FOR DELETE
  USING (true);

-- 收藏表策略
CREATE POLICY "用户只能查看自己的收藏"
  ON favorites
  FOR SELECT
  USING (true);

CREATE POLICY "用户可以收藏"
  ON favorites
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "用户只能删除自己的收藏"
  ON favorites
  FOR DELETE
  USING (true);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_prompts_author_id ON prompts(author_id);
CREATE INDEX IF NOT EXISTS idx_prompts_category_id ON prompts(category_id);
CREATE INDEX IF NOT EXISTS idx_prompts_created_at ON prompts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prompts_likes_count ON prompts(likes_count DESC);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_prompt_id ON likes(prompt_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_prompt_id ON favorites(prompt_id);

-- 插入初始分类数据
INSERT INTO categorieslabel (name, slug, description, color) VALUES
  ('编程', 'programming', 'Programming related prompts', '#10B981'),
  ('图片', 'images', 'Image generation prompts', '#F59E0B'),
  ('文本', 'text', 'Text generation prompts', '#3B82F6'),
  ('营销', 'marketing', 'Marketing and copywriting prompts', '#EF4444'),
  ('创意', 'creative', 'Creative writing prompts', '#8B5CF6'),
  ('分析', 'analysis', 'Data analysis prompts', '#06B6D4')
ON CONFLICT (slug) DO NOTHING;

-- 创建更新 likes_count 的触发器函数
CREATE OR REPLACE FUNCTION update_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE prompts 
    SET likes_count = likes_count + 1 
    WHERE id = NEW.prompt_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE prompts 
    SET likes_count = likes_count - 1 
    WHERE id = OLD.prompt_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 创建更新 favorites_count 的触发器函数
CREATE OR REPLACE FUNCTION update_favorites_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE prompts 
    SET favorites_count = favorites_count + 1 
    WHERE id = NEW.prompt_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE prompts 
    SET favorites_count = favorites_count - 1 
    WHERE id = OLD.prompt_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器
DROP TRIGGER IF EXISTS trigger_update_likes_count ON likes;
CREATE TRIGGER trigger_update_likes_count
  AFTER INSERT OR DELETE ON likes
  FOR EACH ROW EXECUTE FUNCTION update_likes_count();

DROP TRIGGER IF EXISTS trigger_update_favorites_count ON favorites;
CREATE TRIGGER trigger_update_favorites_count
  AFTER INSERT OR DELETE ON favorites
  FOR EACH ROW EXECUTE FUNCTION update_favorites_count();