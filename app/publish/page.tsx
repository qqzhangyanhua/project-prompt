'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Send, Plus, X } from 'lucide-react'
import { Layout } from '@/components/Layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { createPrompt, getCategories } from '@/lib/prompts'
import { useAuth } from '@/hooks/useAuth'
import type { Category } from '@/lib/supabase'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

export default function PublishPage() {
  const router = useRouter()
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [newTag, setNewTag] = useState('')

  const publishSchema = z.object({
    title: z.string().min(1, '标题必填').max(100, '最多100字'),
    content: z.string().min(1, '内容必填'),
    categoryId: z.string().uuid('请选择分类'),
    tags: z.array(z.string().min(1)).max(5, '最多5个标签')
  })
  type PublishFormValues = z.infer<typeof publishSchema>

  const formMethods = useForm<PublishFormValues>({
    resolver: zodResolver(publishSchema),
    defaultValues: { title: '', content: '', categoryId: '', tags: [] }
  })

  // 获取分类数据
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await getCategories()
        setCategories(categoriesData)
      } catch (error) {
        console.error('Failed to fetch categories:', error)
      }
    }

    fetchCategories()
  }, [])

  // 检查用户登录状态
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error('请先登录')
      router.push('/auth')
    }
  }, [isAuthenticated, authLoading, router])

  const handleAddTag = () => {
    const tag = newTag.trim()
    const current = formMethods.getValues('tags')
    if (tag && !current.includes(tag) && current.length < 5) {
      formMethods.setValue('tags', [...current, tag], { shouldValidate: true })
      setNewTag('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    const current = formMethods.getValues('tags')
    formMethods.setValue('tags', current.filter(t => t !== tagToRemove), { shouldValidate: true })
  }

  const handleSubmit = formMethods.handleSubmit(async (values) => {
    if (!user) {
      toast.error('请先登录')
      return
    }
    setLoading(true)
    try {
      await createPrompt(
        values.title.trim(),
        values.content.trim(),
        values.categoryId,
        values.tags,
        user.id
      )
      toast.success('发布成功！')
      router.push('/')
    } catch (error) {
      const message = error instanceof Error ? error.message : '发布失败'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  })

  if (authLoading) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="bg-card rounded-lg p-6 shadow-sm">
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-32 bg-gray-200 rounded mb-4"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            发布新提示词
          </h1>
          <p className="text-muted-foreground">
            分享你的优质提示词，帮助更多人提升AI创作效率
          </p>
        </div>

        <Card className="shadow-sm border-0">
          <CardHeader>
            <CardTitle>提示词信息</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 标题 */}
              <div className="space-y-2">
                <Label htmlFor="title">
                  标题 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="为你的提示词起个吸引人的标题"
                  {...formMethods.register('title')}
                  maxLength={100}
                />
                <p className="text-sm text-gray-500">
                  {formMethods.watch('title').length}/100
                </p>
                {formMethods.formState.errors.title && (
                  <p className="text-sm text-red-600">{formMethods.formState.errors.title.message}</p>
                )}
              </div>

              {/* 分类 */}
              <div className="space-y-2">
                <Label htmlFor="category">
                  分类 <span className="text-red-500">*</span>
                </Label>
                {/* 使用受控方式写入 RHF */}
                <Select value={formMethods.watch('categoryId')} onValueChange={(value) => formMethods.setValue('categoryId', value, { shouldValidate: true })}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择分类" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                          <span>{category.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formMethods.formState.errors.categoryId && (
                  <p className="text-sm text-red-600">{formMethods.formState.errors.categoryId.message}</p>
                )}
              </div>

              {/* 内容 */}
              <div className="space-y-2">
                <Label htmlFor="content">
                  提示词内容 <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="content"
                  placeholder="输入你的提示词内容..."
                  {...formMethods.register('content')}
                  rows={8}
                />
                <p className="text-sm text-gray-500">
                  {formMethods.watch('content').length}
                </p>
                {formMethods.formState.errors.content && (
                  <p className="text-sm text-red-600">{formMethods.formState.errors.content.message}</p>
                )}
              </div>

              {/* 标签 */}
              <div className="space-y-2">
                <Label>标签 (最多5个)</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formMethods.watch('tags').map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center space-x-1">
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                {formMethods.watch('tags').length < 5 && (
                  <div className="flex space-x-2">
                    <Input
                      placeholder="添加标签"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAddTag()
                        }
                      }}
                      maxLength={20}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddTag}
                      disabled={!newTag.trim()}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                <p className="text-sm text-gray-500">
                  使用标签帮助其他用户更好地找到你的提示词
                </p>
                {formMethods.formState.errors.tags && (
                  <p className="text-sm text-red-600">{formMethods.formState.errors.tags.message as string}</p>
                )}
              </div>

              {/* 提交按钮 */}
              <div className="flex justify-end space-x-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={loading}
                >
                  取消
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    '发布中...'
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      发布
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}