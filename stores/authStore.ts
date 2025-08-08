import { create } from 'zustand'
import type { User } from '@supabase/supabase-js'
import type { UserProfile } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'

interface AuthState {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  isAuthenticated: boolean
  initialized: boolean
  subscription: { unsubscribe: () => void } | null
  profileLoading: boolean
  lastProfileFetchTime: number
}

interface AuthActions {
  setUser: (user: User | null) => void
  setProfile: (profile: UserProfile | null) => void
  setLoading: (loading: boolean) => void
  fetchUserProfile: (userId: string) => Promise<void>
  initialize: () => Promise<void>
  clear: () => void
}

export const useAuthStore = create<AuthState & AuthActions>((set, get) => ({
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
  setUser: (user) => set({ 
    user, 
    isAuthenticated: !!user 
  }),

  setProfile: (profile) => set({ profile }),

  setLoading: (loading) => set({ loading }),

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
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()
      
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
      // 获取当前用户
      const { data: { user } } = await supabase.auth.getUser()
      set({ user, isAuthenticated: !!user })
      
      // 如果用户存在，获取用户资料
      if (user) {
        await get().fetchUserProfile(user.id)
      }
      
      // 设置认证状态变化监听器（只设置一次）
      if (!state.subscription) {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            const newUser = session?.user ?? null
            const currentState = get()
            
            // 只有在用户真正变化时才更新状态
            if (newUser?.id !== currentState.user?.id) {
              set({ user: newUser, isAuthenticated: !!newUser })
              
              if (newUser) {
                await get().fetchUserProfile(newUser.id)
              } else {
                set({ profile: null })
              }
            }
          }
        )
        
        set({ subscription })
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