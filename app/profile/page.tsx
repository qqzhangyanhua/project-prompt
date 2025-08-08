'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Heart, Star, FileText, Edit3 } from 'lucide-react'
import { Layout } from '@/components/Layout'
import { PromptCard } from '@/components/PromptCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { getUserPrompts, getUserFavorites } from '@/lib/prompts'
import { useAuth } from '@/hooks/useAuth'
import type { Prompt } from '@/lib/supabase'
import useSWR from 'swr'

export default function ProfilePage() {
  const router = useRouter()
  const { user, profile, isAuthenticated, loading: authLoading } = useAuth()
  const [userPrompts, setUserPrompts] = useState<Prompt[]>([])
  const [userFavorites, setUserFavorites] = useState<Prompt[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('published')

  // 检查用户登录状态
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth')
    }
  }, [isAuthenticated, authLoading, router])

  const { data: promptsData, isLoading: promptsLoading } = useSWR(
    user ? ['user-prompts', user.id] : null,
    () => getUserPrompts(user!.id),
    { revalidateOnFocus: false }
  )

  const { data: favoritesData, isLoading: favoritesLoading } = useSWR(
    user ? ['user-favorites', user.id] : null,
    () => getUserFavorites(user!.id),
    { revalidateOnFocus: false }
  )

  useEffect(() => {
    setUserPrompts(promptsData || [])
  }, [promptsData])

  useEffect(() => {
    setUserFavorites(favoritesData || [])
  }, [favoritesData])

  useEffect(() => {
    setLoading(promptsLoading || favoritesLoading)
  }, [promptsLoading, favoritesLoading])

  if (authLoading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="bg-card rounded-lg p-6 shadow-sm mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  const totalLikes = userPrompts.reduce((sum, prompt) => sum + prompt.likes_count, 0)
  const totalFavorites = userPrompts.reduce((sum, prompt) => sum + prompt.favorites_count, 0)

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* 用户信息卡片 */}
        <Card className="shadow-sm border-0 mb-8">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-6">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback className="text-2xl">
                    {profile?.display_name?.[0]?.toUpperCase() || 
                     profile?.username?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-foreground mb-1">
                    {profile?.display_name || profile?.username}
                  </h1>
                  <p className="text-muted-foreground mb-3">
                    @{profile?.username}
                  </p>
                  {profile?.bio && (
                    <p className="text-foreground mb-3">{profile.bio}</p>
                  )}
                  <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      加入于 {new Date(profile?.created_at || '').toLocaleDateString('zh-CN')}
                    </span>
                  </div>
                </div>
              </div>

              <Button variant="outline" size="sm">
                <Edit3 className="h-4 w-4 mr-2" />
                编辑资料
              </Button>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            {/* 统计信息 */}
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-foreground mb-1">
                  {userPrompts.length}
                </div>
                <div className="text-sm text-muted-foreground flex items-center justify-center">
                  <FileText className="h-4 w-4 mr-1" />
                  已发布
                </div>
              </div>
              
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-foreground mb-1">
                  {userFavorites.length}
                </div>
                <div className="text-sm text-muted-foreground flex items-center justify-center">
                  <Star className="h-4 w-4 mr-1" />
                  已收藏
                </div>
              </div>
              
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-foreground mb-1">
                  {totalLikes}
                </div>
                <div className="text-sm text-muted-foreground flex items-center justify-center">
                  <Heart className="h-4 w-4 mr-1" />
                  获得点赞
                </div>
              </div>
              
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-foreground mb-1">
                  {totalFavorites}
                </div>
                <div className="text-sm text-muted-foreground flex items-center justify-center">
                  <Star className="h-4 w-4 mr-1" />
                  获得收藏
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 内容标签页 */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="published" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>我发布的</span>
              <Badge variant="secondary" className="ml-1">
                {userPrompts.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="favorites" className="flex items-center space-x-2">
              <Star className="h-4 w-4" />
              <span>我收藏的</span>
              <Badge variant="secondary" className="ml-1">
                {userFavorites.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="published">
            {loading ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-card rounded-lg p-6 shadow-sm animate-pulse">
                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : userPrompts.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {userPrompts.map((prompt) => (
                  <PromptCard key={prompt.id} prompt={prompt} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-4">还没有发布任何提示词</p>
                <Button onClick={() => router.push('/publish')}>
                  发布第一个提示词
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="favorites">
            {loading ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-card rounded-lg p-6 shadow-sm animate-pulse">
                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : userFavorites.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {userFavorites.map((prompt) => (
                  <PromptCard key={prompt.id} prompt={prompt} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-4">还没有收藏任何提示词</p>
                <Button onClick={() => router.push('/')}>
                  去首页看看
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  )
}