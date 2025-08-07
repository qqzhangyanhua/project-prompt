-- Mock数据插入脚本
-- 为PromptHub数据库生成测试数据

-- 1. 插入测试用户数据 (使用统一的UUID)
INSERT INTO user_profiles (id, username, display_name, bio, avatar_url) VALUES
  ('72280a5f-44d8-41d1-b162-f8799535b9eb', 'zhangwei', '张伟', '资深AI工程师，专注于大语言模型应用开发', 'https://randomuser.me/api/portraits/men/1.jpg')
ON CONFLICT (id) DO NOTHING;

-- 2. 插入更多分类数据 (补充已有的分类)
INSERT INTO categorieslabel (name, slug, description, color) VALUES
  ('学习', 'education', '教育和学习相关提示词', '#EC4899'),
  ('商业', 'business', '商业和企业管理提示词', '#14B8A6'),
  ('生活', 'lifestyle', '日常生活和个人发展提示词', '#F97316'),
  ('健康', 'health', '健康和医疗相关提示词', '#22C55E'),
  ('娱乐', 'entertainment', '娱乐和休闲相关提示词', '#6366F1')
ON CONFLICT (slug) DO NOTHING;

-- 3. 插入标签数据
INSERT INTO tags (id, name) VALUES
  ('11111111-1111-1111-1111-111111111111', 'ChatGPT'),
  ('22222222-2222-2222-2222-222222222222', 'Midjourney'),
  ('33333333-3333-3333-3333-333333333333', '效率'),
  ('44444444-4444-4444-4444-444444444444', '创意写作'),
  ('55555555-5555-5555-5555-555555555555', '数据分析'),
  ('66666666-6666-6666-6666-666666666666', '学习辅助'),
  ('77777777-7777-7777-7777-777777777777', '代码生成'),
  ('88888888-8888-8888-8888-888888888888', '内容营销'),
  ('99999999-9999-9999-9999-999999999999', '头脑风暴'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '翻译'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '简历优化'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '产品设计'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '故事创作'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '图像生成'),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', '问题解决')
ON CONFLICT (name) DO NOTHING;

