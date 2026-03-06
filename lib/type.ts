export interface AppUser {
  id: string
  email: string
}

export interface UserProfile {
  id: string
  username: string
  display_name?: string
  bio?: string
  avatar_url?: string
  email?: string
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
