'use client'

import React, { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Moon, Sun } from 'lucide-react'

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = resolvedTheme === 'dark'

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark')
  }

  // Prevent hydration mismatch by rendering a placeholder before mounting
  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        aria-label="切换主题"
        className="h-8 w-8"
      >
        <span className="h-4 w-4" />
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label="切换主题"
      className="h-8 w-8"
      title={isDark ? '切换为浅色' : '切换为深色'}
    >
      {isDark ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </Button>
  )
}


