import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, User, Tag } from 'lucide-react'
import { Layout } from '@/components/Layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { getPromptById } from '@/lib/prompts'
import { cn } from '@/lib/utils'
import { PromptActions } from '@/components/PromptActions'
import type { Tag as PromptTag } from '@/lib/supabase'
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Metadata } from 'next'

interface PromptDetailPageProps {
  params: {
    id: string
  }
}

// 为静态导出提供空的静态参数列表
// 这样页面将在客户端动态渲染
export async function generateStaticParams() {
  return []
}

export default async function PromptDetailPage({ params }: PromptDetailPageProps) {
  // 读取服务端会话，获取当前用户ID，以便个性化回显点赞/收藏状态
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const prompt = await getPromptById(params.id, user?.id)
  
  if (!prompt) {
    notFound()
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 返回按钮 */}
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              返回首页
            </Button>
          </Link>
        </div>

        {/* 主要内容 */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* 左侧内容区 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 标题和基本信息 */}
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-4">
                {prompt.title}
              </h1>
              
              {/* 分类和标签 */}
              <div className="flex flex-wrap gap-2 mb-4">
                {prompt.categorieslabel && (
                  <Badge 
                    variant="secondary" 
                    className="text-white"
                    style={{ backgroundColor: prompt.categorieslabel.color }}
                  >
                    {prompt.categorieslabel.name}
                  </Badge>
                )}
                {prompt.tags?.map((tag: PromptTag) => (
                  <Badge key={tag.id} variant="outline" className="gap-1">
                    <Tag className="h-3 w-3" />
                    {tag.name}
                  </Badge>
                ))}
              </div>

              {/* 作者信息 */}
              <div className="flex items-center gap-3 text-sm text-muted-foreground mb-6">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={prompt.user_profiles?.avatar_url} />
                    <AvatarFallback>
                      <User className="h-3 w-3" />
                    </AvatarFallback>
                  </Avatar>
                  <span>{prompt.user_profiles?.display_name || prompt.user_profiles?.username || '匿名用户'}</span>
                </div>
                <Separator orientation="vertical" className="h-4" />
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(prompt.created_at).toLocaleDateString('zh-CN')}</span>
                </div>
              </div>
            </div>

            {/* 提示词内容 */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">提示词内容</h2>
                  <PromptActions prompt={prompt} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-muted rounded-lg p-4">
                  <pre className="whitespace-pre-wrap text-sm text-foreground font-mono leading-relaxed">
                    {prompt.content}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 右侧信息栏 */}
          <div className="space-y-6">
            {/* 统计信息 */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold">统计信息</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">点赞数</span>
                  <span className="font-semibold">{prompt.likes_count}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">收藏数</span>
                  <span className="font-semibold">{prompt.favorites_count}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">创建时间</span>
                  <span className="text-sm">
                    {new Date(prompt.created_at).toLocaleDateString('zh-CN')}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* 作者信息 */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold">作者信息</h3>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={prompt.user_profiles?.avatar_url} />
                    <AvatarFallback>
                      <User className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">
                      {prompt.user_profiles?.display_name || prompt.user_profiles?.username || '匿名用户'}
                    </div>
                    {prompt.user_profiles?.username && (
                      <div className="text-sm text-muted-foreground">
                        @{prompt.user_profiles.username}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export async function generateMetadata({ params }: PromptDetailPageProps): Promise<Metadata> {
  // 仅用于 SEO，忽略个性化
  const prompt = await getPromptById(params.id)
  if (!prompt) {
    return {
      title: '提示词未找到 - PromptHub',
      description: '该提示词不存在或已被删除'
    }
  }
  const title = `${prompt.title} - PromptHub`
  const description = prompt.content.slice(0, 120)
  const url = `/prompt/${params.id}`
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: 'article'
    },
    twitter: {
      card: 'summary',
      title,
      description
    }
  }
}