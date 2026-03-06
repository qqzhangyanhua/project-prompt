import { NextResponse } from 'next/server'
import { getUserPromptsFromDb } from '@/lib/server/prompts'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: Request,
  context: { params: { id: string } }
): Promise<NextResponse> {
  const prompts = await getUserPromptsFromDb(context.params.id)
  return NextResponse.json({ data: prompts })
}
