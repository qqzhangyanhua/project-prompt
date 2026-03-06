import { NextResponse } from 'next/server'
import { getSessionIdentity } from '@/lib/server/session'
import { createPromptInDb, getPromptsFromDb } from '@/lib/server/prompts'

export const dynamic = 'force-dynamic'

interface CreatePromptBody {
  title?: string
  content?: string
  categoryId?: string
  tags?: string[]
}

export async function GET(request: Request): Promise<NextResponse> {
  const url = new URL(request.url)
  const sortByParam = url.searchParams.get('sortBy')
  const sortBy = sortByParam === 'popular' ? 'popular' : 'latest'
  const categorySlug = url.searchParams.get('categorySlug') ?? undefined
  const searchQuery = url.searchParams.get('searchQuery') ?? undefined
  const tagId = url.searchParams.get('tagId') ?? undefined
  const userId = url.searchParams.get('userId') ?? undefined

  const prompts = await getPromptsFromDb(sortBy, categorySlug, searchQuery, userId, tagId)
  return NextResponse.json({ data: prompts })
}

export async function POST(request: Request): Promise<NextResponse> {
  const { user } = await getSessionIdentity()
  if (!user) {
    return NextResponse.json({ error: '未登录' }, { status: 401 })
  }

  const body = (await request.json()) as CreatePromptBody
  const title = body.title?.trim()
  const content = body.content?.trim()
  const categoryId = body.categoryId?.trim()
  const tags = body.tags ?? []

  if (!title || !content || !categoryId) {
    return NextResponse.json({ error: '参数不合法' }, { status: 400 })
  }

  const prompt = await createPromptInDb(title, content, categoryId, tags, user.id)
  return NextResponse.json({ data: prompt })
}
