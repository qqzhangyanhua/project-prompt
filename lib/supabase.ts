import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gsrqdvzwaqycpmxvitai.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_Xd937Ccy0-8hf_ikR-945A_IG0Cy9Bs'

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