'use client'

import React, { useState, useEffect } from 'react'
import { PromptCard } from './PromptCard'
import { Button } from '@/components/ui/button'
import type { Prompt } from '@/lib/type'

interface PromptListProps {
  prompts: Prompt[]
  loading?: boolean
}

export function PromptList({ prompts: initialPrompts, loading }: PromptListProps) {
  const [prompts, setPrompts] = useState(initialPrompts)

  // 同步外部传入的prompts变化
  useEffect(() => {
    setPrompts(initialPrompts)
  }, [initialPrompts])

  const handlePromptUpdate = (updatedPrompt: Prompt) => {
    setPrompts(prevPrompts =>
      prevPrompts.map(prompt =>
        prompt.id === updatedPrompt.id ? updatedPrompt : prompt
      )
    )
  }

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-card rounded-lg p-6 shadow-sm animate-pulse border">
            <div className="h-4 bg-muted rounded mb-4"></div>
            <div className="h-3 bg-muted rounded mb-2"></div>
            <div className="h-3 bg-muted rounded mb-2"></div>
            <div className="h-3 bg-muted rounded w-3/4"></div>
          </div>
        ))}
      </div>
    )
  }

  if (prompts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg mb-4">暂无提示词</p>
        <p className="text-muted-foreground/80">试试调整筛选条件或搜索关键词</p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {prompts.map((prompt) => (
        <PromptCard
          key={prompt.id}
          prompt={prompt}
          onUpdate={handlePromptUpdate}
        />
      ))}
    </div>
  )
}
