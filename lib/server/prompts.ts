import { query } from './db'
import type { Category, Prompt, Tag } from '@/lib/type'

interface PromptRow {
  id: string
  title: string
  content: string
  category_id: string | null
  author_id: string
  likes_count: number
  favorites_count: number
  created_at: string
  updated_at: string
  category_name: string | null
  category_slug: string | null
  category_color: string | null
  user_username: string | null
  user_display_name: string | null
  user_avatar_url: string | null
}

function mapPromptRow(row: PromptRow): Prompt {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    category_id: row.category_id ?? undefined,
    author_id: row.author_id,
    likes_count: row.likes_count,
    favorites_count: row.favorites_count,
    created_at: row.created_at,
    updated_at: row.updated_at,
    categorieslabel: row.category_name
      ? {
          id: row.category_id ?? '',
          name: row.category_name,
          slug: row.category_slug ?? '',
          color: row.category_color ?? '#3B82F6',
          created_at: '',
        }
      : undefined,
    user_profiles: row.user_username
      ? {
          id: row.author_id,
          username: row.user_username,
          display_name: row.user_display_name ?? undefined,
          avatar_url: row.user_avatar_url ?? undefined,
          created_at: '',
          updated_at: '',
        }
      : undefined,
  }
}

export async function getPromptsFromDb(
  sortBy: 'latest' | 'popular' = 'latest',
  categorySlug?: string,
  searchQuery?: string,
  userId?: string,
  tagId?: string
): Promise<Prompt[]> {
  const conditions: string[] = []
  const values: Array<string> = []

  if (categorySlug) {
    values.push(categorySlug)
    conditions.push(`c.slug = $${values.length}`)
  }

  if (searchQuery) {
    values.push(`%${searchQuery}%`)
    values.push(`%${searchQuery}%`)
    conditions.push(`(p.title ILIKE $${values.length - 1} OR p.content ILIKE $${values.length})`)
  }

  if (tagId) {
    values.push(tagId)
    conditions.push(
      `EXISTS (SELECT 1 FROM prompt_tags pt WHERE pt.prompt_id = p.id AND pt.tag_id = $${values.length})`
    )
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
  const orderBy = sortBy === 'popular' ? 'p.likes_count DESC' : 'p.created_at DESC'

  const result = await query<PromptRow>(
    `SELECT
       p.id,
       p.title,
       p.content,
       p.category_id,
       p.author_id,
       p.likes_count,
       p.favorites_count,
       p.created_at,
       p.updated_at,
       c.name AS category_name,
       c.slug AS category_slug,
       c.color AS category_color,
       up.username AS user_username,
       up.display_name AS user_display_name,
       up.avatar_url AS user_avatar_url
     FROM prompts p
     LEFT JOIN categorieslabel c ON c.id = p.category_id
     LEFT JOIN user_profiles up ON up.id = p.author_id
     ${whereClause}
     ORDER BY ${orderBy}
     LIMIT 50`,
    values
  )

  const prompts = result.rows.map((row: PromptRow) => mapPromptRow(row))

  if (!userId || prompts.length === 0) {
    return prompts
  }

  const ids = prompts.map((p: Prompt) => p.id)
  const likes = await query<{ prompt_id: string }>(
    `SELECT prompt_id FROM likes WHERE user_id = $1 AND prompt_id = ANY($2::uuid[])`,
    [userId, ids]
  )
  const favorites = await query<{ prompt_id: string }>(
    `SELECT prompt_id FROM favorites WHERE user_id = $1 AND prompt_id = ANY($2::uuid[])`,
    [userId, ids]
  )

  const likedIds = new Set(likes.rows.map((row: { prompt_id: string }) => row.prompt_id))
  const favoritedIds = new Set(
    favorites.rows.map((row: { prompt_id: string }) => row.prompt_id)
  )

  return prompts.map((prompt: Prompt) => ({
    ...prompt,
    is_liked: likedIds.has(prompt.id),
    is_favorited: favoritedIds.has(prompt.id),
  }))
}

export async function getPromptByIdFromDb(id: string, userId?: string): Promise<Prompt | null> {
  const promptResult = await query<PromptRow>(
    `SELECT
       p.id,
       p.title,
       p.content,
       p.category_id,
       p.author_id,
       p.likes_count,
       p.favorites_count,
       p.created_at,
       p.updated_at,
       c.name AS category_name,
       c.slug AS category_slug,
       c.color AS category_color,
       up.username AS user_username,
       up.display_name AS user_display_name,
       up.avatar_url AS user_avatar_url
     FROM prompts p
     LEFT JOIN categorieslabel c ON c.id = p.category_id
     LEFT JOIN user_profiles up ON up.id = p.author_id
     WHERE p.id = $1
     LIMIT 1`,
    [id]
  )

  const row = promptResult.rows[0]
  if (!row) {
    return null
  }

  const tagsResult = await query<Tag>(
    `SELECT t.id, t.name, t.created_at
     FROM prompt_tags pt
     JOIN tags t ON t.id = pt.tag_id
     WHERE pt.prompt_id = $1
     ORDER BY t.name`,
    [id]
  )

  let isLiked = false
  let isFavorited = false

  if (userId) {
    const [likeResult, favoriteResult] = await Promise.all([
      query<{ exists: boolean }>(
        'SELECT EXISTS(SELECT 1 FROM likes WHERE user_id = $1 AND prompt_id = $2) AS exists',
        [userId, id]
      ),
      query<{ exists: boolean }>(
        'SELECT EXISTS(SELECT 1 FROM favorites WHERE user_id = $1 AND prompt_id = $2) AS exists',
        [userId, id]
      ),
    ])

    isLiked = Boolean(likeResult.rows[0]?.exists)
    isFavorited = Boolean(favoriteResult.rows[0]?.exists)
  }

  return {
    ...mapPromptRow(row),
    tags: tagsResult.rows,
    is_liked: isLiked,
    is_favorited: isFavorited,
  }
}

export async function createPromptInDb(
  title: string,
  content: string,
  categoryId: string,
  tags: string[],
  authorId: string
): Promise<Prompt> {
  const inserted = await query<Prompt>(
    `INSERT INTO prompts (title, content, category_id, author_id)
     VALUES ($1, $2, $3, $4)
     RETURNING id, title, content, category_id, author_id, likes_count, favorites_count, created_at, updated_at`,
    [title, content, categoryId, authorId]
  )

  const prompt = inserted.rows[0]
  if (!prompt) {
    throw new Error('创建提示词失败')
  }

  if (tags.length > 0) {
    for (const tag of tags) {
      const normalizedTag = tag.trim()
      if (!normalizedTag) {
        continue
      }

      const createdTag = await query<{ id: string }>(
        `INSERT INTO tags (name)
         VALUES ($1)
         ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
         RETURNING id`,
        [normalizedTag]
      )

      const tagId = createdTag.rows[0]?.id
      if (!tagId) {
        continue
      }

      await query(
        `INSERT INTO prompt_tags (prompt_id, tag_id)
         VALUES ($1, $2)
         ON CONFLICT (prompt_id, tag_id) DO NOTHING`,
        [prompt.id, tagId]
      )
    }
  }

  return prompt
}

export async function toggleLikeInDb(promptId: string, userId: string): Promise<boolean> {
  const existing = await query<{ id: string }>(
    'SELECT id FROM likes WHERE user_id = $1 AND prompt_id = $2 LIMIT 1',
    [userId, promptId]
  )

  if (existing.rows[0]) {
    await query('DELETE FROM likes WHERE id = $1', [existing.rows[0].id])
    return false
  }

  await query('INSERT INTO likes (user_id, prompt_id) VALUES ($1, $2)', [userId, promptId])
  return true
}

export async function toggleFavoriteInDb(promptId: string, userId: string): Promise<boolean> {
  const existing = await query<{ id: string }>(
    'SELECT id FROM favorites WHERE user_id = $1 AND prompt_id = $2 LIMIT 1',
    [userId, promptId]
  )

  if (existing.rows[0]) {
    await query('DELETE FROM favorites WHERE id = $1', [existing.rows[0].id])
    return false
  }

  await query('INSERT INTO favorites (user_id, prompt_id) VALUES ($1, $2)', [userId, promptId])
  return true
}

export async function getCategoriesFromDb(): Promise<Category[]> {
  const result = await query<Category>(
    'SELECT id, name, slug, description, color, created_at FROM categorieslabel ORDER BY name'
  )
  return result.rows
}

export async function getTagsFromDb(): Promise<Tag[]> {
  const result = await query<Tag>('SELECT id, name, created_at FROM tags ORDER BY name')
  return result.rows
}

export async function getUserPromptsFromDb(userId: string): Promise<Prompt[]> {
  const result = await query<PromptRow>(
    `SELECT
       p.id,
       p.title,
       p.content,
       p.category_id,
       p.author_id,
       p.likes_count,
       p.favorites_count,
       p.created_at,
       p.updated_at,
       c.name AS category_name,
       c.slug AS category_slug,
       c.color AS category_color,
       up.username AS user_username,
       up.display_name AS user_display_name,
       up.avatar_url AS user_avatar_url
     FROM prompts p
     LEFT JOIN categorieslabel c ON c.id = p.category_id
     LEFT JOIN user_profiles up ON up.id = p.author_id
     WHERE p.author_id = $1
     ORDER BY p.created_at DESC`,
    [userId]
  )

  return result.rows.map((row: PromptRow) => mapPromptRow(row))
}

export async function getUserFavoritesFromDb(userId: string): Promise<Prompt[]> {
  const result = await query<PromptRow>(
    `SELECT
       p.id,
       p.title,
       p.content,
       p.category_id,
       p.author_id,
       p.likes_count,
       p.favorites_count,
       p.created_at,
       p.updated_at,
       c.name AS category_name,
       c.slug AS category_slug,
       c.color AS category_color,
       up.username AS user_username,
       up.display_name AS user_display_name,
       up.avatar_url AS user_avatar_url
     FROM favorites f
     JOIN prompts p ON p.id = f.prompt_id
     LEFT JOIN categorieslabel c ON c.id = p.category_id
     LEFT JOIN user_profiles up ON up.id = p.author_id
     WHERE f.user_id = $1
     ORDER BY f.created_at DESC`,
    [userId]
  )

  return result.rows.map((row: PromptRow) => mapPromptRow(row))
}

export async function getAllPromptIdsFromDb(): Promise<string[]> {
  const result = await query<{ id: string }>('SELECT id FROM prompts')
  return result.rows.map((row: { id: string }) => row.id)
}
