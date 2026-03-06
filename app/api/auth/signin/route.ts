import { NextResponse } from 'next/server'
import { authenticateUser } from '@/lib/server/auth'
import { createUserSession } from '@/lib/server/session'

export const dynamic = 'force-dynamic'

interface SignInBody {
  email?: string
  password?: string
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as SignInBody
    const email = body.email?.trim()
    const password = body.password ?? ''

    if (!email || !password) {
      return NextResponse.json({ error: '参数不合法' }, { status: 400 })
    }

    const user = await authenticateUser(email, password)
    await createUserSession(user.id)

    return NextResponse.json({ data: { user } })
  } catch (error) {
    const message = error instanceof Error ? error.message : '登录失败'
    return NextResponse.json({ error: message }, { status: 401 })
  }
}
