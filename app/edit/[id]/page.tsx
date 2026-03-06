'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Send, Plus, X, ArrowLeft } from 'lucide-react'
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
import { getPromptById, getCategories, updatePrompt } from '@/lib/prompts'
import { useAuth } from '@/hooks/useAuth'
import type { Category } from '@/lib/type'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const editSchema = z.object({
    title: z.string().min(1, '标题必填').max(100, '最多100字'),
    content: z.string().min(1, '内容必填'),
    categoryId: z.string().uuid('请选择分类'),
    tags: z.array(z.string().min(1)).max(5, '最多5个标签'),
})
type EditFormValues = z.infer<typeof editSchema>

export default function EditPromptPage() {
    const router = useRouter()
    const params = useParams()
    const id = params.id as string
    const { user, isAuthenticated, loading: authLoading } = useAuth()
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(false)
    const [fetchingPrompt, setFetchingPrompt] = useState(true)
    const [newTag, setNewTag] = useState('')

    const formMethods = useForm<EditFormValues>({
        resolver: zodResolver(editSchema),
        defaultValues: { title: '', content: '', categoryId: '', tags: [] },
    })

    // Redirect if not logged in
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            toast.error('请先登录')
            router.push('/auth')
        }
    }, [isAuthenticated, authLoading, router])

    // Load categories
    useEffect(() => {
        getCategories()
            .then(setCategories)
            .catch(() => console.error('加载分类失败'))
    }, [])

    // Load prompt data and check ownership
    useEffect(() => {
        if (!id || !user || authLoading) return

        setFetchingPrompt(true)
        getPromptById(id, user.id)
            .then((prompt) => {
                if (!prompt) {
                    toast.error('提示词不存在')
                    router.push('/profile')
                    return
                }
                if (prompt.author_id !== user.id) {
                    toast.error('无权限编辑此提示词')
                    router.push('/')
                    return
                }
                formMethods.reset({
                    title: prompt.title,
                    content: prompt.content,
                    categoryId: prompt.category_id ?? '',
                    tags: prompt.tags?.map((t) => t.name) ?? [],
                })
            })
            .catch(() => {
                toast.error('加载提示词失败')
                router.push('/profile')
            })
            .finally(() => setFetchingPrompt(false))
    }, [id, user, authLoading, formMethods, router])

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
        formMethods.setValue(
            'tags',
            current.filter((t) => t !== tagToRemove),
            { shouldValidate: true }
        )
    }

    const handleSubmit = formMethods.handleSubmit(async (values) => {
        if (!user) return
        setLoading(true)
        try {
            await updatePrompt(id, {
                title: values.title.trim(),
                content: values.content.trim(),
                categoryId: values.categoryId,
                tags: values.tags,
            })
            toast.success('更新成功！')
            router.push('/profile')
        } catch (error) {
            const message = error instanceof Error ? error.message : '更新失败'
            toast.error(message)
        } finally {
            setLoading(false)
        }
    })

    if (authLoading || fetchingPrompt) {
        return (
            <Layout>
                <div className="max-w-2xl mx-auto">
                    <div className="animate-pulse">
                        <div className="h-8 bg-muted rounded mb-4 w-48" />
                        <div className="bg-card border rounded-lg p-6 shadow-sm">
                            <div className="h-4 bg-muted rounded mb-4" />
                            <div className="h-32 bg-muted rounded mb-4" />
                            <div className="h-10 bg-muted rounded" />
                        </div>
                    </div>
                </div>
            </Layout>
        )
    }

    if (!isAuthenticated) return null

    return (
        <Layout>
            <div className="max-w-2xl mx-auto">
                <div className="mb-8">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push('/profile')}
                        className="mb-4 -ml-2 text-muted-foreground hover:text-foreground"
                    >
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        返回个人中心
                    </Button>
                    <h1 className="text-2xl font-bold text-foreground mb-2">编辑提示词</h1>
                    <p className="text-muted-foreground">修改你的提示词内容</p>
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
                                <p className="text-sm text-muted-foreground">
                                    {formMethods.watch('title').length}/100
                                </p>
                                {formMethods.formState.errors.title && (
                                    <p className="text-sm text-destructive">
                                        {formMethods.formState.errors.title.message}
                                    </p>
                                )}
                            </div>

                            {/* 分类 */}
                            <div className="space-y-2">
                                <Label htmlFor="category">
                                    分类 <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                    value={formMethods.watch('categoryId')}
                                    onValueChange={(value) =>
                                        formMethods.setValue('categoryId', value, { shouldValidate: true })
                                    }
                                >
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
                                    <p className="text-sm text-destructive">
                                        {formMethods.formState.errors.categoryId.message}
                                    </p>
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
                                <p className="text-sm text-muted-foreground">
                                    {formMethods.watch('content').length} 字
                                </p>
                                {formMethods.formState.errors.content && (
                                    <p className="text-sm text-destructive">
                                        {formMethods.formState.errors.content.message}
                                    </p>
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
                                                className="ml-1 hover:text-destructive"
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
                                            onKeyDown={(e) => {
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
                                {formMethods.formState.errors.tags && (
                                    <p className="text-sm text-destructive">
                                        {formMethods.formState.errors.tags.message as string}
                                    </p>
                                )}
                            </div>

                            {/* 按钮 */}
                            <div className="flex justify-end space-x-4 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.push('/profile')}
                                    disabled={loading}
                                >
                                    取消
                                </Button>
                                <Button type="submit" disabled={loading}>
                                    {loading ? (
                                        '保存中...'
                                    ) : (
                                        <>
                                            <Send className="h-4 w-4 mr-2" />
                                            保存修改
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