-- 4. 插入提示词数据
INSERT INTO prompts (id, title, content, category_id, author_id, created_at, updated_at) VALUES
  (
    '579a5af2-af22-4826-ada9-d614899f01f3', 
    'Python代码优化助手', 
    '我希望你作为一位Python代码优化专家。我会给你一段Python代码，请帮我优化它的性能和可读性，同时保持功能不变。请解释你做的每一处修改及其原因。以下是需要优化的代码：\n\n```python\n{code}\n```', 
    (SELECT id FROM categorieslabel WHERE slug = 'programming'), 
    '72280a5f-44d8-41d1-b162-f8799535b9eb',
    '2025-07-01 10:00:00',
    '2025-07-01 10:00:00'
  ),
  (
    'b8e7a3d1-c6f5-4e92-8b21-a7c9e5d8f3b2', 
    '创意故事生成器', 
    '请根据以下元素创作一个短篇故事：\n- 主角：{character}\n- 场景：{setting}\n- 主题：{theme}\n- 风格：{style}\n\n故事应该包含起承转合，长度在800字左右。', 
    (SELECT id FROM categorieslabel WHERE slug = 'creative'), 
    '72280a5f-44d8-41d1-b162-f8799535b9eb',
    '2025-07-05 14:30:00',
    '2025-07-06 09:15:00'
  ),
  (
    'c4d2e1f0-9a8b-7c6d-5e4f-3a2b1c0d9e8f', 
    'Midjourney图像提示词生成器', 
    '请帮我为Midjourney生成一个详细的提示词，用于创建以下场景的图像：\n\n{scene_description}\n\n提示词应包含：\n1. 详细的视觉描述\n2. 艺术风格\n3. 光照效果\n4. 构图建议\n5. 相机视角\n6. 适当的技术参数（如--ar 16:9, --v 5等）', 
    (SELECT id FROM categorieslabel WHERE slug = 'images'), 
    '72280a5f-44d8-41d1-b162-f8799535b9eb',
    '2025-07-10 16:45:00',
    '2025-07-10 16:45:00'
  ),
  (
    'd1e2f3a4-b5c6-7d8e-9f0a-1b2c3d4e5f6a', 
    '营销文案优化', 
    '请帮我优化以下营销文案，使其更具吸引力和说服力：\n\n{original_copy}\n\n请提供三个不同版本，每个版本针对不同的目标受众：\n1. 年轻人（18-25岁）\n2. 专业人士（26-40岁）\n3. 成熟消费者（41岁以上）', 
    (SELECT id FROM categorieslabel WHERE slug = 'marketing'), 
    '72280a5f-44d8-41d1-b162-f8799535b9eb',
    '2025-07-15 11:20:00',
    '2025-07-16 13:40:00'
  ),
  (
    'e5f6a7b8-c9d0-1e2f-3a4b-5c6d7e8f9a0b', 
    '数据分析报告生成器', 
    '请根据以下数据集生成一份详细的分析报告：\n\n{data_description}\n\n报告应包含：\n1. 数据概览\n2. 关键趋势分析\n3. 异常值识别\n4. 相关性分析\n5. 可视化建议\n6. 业务洞察和建议', 
    (SELECT id FROM categorieslabel WHERE slug = 'analysis'), 
    '72280a5f-44d8-41d1-b162-f8799535b9eb',
    '2025-07-20 09:30:00',
    '2025-07-20 15:10:00'
  ),
  (
    'f9e8d7c6-b5a4-3210-f9e8-d7c6b5a43210', 
    '学习计划制定助手', 
    '请帮我制定一个为期{duration}的{subject}学习计划。我的目标是{learning_goal}，每周可以投入约{hours_per_week}小时学习。\n\n请包含：\n1. 阶段性学习目标\n2. 每周详细学习内容\n3. 推荐的学习资源\n4. 进度检查点和自测方法\n5. 应对学习瓶颈的策略', 
    (SELECT id FROM categorieslabel WHERE slug = 'education'), 
    '72280a5f-44d8-41d1-b162-f8799535b9eb',
    '2025-07-25 14:00:00',
    '2025-07-26 10:30:00'
  ),
  (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 
    '健康饮食计划生成器', 
    '请根据以下信息为我制定一周的健康饮食计划：\n- 性别：{gender}\n- 年龄：{age}\n- 身高：{height}\n- 体重：{weight}\n- 活动水平：{activity_level}\n- 饮食偏好：{dietary_preferences}\n- 健康目标：{health_goal}\n\n请提供每日三餐和两次零食的详细食谱，包括大致的卡路里计算和营养成分分析。', 
    (SELECT id FROM categorieslabel WHERE slug = 'health'), 
    '72280a5f-44d8-41d1-b162-f8799535b9eb',
    '2025-07-30 08:15:00',
    '2025-07-30 08:15:00'
  ),
  (
    'b2c3d4e5-f6a7-8901-bcde-f23456789012', 
    '商业计划书框架', 
    '请帮我创建一个详细的商业计划书框架，用于{business_type}创业项目。计划书应包含以下部分：\n1. 执行摘要\n2. 公司描述\n3. 市场分析\n4. 组织和管理结构\n5. 产品或服务线\n6. 营销和销售策略\n7. 财务预测\n8. 融资需求\n\n请为每个部分提供详细的子项目和需要回答的关键问题。', 
    (SELECT id FROM categorieslabel WHERE slug = 'business'), 
    '72280a5f-44d8-41d1-b162-f8799535b9eb',
    '2025-08-01 16:20:00',
    '2025-08-02 11:45:00'
  ),
  (
    'c3d4e5f6-a7b8-9012-cdef-345678901234', 
    '旅行计划助手', 
    '请帮我规划一次为期{days}天的{destination}之旅。我的预算约为{budget}，旅行风格是{travel_style}。\n\n请提供：\n1. 每日行程安排\n2. 推荐住宿选择\n3. 必访景点和体验\n4. 当地美食推荐\n5. 交通建议\n6. 预算分配\n7. 实用旅行贴士', 
    (SELECT id FROM categorieslabel WHERE slug = 'lifestyle'), 
    '72280a5f-44d8-41d1-b162-f8799535b9eb',
    '2025-08-05 09:10:00',
    '2025-08-05 09:10:00'
  ),
  (
    'd4e5f6a7-b8c9-0123-def0-456789012345', 
    '电影剧本对话生成器', 
    '请为以下场景创作一段电影对话：\n\n场景：{scene_description}\n角色A：{character_a_description}\n角色B：{character_b_description}\n情感基调：{emotional_tone}\n对话目的：{dialogue_purpose}\n\n请创作约10-15轮的对话，展现角色性格和情感发展，并推动剧情前进。', 
    (SELECT id FROM categorieslabel WHERE slug = 'entertainment'), 
    '72280a5f-44d8-41d1-b162-f8799535b9eb',
    '2025-08-10 13:25:00',
    '2025-08-11 10:00:00'
  );

