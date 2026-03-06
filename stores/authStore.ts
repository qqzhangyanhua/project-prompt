import { create } from 'zustand'
import type { AppUser, UserProfile } from '@/lib/type'
import { AUTH_STATE_CHANGED_EVENT, getCurrentUser, getUserProfile } from '@/lib/auth'

interface AuthState {
  user: AppUser | null
  profile: UserProfile | null
  loading: boolean
  isAuthenticated: boolean
  initialized: boolean
  subscription: { unsubscribe: () => void } | null
  profileLoading: boolean
  lastProfileFetchTime: number
}

interface AuthActions {
  setUser: (user: AppUser | null) => void
  setProfile: (profile: UserProfile | null) => void
  setLoading: (loading: boolean) => void
  fetchUserProfile: (userId: string) => Promise<void>
  initialize: () => Promise<void>
  clear: () => void
}

export const useAuthStore = create<AuthState & AuthActions>((set: (partial: Partial<AuthState>) => void, get: () => AuthState & AuthActions) => ({
  // 状态
  user: null,
  profile: null,
  loading: true,
  isAuthenticated: false,
  initialized: false,
  subscription: null,
  profileLoading: false,
  lastProfileFetchTime: 0,

  // 操作
  setUser: (user: AppUser | null) => set({ 
    user, 
    isAuthenticated: !!user 
  }),

  setProfile: (profile: UserProfile | null) => set({ profile }),

  setLoading: (loading: boolean) => set({ loading }),

  fetchUserProfile: async (userId: string) => {
    const currentState = get()
    const now = Date.now()
    
    // 如果已经有相同用户的profile，且最近1秒内获取过，跳过重复请求
    if (currentState.profile && currentState.profile.id === userId && 
        (now - currentState.lastProfileFetchTime) < 1000) {
      return
    }
    
    // 如果正在加载profile，跳过重复请求
    if (currentState.profileLoading) {
      return
    }
    
    set({ profileLoading: true })
    
    try {
      const profile = await getUserProfile(userId)
      
      set({ profile, lastProfileFetchTime: now })
    } catch (error) {
      console.error('获取用户资料失败:', error)
      set({ profile: null })
    } finally {
      set({ profileLoading: false })
    }
  },

  initialize: async () => {
    const state = get()
    if (state.initialized) return
    
    set({ loading: true })
    
    try {
      const user = await getCurrentUser()
      set({ user, isAuthenticated: !!user })
      
      // 如果用户存在，获取用户资料
      if (user) {
        await get().fetchUserProfile(user.id)
      }
      
      // 设置认证状态变化监听器（只设置一次）
      if (!state.subscription && typeof window !== 'undefined') {
        const handler = async () => {
          const currentState = get()
          const nextUser = await getCurrentUser()
          if (nextUser?.id !== currentState.user?.id) {
            set({ user: nextUser, isAuthenticated: !!nextUser })
            if (nextUser) {
              await get().fetchUserProfile(nextUser.id)
            } else {
              set({ profile: null })
            }
          }
        }

        window.addEventListener(AUTH_STATE_CHANGED_EVENT, handler)
        set({
          subscription: {
            unsubscribe: () => {
              window.removeEventListener(AUTH_STATE_CHANGED_EVENT, handler)
            },
          },
        })
      }
      
      set({ initialized: true })
    } catch (error) {
      console.error('初始化认证失败:', error)
    } finally {
      set({ loading: false })
    }
  },

  clear: () => {
    const { subscription } = get()
    if (subscription) {
      subscription.unsubscribe()
    }
    
    set({
      user: null,
      profile: null,
      loading: false,
      isAuthenticated: false,
      initialized: false,
      subscription: null,
      profileLoading: false,
      lastProfileFetchTime: 0
    })
  }
}))
