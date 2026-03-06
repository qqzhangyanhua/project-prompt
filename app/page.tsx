'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { TrendingUp, Clock } from 'lucide-react'
import { Layout } from '@/components/Layout'
import { PromptList } from '@/components/PromptList'
import { CategoryFilter } from '@/components/CategoryFilter'
import { TagFilter } from '@/components/TagFilter'
import { Button } from '@/components/ui/button'
import { getPrompts, getCategories, getTags } from '@/lib/prompts'
import { useAuth } from '@/hooks/useAuth'
import type { Prompt, Category } from '@/lib/type'
import useSWR from 'swr'

export default function HomePage() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'latest' | 'popular'>('latest')

  const category = searchParams.get('category')
  const searchQuery = searchParams.get('q')
  const tagId = searchParams.get('tag')

  const { data: promptsData, isLoading: promptsLoading } = useSWR(
    ['prompts', sortBy, category, searchQuery, user?.id, tagId],
    () => getPrompts(
      sortBy,
      category || undefined,
      searchQuery || undefined,
      user?.id || undefined,
      tagId || undefined
    ),
    { revalidateOnFocus: false }
  )

  const { data: categoriesData, isLoading: categoriesLoading } = useSWR(
    ['categories'],
    getCategories,
    { revalidateOnFocus: false }
  )

  const { data: tagsData } = useSWR(
    ['tags'],
    getTags,
    { revalidateOnFocus: false }
  )

  useEffect(() => {
    setPrompts(promptsData || [])
  }, [promptsData])

  useEffect(() => {
    setCategories(categoriesData || [])
  }, [categoriesData])

  useEffect(() => {
    setLoading(promptsLoading || categoriesLoading)
  }, [promptsLoading, categoriesLoading])

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            发现优质 AI 提示词
          </h1>
          <p className="text-muted-foreground">
            精选高质量提示词，让AI创作更高效
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <CategoryFilter categories={categories} />

          <div className="flex items-center space-x-2">
            <Button
              variant={sortBy === 'latest' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('latest')}
              className="flex items-center space-x-1"
            >
              <Clock className="h-4 w-4" />
              <span>最新</span>
            </Button>
            <Button
              variant={sortBy === 'popular' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('popular')}
              className="flex items-center space-x-1"
            >
              <TrendingUp className="h-4 w-4" />
              <span>热门</span>
            </Button>
          </div>
        </div>

        {/* Tag Filter */}
        {tagsData && tagsData.length > 0 && (
          <div className="mb-6">
            <TagFilter tags={tagsData} />
          </div>
        )}

        {/* Results Summary */}
        {searchQuery && (
          <div className="mb-6 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <p className="text-blue-600 dark:text-blue-400">
              搜索 &ldquo;<span className="font-semibold">{searchQuery}</span>&rdquo; 的结果
              {category && (
                <>
                  {' '}在 <span className="font-semibold">
                    {categories.find(c => c.slug === category)?.name}
                  </span> 分类中
                </>
              )}
            </p>
          </div>
        )}

        {/* Prompt List */}
        <PromptList prompts={prompts} loading={loading} />
      </div>
    </Layout>
  )
}
