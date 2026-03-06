import type { AppUser, UserProfile } from './type'

export const AUTH_STATE_CHANGED_EVENT = 'auth-state-changed'

interface ApiEnvelope<T> {
  data?: T
  error?: string
}

async function parseJson<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as ApiEnvelope<T>
  if (!response.ok) {
    throw new Error(payload.error ?? '请求失败')
  }
  if (!payload.data) {
    throw new Error('响应数据为空')
  }
  return payload.data
}

function emitAuthChange(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(AUTH_STATE_CHANGED_EVENT))
  }
}

export async function signUp(email: string, password: string, username: string): Promise<{ user: AppUser }> {
  const response = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password, username }),
  })

  const data = await parseJson<{ user: AppUser }>(response)
  emitAuthChange()
  return data
}

export async function signIn(email: string, password: string): Promise<{ user: AppUser }> {
  const response = await fetch('/api/auth/signin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  })

  const data = await parseJson<{ user: AppUser }>(response)
  emitAuthChange()
  return data
}

export async function signOut(): Promise<void> {
  const response = await fetch('/api/auth/signout', {
    method: 'POST',
    credentials: 'include',
  })

  await parseJson<{ ok: boolean }>(response)
  emitAuthChange()
}

export async function getCurrentUser(): Promise<AppUser | null> {
  const response = await fetch('/api/auth/me', {
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
  })

  const data = await parseJson<{ user: AppUser | null; profile: UserProfile | null }>(response)
  return data.user
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const response = await fetch(`/api/users/${userId}`, {
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
  })

  if (response.status === 404) {
    return null
  }

  return parseJson<UserProfile>(response)
}
