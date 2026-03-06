import { NextResponse } from 'next/server'
import { createUserSession } from '@/lib/server/session'
import { registerUser } from '@/lib/server/auth'

export const dynamic = 'force-dynamic'

interface SignUpBody {
  email?: string
  password?: string
  username?: string
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as SignUpBody
    const email = body.email?.trim()
    const password = body.password ?? ''
    const username = body.username?.trim()

    if (!email || !username || password.length < 6) {
      return NextResponse.json({ error: '参数不合法' }, { status: 400 })
    }

    const user = await registerUser(email, password, username)
    await createUserSession(user.id)

    return NextResponse.json({ data: { user } })
  } catch (error) {
    const message = error instanceof Error ? error.message : '注册失败'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
