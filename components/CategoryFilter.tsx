'use client'

import React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Category } from '@/lib/type'

interface CategoryFilterProps {
  categories: Category[]
}

export function CategoryFilter({ categories }: CategoryFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentCategory = searchParams.get('category')
  const searchQuery = searchParams.get('q')

  const handleCategoryClick = (categorySlug: string | null) => {
    const params = new URLSearchParams()
    
    if (categorySlug) {
      params.set('category', categorySlug)
    }
    
    if (searchQuery) {
      params.set('q', searchQuery)
    }

    const queryString = params.toString()
    router.push(queryString ? `/?${queryString}` : '/')
  }

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <Button
        variant={!currentCategory ? "default" : "outline"}
        size="sm"
        onClick={() => handleCategoryClick(null)}
        className="rounded-full"
      >
        全部
      </Button>
      
      {categories.map((category) => (
        <Button
          key={category.id}
          variant={currentCategory === category.slug ? "default" : "outline"}
          size="sm"
          onClick={() => handleCategoryClick(category.slug)}
          className="rounded-full"
          style={{
            backgroundColor: currentCategory === category.slug ? category.color : `${category.color}15`,
            borderColor: category.color,
            color: currentCategory === category.slug ? '#ffffff' : category.color
          }}
        >
          {category.name}
        </Button>
      ))}
    </div>
  )
}
