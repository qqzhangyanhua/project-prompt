import { createHash, randomBytes } from 'crypto'
import { cookies } from 'next/headers'
import { query } from './db'
import type { AppUser, UserProfile } from '@/lib/type'

const SESSION_COOKIE_NAME = 'prompthub_session'
const SESSION_TTL_DAYS = 30

interface SessionUserRow {
  id: string
  email: string | null
}

interface SessionProfileRow {
  id: string
  username: string
  display_name: string | null
  bio: string | null
  avatar_url: string | null
  email: string | null
  created_at: string
  updated_at: string
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

function toAppUser(row: SessionUserRow): AppUser {
  return {
    id: row.id,
    email: row.email ?? '',
  }
}

function toProfile(row: SessionProfileRow): UserProfile {
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

export async function createUserSession(userId: string): Promise<void> {
  const rawToken = randomBytes(32).toString('hex')
  const tokenHash = hashToken(rawToken)

  await query(
    `INSERT INTO user_sessions (token_hash, user_id, expires_at)
     VALUES ($1, $2, NOW() + INTERVAL '30 days')`,
    [tokenHash, userId]
  )

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, rawToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_TTL_DAYS * 24 * 60 * 60,
  })
}

export async function clearUserSession(): Promise<void> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (token) {
    await query('DELETE FROM user_sessions WHERE token_hash = $1', [hashToken(token)])
  }

  cookieStore.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  })
}

export async function getSessionIdentity(): Promise<{
  user: AppUser | null
  profile: UserProfile | null
}> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (!token) {
    return { user: null, profile: null }
  }

  const result = await query<SessionUserRow & SessionProfileRow>(
    `SELECT p.id, p.email, p.username, p.display_name, p.bio, p.avatar_url, p.created_at, p.updated_at
     FROM user_sessions s
     JOIN user_profiles p ON p.id = s.user_id
     WHERE s.token_hash = $1 AND s.expires_at > NOW()
     LIMIT 1`,
    [hashToken(token)]
  )

  const row = result.rows[0]

  if (!row) {
    return { user: null, profile: null }
  }

  return {
    user: toAppUser(row),
    profile: toProfile(row),
  }
}
