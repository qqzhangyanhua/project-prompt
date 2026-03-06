import { NextRequest, NextResponse } from 'next/server'
import { getSessionIdentity } from '@/lib/server/session'
import { headers, cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest): Promise<NextResponse> {
  const start = Date.now()
  const reqId = Math.random().toString(36).slice(2, 8)

  // 记录请求信息
  const headerStore = await headers()
  const cookieStore = await cookies()
  const referer = headerStore.get('referer') || 'N/A'
  const userAgent = headerStore.get('user-agent') || 'N/A'
  const hasSessionCookie = cookieStore.has('session_token')

  console.log(
    `[auth/me] [${reqId}] 请求开始 | ` +
    `时间: ${new Date().toISOString()} | ` +
    `有session_token: ${hasSessionCookie} | ` +
    `Referer: ${referer} | ` +
    `UA: ${userAgent.slice(0, 80)}`
  )

  const identity = await getSessionIdentity()

  const elapsed = Date.now() - start
  console.log(
    `[auth/me] [${reqId}] 请求完成 | ` +
    `耗时: ${elapsed}ms | ` +
    `用户: ${identity.profile?.username ?? '未登录'} | ` +
    `用户ID: ${identity.user?.id ?? 'null'}`
  )

  return NextResponse.json({ data: identity })
}
