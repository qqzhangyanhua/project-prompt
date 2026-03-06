import { NextResponse } from 'next/server'
import { getPromptByIdFromDb, updatePromptInDb, deletePromptInDb } from '@/lib/server/prompts'
import { getSessionIdentity } from '@/lib/server/session'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  context: { params: { id: string } }
): Promise<NextResponse> {
  const url = new URL(request.url)
  const userId = url.searchParams.get('userId') ?? undefined
  const prompt = await getPromptByIdFromDb(context.params.id, userId)

  if (!prompt) {
    return NextResponse.json({ error: '提示词不存在' }, { status: 404 })
  }

  return NextResponse.json({ data: prompt })
}

export async function PUT(
  request: Request,
  context: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const { user } = await getSessionIdentity()
    if (!user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const body = await request.json()
    const { title, content, categoryId, tags } = body as {
      title: string
      content: string
      categoryId: string
      tags: string[]
    }

    if (!title?.trim() || !content?.trim() || !categoryId) {
      return NextResponse.json({ error: '标题、内容和分类必填' }, { status: 400 })
    }

    const updated = await updatePromptInDb(context.params.id, user.id, {
      title: title.trim(),
      content: content.trim(),
      categoryId,
      tags: tags ?? [],
    })

    return NextResponse.json({ data: updated })
  } catch (error) {
    const message = error instanceof Error ? error.message : '更新失败'
    const status = message.includes('无权限') ? 403 : message.includes('不存在') ? 404 : 500
    return NextResponse.json({ error: message }, { status })
  }
}

export async function DELETE(
  request: Request,
  context: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const { user } = await getSessionIdentity()
    if (!user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    await deletePromptInDb(context.params.id, user.id)
    return NextResponse.json({ data: { success: true } })
  } catch (error) {
    const message = error instanceof Error ? error.message : '删除失败'
    const status = message.includes('无权限') ? 403 : message.includes('不存在') ? 404 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
