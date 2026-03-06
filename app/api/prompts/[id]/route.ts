import { NextResponse } from 'next/server'
import { getPromptByIdFromDb } from '@/lib/server/prompts'

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
