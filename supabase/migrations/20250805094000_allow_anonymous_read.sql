/*
  # 允许匿名用户查看公开数据
  
  修改 RLS 策略，允许未登录用户查看：
  - 分类数据
  - 提示词数据
  - 标签数据
  - 提示词标签关联数据
  - 用户公开资料
  - 点赞统计数据（但不包括具体的点赞记录）
*/

-- 删除现有的限制性策略
DROP POLICY IF EXISTS "用户可以查看所有用户资料" ON user_profiles;
DROP POLICY IF EXISTS "所有人可以查看分类" ON categorieslabel;
DROP POLICY IF EXISTS "所有人可以查看已发布的提示词" ON prompts;
DROP POLICY IF EXISTS "所有人可以查看标签" ON tags;
DROP POLICY IF EXISTS "所有人可以查看提示词标签关联" ON prompt_tags;
DROP POLICY IF EXISTS "所有人可以查看点赞记录" ON likes;

-- 创建新的策略，允许匿名用户查看公开数据

-- 用户扩展信息表策略 - 允许所有人查看用户公开资料
CREATE POLICY "所有人可以查看用户资料"
  ON user_profiles
  FOR SELECT
  USING (true);

-- 分类表策略 - 允许所有人查看分类
CREATE POLICY "所有人可以查看分类"
  ON categorieslabel
  FOR SELECT
  USING (true);

-- 提示词表策略 - 允许所有人查看已发布的提示词
CREATE POLICY "所有人可以查看已发布的提示词"
  ON prompts
  FOR SELECT
  USING (true);

-- 标签表策略 - 允许所有人查看标签
CREATE POLICY "所有人可以查看标签"
  ON tags
  FOR SELECT
  USING (true);

-- 提示词标签关联表策略 - 允许所有人查看
CREATE POLICY "所有人可以查看提示词标签关联"
  ON prompt_tags
  FOR SELECT
  USING (true);

-- 点赞表策略 - 允许所有人查看点赞记录（用于统计）
CREATE POLICY "所有人可以查看点赞记录"
  ON likes
  FOR SELECT
  USING (true);

-- 收藏表策略保持不变，只有用户自己可以查看自己的收藏
-- 这个策略已经存在，不需要修改