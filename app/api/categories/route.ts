import { NextResponse } from 'next/server'
import { getCategoriesFromDb } from '@/lib/server/prompts'

export const dynamic = 'force-dynamic'

export async function GET(): Promise<NextResponse> {
  const categories = await getCategoriesFromDb()
  return NextResponse.json({ data: categories })
}
