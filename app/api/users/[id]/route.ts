import { NextResponse } from 'next/server'
import { query } from '@/lib/server/db'
import type { UserProfile } from '@/lib/type'

export const dynamic = 'force-dynamic'

interface UserProfileRow {
  id: string
  username: string
  display_name: string | null
  bio: string | null
  avatar_url: string | null
  email: string | null
  created_at: string
  updated_at: string
}

function mapProfile(row: UserProfileRow): UserProfile {
  return {
    id: row.id,
    username: row.username,
    display_name: row.display_name ?? undefined,
    bio: row.bio ?? undefined,
    avatar_url: row.avatar_url ?? undefined,
    email: row.email ?? undefined,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

export async function GET(
  _request: Request,
  context: { params: { id: string } }
): Promise<NextResponse> {
  const userId = context.params.id
  const result = await query<UserProfileRow>(
    `SELECT id, username, display_name, bio, avatar_url, email, created_at, updated_at
     FROM user_profiles
     WHERE id = $1
     LIMIT 1`,
    [userId]
  )

  const row = result.rows[0]
  if (!row) {
    return NextResponse.json({ error: '用户不存在' }, { status: 404 })
  }

  return NextResponse.json({ data: mapProfile(row) })
}
