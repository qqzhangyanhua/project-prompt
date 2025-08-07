import { supabase } from './supabase'
import type { Prompt, Category } from './supabase'

export async function getPrompts(
  sortBy: 'latest' | 'popular' = 'latest',
  categorySlug?: string,
  searchQuery?: string,
  userId?: string
): Promise<Prompt[]> {
  let query = supabase
    .from('prompts')
    .select(`
      *,
      categorieslabel (
        id, name, slug, color
      ),
      user_profiles (
        id, username, display_name, avatar_url
      )
    `)

  // 分类筛选
  if (categorySlug) {
    query = query.eq('categorieslabel.slug', categorySlug)
  }

  // 搜索筛选
  if (searchQuery) {
    query = query.or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`)
  }

  // 排序
  if (sortBy === 'popular') {
    query = query.order('likes_count', { ascending: false })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  const { data, error } = await query.limit(50)

  if (error) throw error

  // 如果用户已登录，检查点赞和收藏状态
  if (userId && data) {
    const promptIds = data.map(p => p.id)
    
    const [likesResult, favoritesResult] = await Promise.all([
      supabase
        .from('likes')
        .select('prompt_id')
        .eq('user_id', userId)
        .in('prompt_id', promptIds),
      supabase
        .from('favorites')
        .select('prompt_id')
        .eq('user_id', userId)
        .in('prompt_id', promptIds)
    ])

    const likedPromptIds = new Set(likesResult.data?.map(l => l.prompt_id) || [])
    const favoritedPromptIds = new Set(favoritesResult.data?.map(f => f.prompt_id) || [])

    return data.map(prompt => ({
      ...prompt,
      is_liked: likedPromptIds.has(prompt.id),
      is_favorited: favoritedPromptIds.has(prompt.id)
    }))
  }

  return data || []
}

export async function getPromptById(id: string, userId?: string): Promise<Prompt | null> {
  const { data, error } = await supabase
    .from('prompts')
    .select(`
      *,
      categorieslabel (
        id, name, slug, color
      ),
      user_profiles (
        id, username, display_name, avatar_url
      ),
      prompt_tags (
        tags (
          id, name
        )
      )
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  if (!data) return null

  // 处理标签数据
  const tags = data.prompt_tags?.map((pt: any) => pt.tags) || []
  
  let is_liked = false
  let is_favorited = false

  // 如果用户已登录，检查点赞和收藏状态
  if (userId) {
    const [likeResult, favoriteResult] = await Promise.all([
      supabase
        .from('likes')
        .select('id')
        .eq('user_id', userId)
        .eq('prompt_id', id)
        .single(),
      supabase
        .from('favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('prompt_id', id)
        .single()
    ])

    is_liked = !likeResult.error
    is_favorited = !favoriteResult.error
  }

  return {
    ...data,
    tags,
    is_liked,
    is_favorited
  }
}

export async function createPrompt(
  title: string,
  content: string,
  categoryId: string,
  tags: string[],
  authorId: string
): Promise<Prompt> {
  // 创建提示词
  const { data: prompt, error: promptError } = await supabase
    .from('prompts')
    .insert({
      title,
      content,
      category_id: categoryId,
      author_id: authorId
    })
    .select()
    .single()

  if (promptError) throw promptError

  // 处理标签
  if (tags.length > 0) {
    // 查找或创建标签
    const tagResults = await Promise.all(
      tags.map(async (tagName) => {
        // 先尝试查找现有标签
        const { data: existingTag } = await supabase
          .from('tags')
          .select('id')
          .eq('name', tagName)
          .single()

        if (existingTag) {
          return existingTag.id
        }

        // 创建新标签
        const { data: newTag, error } = await supabase
          .from('tags')
          .insert({ name: tagName })
          .select('id')
          .single()

        if (error) throw error
        return newTag.id
      })
    )

    // 创建关联关系
    const { error: tagError } = await supabase
      .from('prompt_tags')
      .insert(
        tagResults.map(tagId => ({
          prompt_id: prompt.id,
          tag_id: tagId
        }))
      )

    if (tagError) throw tagError
  }

  return prompt
}

export async function toggleLike(promptId: string, userId: string): Promise<boolean> {
  // 检查是否已点赞
  const { data: existingLike } = await supabase
    .from('likes')
    .select('id')
    .eq('user_id', userId)
    .eq('prompt_id', promptId)
    .single()

  if (existingLike) {
    // 取消点赞
    const { error } = await supabase
      .from('likes')
      .delete()
      .eq('id', existingLike.id)

    if (error) throw error
    return false
  } else {
    // 添加点赞
    const { error } = await supabase
      .from('likes')
      .insert({
        user_id: userId,
        prompt_id: promptId
      })

    if (error) throw error
    return true
  }
}

export async function toggleFavorite(promptId: string, userId: string): Promise<boolean> {
  // 检查是否已收藏
  const { data: existingFavorite } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', userId)
    .eq('prompt_id', promptId)
    .single()

  if (existingFavorite) {
    // 取消收藏
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('id', existingFavorite.id)

    if (error) throw error
    return false
  } else {
    // 添加收藏
    const { error } = await supabase
      .from('favorites')
      .insert({
        user_id: userId,
        prompt_id: promptId
      })

    if (error) throw error
    return true
  }
}

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categorieslabel')
    .select('*')
    .order('name')

  if (error) throw error
  return data || []
}

export async function getUserPrompts(userId: string): Promise<Prompt[]> {
  const { data, error } = await supabase
    .from('prompts')
    .select(`
      *,
      categorieslabel (
        id, name, slug, color
      )
    `)
    .eq('author_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function getUserFavorites(userId: string): Promise<Prompt[]> {
  const { data, error } = await supabase
    .from('favorites')
    .select(`
      prompt_id,
      prompts (
        *,
        categorieslabel (
          id, name, slug, color
        ),
        user_profiles (
          id, username, display_name, avatar_url
        )
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data?.map((f: any) => f.prompts as Prompt).filter(Boolean) || [])
}

export async function getAllPromptIds(): Promise<string[]> {
  const { data, error } = await supabase
    .from('prompts')
    .select('id')

  if (error) throw error
  return data?.map(prompt => prompt.id) || []
}
