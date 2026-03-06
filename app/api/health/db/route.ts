import { NextResponse } from 'next/server'
import { query } from '@/lib/server/db'

export const dynamic = 'force-dynamic'

export async function GET(): Promise<NextResponse> {
  try {
    const ping = await query<{ now: string }>('SELECT NOW()::text AS now')
    const categories = await query<{ count: string }>('SELECT COUNT(*)::text AS count FROM categorieslabel')

    return NextResponse.json({
      data: {
        status: 'ok',
        time: ping.rows[0]?.now ?? '',
        categories: Number(categories.rows[0]?.count ?? '0'),
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'database check failed'
    return NextResponse.json(
      {
        error: message,
      },
      { status: 503 }
    )
  }
}
