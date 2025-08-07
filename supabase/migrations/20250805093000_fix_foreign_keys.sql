-- 修复外键关系：将 prompts.author_id 从引用 auth.users 改为引用 user_profiles
-- 修复外键关系：将 likes.user_id 和 favorites.user_id 从引用 auth.users 改为引用 user_profiles

-- 1. 删除现有的外键约束
ALTER TABLE prompts DROP CONSTRAINT IF EXISTS prompts_author_id_fkey;
ALTER TABLE likes DROP CONSTRAINT IF EXISTS likes_user_id_fkey;
ALTER TABLE favorites DROP CONSTRAINT IF EXISTS favorites_user_id_fkey;

-- 2. 添加新的外键约束
ALTER TABLE prompts ADD CONSTRAINT prompts_author_id_fkey 
  FOREIGN KEY (author_id) REFERENCES user_profiles(id) ON DELETE CASCADE;

ALTER TABLE likes ADD CONSTRAINT likes_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;

ALTER TABLE favorites ADD CONSTRAINT favorites_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;

-- 3. 更新 RLS 策略以确保正确的权限检查
DROP POLICY IF EXISTS "用户可以创建提示词" ON prompts;
CREATE POLICY "用户可以创建提示词"
  ON prompts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "用户只能编辑自己的提示词" ON prompts;
CREATE POLICY "用户只能编辑自己的提示词"
  ON prompts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "用户只能删除自己的提示词" ON prompts;
CREATE POLICY "用户只能删除自己的提示词"
  ON prompts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id);

-- 4. 添加缺失的策略
DROP POLICY IF EXISTS "用户可以删除自己提示词的标签" ON prompt_tags;
CREATE POLICY "用户可以删除自己提示词的标签"
  ON prompt_tags
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM prompts 
      WHERE id = prompt_id AND author_id = auth.uid()
    )
  );