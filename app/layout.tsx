import './globals.css'
import type { Metadata } from 'next'
import { ThemeProvider } from '@/components/ThemeProvider'

export const metadata: Metadata = {
  title: 'PromptHub - 发现优质 AI 提示词',
  description: '精选高质量 AI 提示词分享平台，让 AI 创作更高效',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
