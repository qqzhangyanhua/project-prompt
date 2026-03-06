import { NextResponse } from 'next/server'
import { getSessionIdentity } from '@/lib/server/session'
import { toggleLikeInDb } from '@/lib/server/prompts'

export const dynamic = 'force-dynamic'

export async function POST(
  _request: Request,
  context: { params: { id: string } }
): Promise<NextResponse> {
  const { user } = await getSessionIdentity()
  if (!user) {
    return NextResponse.json({ error: '未登录' }, { status: 401 })
  }

  const liked = await toggleLikeInDb(context.params.id, user.id)
  return NextResponse.json({ data: { liked } })
}
