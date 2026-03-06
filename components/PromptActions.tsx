'use client'

import React, { useState } from 'react'
import { Copy, Heart, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toggleLike, toggleFavorite } from '@/lib/prompts'
import { useAuthStore } from '@/stores/authStore'
import { cn } from '@/lib/utils'
import type { Prompt } from '@/lib/type'
import { toast } from 'sonner'
import { useSWRConfig } from 'swr'

interface PromptActionsProps {
  prompt: Prompt
}

export function PromptActions({ prompt }: PromptActionsProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const user = useAuthStore((s) => s.user)
  const { mutate } = useSWRConfig()
  const [isLiked, setIsLiked] = useState(prompt.is_liked || false)
  const [isFavorited, setIsFavorited] = useState(prompt.is_favorited || false)
  const [likesCount, setLikesCount] = useState(prompt.likes_count)
  const [favoritesCount, setFavoritesCount] = useState(prompt.favorites_count)
  const [actionLoading, setActionLoading] = useState(false)

  const updateCaches = (patch: Partial<Prompt>) => {
    mutate(
      (key) => Array.isArray(key) && (key[0] === 'prompts' || key[0] === 'user-prompts'),
      (current: unknown) => {
        if (!Array.isArray(current)) return current
        return (current as Prompt[]).map((p) => (p.id === prompt.id ? { ...p, ...patch } : p))
      },
      { revalidate: false }
    )
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt.content)
      toast.success('已复制到剪贴板')
    } catch (error) {
      toast.error('复制失败')
    }
  }

  const handleLike = async () => {
    if (!isAuthenticated || !user) {
      toast.error('请先登录')
      return
    }

    setActionLoading(true)
    try {
      const newLikedState = await toggleLike(prompt.id, user.id)
      setIsLiked(newLikedState)
      const nextLikes = newLikedState ? likesCount + 1 : likesCount - 1
      setLikesCount(nextLikes)
      updateCaches({ is_liked: newLikedState, likes_count: nextLikes })
      toast.success(newLikedState ? '点赞成功' : '取消点赞')
    } catch (error) {
      toast.error('操作失败')
    } finally {
      setActionLoading(false)
    }
  }

  const handleFavorite = async () => {
    if (!isAuthenticated || !user) {
      toast.error('请先登录')
      return
    }

    setActionLoading(true)
    try {
      const newFavoritedState = await toggleFavorite(prompt.id, user.id)
      setIsFavorited(newFavoritedState)
      const nextFavorites = newFavoritedState ? favoritesCount + 1 : favoritesCount - 1
      setFavoritesCount(nextFavorites)
      updateCaches({ is_favorited: newFavoritedState, favorites_count: nextFavorites })
      mutate((key) => Array.isArray(key) && key[0] === 'user-favorites')
      toast.success(newFavoritedState ? '收藏成功' : '取消收藏')
    } catch (error) {
      toast.error('操作失败')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button onClick={handleCopy} size="sm" className="gap-2">
        <Copy className="h-4 w-4" />
        复制
      </Button>

      {isAuthenticated && (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLike}
            disabled={actionLoading}
            className={cn(
              "gap-2",
              isLiked && "text-red-600 border-red-200 bg-red-50"
            )}
          >
            <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
            {likesCount}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleFavorite}
            disabled={actionLoading}
            className={cn(
              "gap-2",
              isFavorited && "text-yellow-600 border-yellow-200 bg-yellow-50"
            )}
          >
            <Star className={cn("h-4 w-4", isFavorited && "fill-current")} />
            {favoritesCount}
          </Button>
        </>
      )}
    </div>
  )
}
