import type { MetadataRoute } from 'next'
import { getAllPromptIds } from '@/lib/prompts'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  const staticRoutes: MetadataRoute.Sitemap = [
    '',
    '/publish',
    '/auth',
    '/profile',
  ].map((path) => ({
    url: `${siteUrl}${path}`,
    changeFrequency: 'daily',
    priority: path === '' ? 1 : 0.7,
    lastModified: new Date(),
  }))

  let promptRoutes: MetadataRoute.Sitemap = []
  try {
    const ids = await getAllPromptIds()
    promptRoutes = ids.map((id) => ({
      url: `${siteUrl}/prompt/${id}`,
      changeFrequency: 'weekly',
      priority: 0.6,
      lastModified: new Date(),
    }))
  } catch {
    // 如果 Supabase 不可用，返回静态路由
    promptRoutes = []
  }

  return [...staticRoutes, ...promptRoutes]
}


