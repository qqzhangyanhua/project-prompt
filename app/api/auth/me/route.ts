import { NextResponse } from 'next/server'
import { getSessionIdentity } from '@/lib/server/session'

export const dynamic = 'force-dynamic'

export async function GET(): Promise<NextResponse> {
  const identity = await getSessionIdentity()
  return NextResponse.json({ data: identity })
}
