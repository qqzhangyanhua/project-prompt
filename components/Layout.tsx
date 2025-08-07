'use client'

import React, { ReactNode } from 'react'
import { Header } from './Header'
import { Toaster } from 'sonner'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
      <Toaster position="top-right" />
    </div>
  )
}