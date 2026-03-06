import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from 'crypto'
import { query } from './db'
import type { AppUser } from '@/lib/type'

interface AuthUserRow {
  id: string
  email: string
  password_hash: string
}

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, originalHash] = storedHash.split(':')
  if (!salt || !originalHash) {
    return false
  }

  const hashBuffer = Buffer.from(originalHash, 'hex')
  const candidateBuffer = scryptSync(password, salt, 64)
  if (hashBuffer.length !== candidateBuffer.length) {
    return false
  }

  return timingSafeEqual(hashBuffer, candidateBuffer)
}

export async function registerUser(
  email: string,
  password: string,
  username: string
): Promise<AppUser> {
  const normalizedEmail = email.trim().toLowerCase()
  const normalizedUsername = username.trim()

  const duplicateCheck = await query<{ id: string }>(
    'SELECT id FROM user_profiles WHERE lower(email) = lower($1) OR username = $2 LIMIT 1',
    [normalizedEmail, normalizedUsername]
  )

  if (duplicateCheck.rows[0]) {
    throw new Error('邮箱或用户名已存在')
  }

  const passwordHash = hashPassword(password)

  const inserted = await query<{ id: string; email: string }>(
    `INSERT INTO user_profiles (id, email, password_hash, username, display_name)
     VALUES ($1, $2, $3, $4, $4)
     RETURNING id, email`,
    [randomUUID(), normalizedEmail, passwordHash, normalizedUsername]
  )

  const user = inserted.rows[0]
  if (!user) {
    throw new Error('创建用户失败')
  }

  return {
    id: user.id,
    email: user.email,
  }
}

export async function authenticateUser(email: string, password: string): Promise<AppUser> {
  const normalizedEmail = email.trim().toLowerCase()

  const found = await query<AuthUserRow>(
    `SELECT id, email, password_hash
     FROM user_profiles
     WHERE lower(email) = lower($1)
     LIMIT 1`,
    [normalizedEmail]
  )

  const row = found.rows[0]
  if (!row) {
    throw new Error('邮箱或密码错误')
  }

  const valid = verifyPassword(password, row.password_hash)
  if (!valid) {
    throw new Error('邮箱或密码错误')
  }

  return {
    id: row.id,
    email: row.email,
  }
}
