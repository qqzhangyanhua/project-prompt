import { NextResponse } from 'next/server'
import { clearUserSession } from '@/lib/server/session'

export const dynamic = 'force-dynamic'

export async function POST(): Promise<NextResponse> {
  await clearUserSession()
  return NextResponse.json({ data: { ok: true } })
}
