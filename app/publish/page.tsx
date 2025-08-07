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

export default function PublishPage() {
  const router = useRouter()
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [newTag, setNewTag] = useState('')

  const [form, setForm] = useState({
    title: '',
    content: '',
    categoryId: '',
    tags: [] as string[]
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
    if (tag && !form.tags.includes(tag) && form.tags.length < 5) {
      setForm(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }))
      setNewTag('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setForm(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.title.trim() || !form.content.trim() || !form.categoryId) {
      toast.error('请填写所有必填字段')
      return
    }

    if (!user) {
      toast.error('请先登录')
      return
    }

    setLoading(true)
    try {
      const prompt = await createPrompt(
        form.title.trim(),
        form.content.trim(),
        form.categoryId,
        form.tags,
        user.id
      )

      toast.success('发布成功！')
      router.push('/')
    } catch (error: any) {
      toast.error(error.message || '发布失败')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            发布新提示词
          </h1>
          <p className="text-gray-600">
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
                  value={form.title}
                  onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                  maxLength={100}
                  required
                />
                <p className="text-sm text-gray-500">
                  {form.title.length}/100
                </p>
              </div>

              {/* 分类 */}
              <div className="space-y-2">
                <Label htmlFor="category">
                  分类 <span className="text-red-500">*</span>
                </Label>
                <Select value={form.categoryId} onValueChange={(value) => setForm(prev => ({ ...prev, categoryId: value }))}>
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
              </div>

              {/* 内容 */}
              <div className="space-y-2">
                <Label htmlFor="content">
                  提示词内容 <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="content"
                  placeholder="输入你的提示词内容..."
                  value={form.content}
                  onChange={(e) => setForm(prev => ({ ...prev, content: e.target.value }))}
                  rows={8}
                  required
                />
                <p className="text-sm text-gray-500">
                  {form.content.length}
                </p>
              </div>

              {/* 标签 */}
              <div className="space-y-2">
                <Label>标签 (最多5个)</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {form.tags.map((tag) => (
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
                {form.tags.length < 5 && (
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