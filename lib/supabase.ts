import { createClient } from '@supabase/supabase-js'

const supabaseUrl: string = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const supabaseAnonKey: string = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

if (!supabaseUrl || !supabaseAnonKey) {
  // 不在构建期抛错，避免本地未配置环境变量时无法构建；在运行期给出明确告警
  // 配置方式见 README 的环境变量说明
  console.warn('[Supabase] 缺少环境变量：请设置 NEXT_PUBLIC_SUPABASE_URL 与 NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 数据库类型定义
export interface UserProfile {
  id: string
  username: string
  display_name?: string
  bio?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  color: string
  created_at: string
}

export interface Tag {
  id: string
  name: string
  created_at: string
}

export interface Prompt {
  id: string
  title: string
  content: string
  category_id?: string
  author_id: string
  likes_count: number
  favorites_count: number
  created_at: string
  updated_at: string
  // 关联数据
  categorieslabel?: Category
  user_profiles?: UserProfile
  tags?: Tag[]
  is_liked?: boolean
  is_favorited?: boolean
}

export interface Like {
  id: string
  user_id: string
  prompt_id: string
  created_at: string
}

export interface Favorite {
  id: string
  user_id: string
  prompt_id: string
  created_at: string
}