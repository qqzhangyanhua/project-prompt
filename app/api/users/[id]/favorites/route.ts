import { NextResponse } from 'next/server'
import { getUserFavoritesFromDb } from '@/lib/server/prompts'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: Request,
  context: { params: { id: string } }
): Promise<NextResponse> {
  const prompts = await getUserFavoritesFromDb(context.params.id)
  return NextResponse.json({ data: prompts })
}
