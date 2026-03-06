'use client'

import React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { Tag } from '@/lib/type'
import { Badge } from '@/components/ui/badge'

interface TagFilterProps {
  tags: Tag[]
}

export function TagFilter({ tags }: TagFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentTag = searchParams.get('tag')
  const category = searchParams.get('category')
  const q = searchParams.get('q')

  const handleClick = (tagId: string | null) => {
    const params = new URLSearchParams()
    if (category) params.set('category', category)
    if (q) params.set('q', q)
    if (tagId) params.set('tag', tagId)
    const queryString = params.toString()
    router.push(queryString ? `/?${queryString}` : '/')
  }

  // 为标签生成稳定颜色，避免全部白色导致不可见
  const palette = [
    '#3B82F6', // blue-500
    '#10B981', // emerald-500
    '#F59E0B', // amber-500
    '#EF4444', // red-500
    '#8B5CF6', // violet-500
    '#06B6D4', // cyan-500
    '#14B8A6', // teal-500
    '#EC4899', // pink-500
  ] as const

  const getColorById = (id: string): string => {
    let hash = 0
    for (let i = 0; i < id.length; i++) {
      hash = (hash << 5) - hash + id.charCodeAt(i)
      hash |= 0
    }
    const index = Math.abs(hash) % palette.length
    return palette[index]
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Badge
        variant={currentTag ? 'outline' : 'secondary'}
        className="cursor-pointer"
        onClick={() => handleClick(null)}
      >
        全部标签
      </Badge>
      {tags.map(tag => {
        const color = getColorById(tag.id)
        const isActive = currentTag === tag.id
        return (
          <Badge
            key={tag.id}
            variant="outline"
            className="cursor-pointer border"
            style={{
              backgroundColor: isActive ? color : 'transparent',
              color: isActive ? '#ffffff' : color,
              borderColor: color,
            }}
            onClick={() => handleClick(tag.id)}
          >
            {tag.name}
          </Badge>
        )
      })}
    </div>
  )
}