-- 5. 插入提示词标签关联数据
INSERT INTO prompt_tags (prompt_id, tag_id) VALUES
  ('579a5af2-af22-4826-ada9-d614899f01f3', '11111111-1111-1111-1111-111111111111'),
  ('579a5af2-af22-4826-ada9-d614899f01f3', '77777777-7777-7777-7777-777777777777'),
  ('579a5af2-af22-4826-ada9-d614899f01f3', '33333333-3333-3333-3333-333333333333'),
  ('b8e7a3d1-c6f5-4e92-8b21-a7c9e5d8f3b2', '11111111-1111-1111-1111-111111111111'),
  ('b8e7a3d1-c6f5-4e92-8b21-a7c9e5d8f3b2', '44444444-4444-4444-4444-444444444444'),
  ('b8e7a3d1-c6f5-4e92-8b21-a7c9e5d8f3b2', 'dddddddd-dddd-dddd-dddd-dddddddddddd'),
  ('c4d2e1f0-9a8b-7c6d-5e4f-3a2b1c0d9e8f', '22222222-2222-2222-2222-222222222222'),
  ('c4d2e1f0-9a8b-7c6d-5e4f-3a2b1c0d9e8f', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'),
  ('d1e2f3a4-b5c6-7d8e-9f0a-1b2c3d4e5f6a', '11111111-1111-1111-1111-111111111111'),
  ('d1e2f3a4-b5c6-7d8e-9f0a-1b2c3d4e5f6a', '88888888-8888-8888-8888-888888888888'),
  ('e5f6a7b8-c9d0-1e2f-3a4b-5c6d7e8f9a0b', '11111111-1111-1111-1111-111111111111'),
  ('e5f6a7b8-c9d0-1e2f-3a4b-5c6d7e8f9a0b', '55555555-5555-5555-5555-555555555555'),
  ('f9e8d7c6-b5a4-3210-f9e8-d7c6b5a43210', '11111111-1111-1111-1111-111111111111'),
  ('f9e8d7c6-b5a4-3210-f9e8-d7c6b5a43210', '66666666-6666-6666-6666-666666666666'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', '11111111-1111-1111-1111-111111111111'),
  ('b2c3d4e5-f6a7-8901-bcde-f23456789012', '11111111-1111-1111-1111-111111111111'),
  ('b2c3d4e5-f6a7-8901-bcde-f23456789012', '99999999-9999-9999-9999-999999999999'),
  ('c3d4e5f6-a7b8-9012-cdef-345678901234', '11111111-1111-1111-1111-111111111111'),
  ('d4e5f6a7-b8c9-0123-def0-456789012345', '11111111-1111-1111-1111-111111111111'),
  ('d4e5f6a7-b8c9-0123-def0-456789012345', '44444444-4444-4444-4444-444444444444');

-- 6. 插入点赞数据
INSERT INTO likes (user_id, prompt_id) VALUES
  ('72280a5f-44d8-41d1-b162-f8799535b9eb', 'b8e7a3d1-c6f5-4e92-8b21-a7c9e5d8f3b2'),
  ('72280a5f-44d8-41d1-b162-f8799535b9eb', 'c4d2e1f0-9a8b-7c6d-5e4f-3a2b1c0d9e8f'),
  ('72280a5f-44d8-41d1-b162-f8799535b9eb', 'e5f6a7b8-c9d0-1e2f-3a4b-5c6d7e8f9a0b'),
  ('72280a5f-44d8-41d1-b162-f8799535b9eb', '579a5af2-af22-4826-ada9-d614899f01f3'),
  ('72280a5f-44d8-41d1-b162-f8799535b9eb', 'c3d4e5f6-a7b8-9012-cdef-345678901234'),
  ('72280a5f-44d8-41d1-b162-f8799535b9eb', 'd1e2f3a4-b5c6-7d8e-9f0a-1b2c3d4e5f6a'),
  ('72280a5f-44d8-41d1-b162-f8799535b9eb', 'd4e5f6a7-b8c9-0123-def0-456789012345'),
  ('72280a5f-44d8-41d1-b162-f8799535b9eb', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),
  ('72280a5f-44d8-41d1-b162-f8799535b9eb', 'f9e8d7c6-b5a4-3210-f9e8-d7c6b5a43210'),
  ('72280a5f-44d8-41d1-b162-f8799535b9eb', 'b2c3d4e5-f6a7-8901-bcde-f23456789012');

-- 7. 插入收藏数据
INSERT INTO favorites (user_id, prompt_id) VALUES
  ('72280a5f-44d8-41d1-b162-f8799535b9eb', 'c4d2e1f0-9a8b-7c6d-5e4f-3a2b1c0d9e8f'),
  ('72280a5f-44d8-41d1-b162-f8799535b9eb', 'b2c3d4e5-f6a7-8901-bcde-f23456789012'),
  ('72280a5f-44d8-41d1-b162-f8799535b9eb', '579a5af2-af22-4826-ada9-d614899f01f3'),
  ('72280a5f-44d8-41d1-b162-f8799535b9eb', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),
  ('72280a5f-44d8-41d1-b162-f8799535b9eb', 'd1e2f3a4-b5c6-7d8e-9f0a-1b2c3d4e5f6a'),
  ('72280a5f-44d8-41d1-b162-f8799535b9eb', 'c3d4e5f6-a7b8-9012-cdef-345678901234'),
  ('72280a5f-44d8-41d1-b162-f8799535b9eb', 'e5f6a7b8-c9d0-1e2f-3a4b-5c6d7e8f9a0b'),
  ('72280a5f-44d8-41d1-b162-f8799535b9eb', 'f9e8d7c6-b5a4-3210-f9e8-d7c6b5a43210'),
  ('72280a5f-44d8-41d1-b162-f8799535b9eb', 'b8e7a3d1-c6f5-4e92-8b21-a7c9e5d8f3b2'),
  ('72280a5f-44d8-41d1-b162-f8799535b9eb', 'd4e5f6a7-b8c9-0123-def0-456789012345');
