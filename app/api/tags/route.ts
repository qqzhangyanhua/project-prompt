import { NextResponse } from 'next/server'
import { getTagsFromDb } from '@/lib/server/prompts'

export const dynamic = 'force-dynamic'

export async function GET(): Promise<NextResponse> {
  const tags = await getTagsFromDb()
  return NextResponse.json({ data: tags })
}
