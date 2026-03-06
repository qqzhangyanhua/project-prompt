import type { Prompt, Category, Tag } from './type'

interface ApiEnvelope<T> {
  data?: T
  error?: string
}

async function parseJson<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as ApiEnvelope<T>
  if (!response.ok) {
    throw new Error(payload.error ?? '请求失败')
  }
  if (!payload.data) {
    throw new Error('响应数据为空')
  }
  return payload.data
}

function buildQuery(params: Record<string, string | undefined>): string {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      query.set(key, value)
    }
  })
  const queryString = query.toString()
  return queryString ? `?${queryString}` : ''
}

export async function getPrompts(
  sortBy: 'latest' | 'popular' = 'latest',
  categorySlug?: string,
  searchQuery?: string,
  userId?: string,
  tagId?: string
): Promise<Prompt[]> {
  if (typeof window === 'undefined') {
    const { getPromptsFromDb } = await import('./server/prompts')
    return getPromptsFromDb(sortBy, categorySlug, searchQuery, userId, tagId)
  }

  const query = buildQuery({
    sortBy,
    categorySlug,
    searchQuery,
    userId,
    tagId,
  })

  const response = await fetch(`/api/prompts${query}`, {
    credentials: 'include',
    cache: 'no-store',
  })

  return parseJson<Prompt[]>(response)
}

export async function getPromptById(id: string, userId?: string): Promise<Prompt | null> {
  if (typeof window === 'undefined') {
    const { getPromptByIdFromDb } = await import('./server/prompts')
    return getPromptByIdFromDb(id, userId)
  }

  const query = buildQuery({ userId })
  const response = await fetch(`/api/prompts/${id}${query}`, {
    credentials: 'include',
    cache: 'no-store',
  })

  if (response.status === 404) {
    return null
  }

  return parseJson<Prompt>(response)
}

export async function createPrompt(
  title: string,
  content: string,
  categoryId: string,
  tags: string[],
  authorId: string
): Promise<Prompt> {
  const response = await fetch('/api/prompts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      title,
      content,
      categoryId,
      tags,
      authorId,
    }),
  })

  return parseJson<Prompt>(response)
}

export async function toggleLike(promptId: string, _userId: string): Promise<boolean> {
  const response = await fetch(`/api/prompts/${promptId}/like`, {
    method: 'POST',
    credentials: 'include',
  })

  const data = await parseJson<{ liked: boolean }>(response)
  return data.liked
}

export async function toggleFavorite(promptId: string, _userId: string): Promise<boolean> {
  const response = await fetch(`/api/prompts/${promptId}/favorite`, {
    method: 'POST',
    credentials: 'include',
  })

  const data = await parseJson<{ favorited: boolean }>(response)
  return data.favorited
}

export async function getCategories(): Promise<Category[]> {
  if (typeof window === 'undefined') {
    const { getCategoriesFromDb } = await import('./server/prompts')
    return getCategoriesFromDb()
  }

  const response = await fetch('/api/categories', {
    credentials: 'include',
    cache: 'no-store',
  })
  return parseJson<Category[]>(response)
}

export async function getUserPrompts(userId: string): Promise<Prompt[]> {
  if (typeof window === 'undefined') {
    const { getUserPromptsFromDb } = await import('./server/prompts')
    return getUserPromptsFromDb(userId)
  }

  const response = await fetch(`/api/users/${userId}/prompts`, {
    credentials: 'include',
    cache: 'no-store',
  })

  return parseJson<Prompt[]>(response)
}

export async function getUserFavorites(userId: string): Promise<Prompt[]> {
  if (typeof window === 'undefined') {
    const { getUserFavoritesFromDb } = await import('./server/prompts')
    return getUserFavoritesFromDb(userId)
  }

  const response = await fetch(`/api/users/${userId}/favorites`, {
    credentials: 'include',
    cache: 'no-store',
  })

  return parseJson<Prompt[]>(response)
}

export async function getAllPromptIds(): Promise<string[]> {
  if (typeof window === 'undefined') {
    const { getAllPromptIdsFromDb } = await import('./server/prompts')
    return getAllPromptIdsFromDb()
  }

  const prompts = await getPrompts('latest')
  return prompts.map((prompt) => prompt.id)
}

export async function getTags(): Promise<Tag[]> {
  if (typeof window === 'undefined') {
    const { getTagsFromDb } = await import('./server/prompts')
    return getTagsFromDb()
  }

  const response = await fetch('/api/tags', {
    credentials: 'include',
    cache: 'no-store',
  })
  return parseJson<Tag[]>(response)
}
