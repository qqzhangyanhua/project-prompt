-- Minimal bootstrap data for direct PostgreSQL mode.
-- Test account:
--   email: demo@prompthub.local
--   password: Test@123456

INSERT INTO categorieslabel (name, slug, description, color)
VALUES
  ('General', 'general', 'General purpose prompts', '#3B82F6'),
  ('Programming', 'programming', 'Programming prompts', '#10B981')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO user_profiles (
  id,
  username,
  display_name,
  email,
  password_hash
)
SELECT
  '11111111-1111-1111-1111-111111111111'::uuid,
  'demo_user',
  'Demo User',
  'demo@prompthub.local',
  'dc2599dd5faadd6fbe88558d0ca820ed:d5ef6ffaea0e8d14f649d0373728d6fd617fcfc83cb38cbcca8851d86f71ebd563e7911b28b001d68874975af5e4ac3bf122f4122c7088e29cc9c36dc9a1af17'
WHERE NOT EXISTS (
  SELECT 1 FROM user_profiles WHERE lower(email) = lower('demo@prompthub.local')
);

INSERT INTO prompts (title, content, category_id, author_id)
SELECT
  'Welcome to PromptHub',
  'You can now run PromptHub with direct PostgreSQL access.',
  c.id,
  '11111111-1111-1111-1111-111111111111'::uuid
FROM categorieslabel c
WHERE c.slug = 'general'
  AND NOT EXISTS (
    SELECT 1 FROM prompts WHERE author_id = '11111111-1111-1111-1111-111111111111'::uuid
  );
