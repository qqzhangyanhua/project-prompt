'use client'

import React, { useEffect } from 'react'
import { useAuthStore } from '@/stores/authStore'

export function useAuth() {
  const {
    user,
    profile,
    loading,
    isAuthenticated,
    initialized,
    initialize
  } = useAuthStore()

  useEffect(() => {
    if (!initialized) {
      initialize()
    }
  }, [initialized, initialize])

  return {
    user,
    profile,
    loading,
    isAuthenticated
  }
}