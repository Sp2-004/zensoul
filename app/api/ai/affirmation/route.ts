import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { generateAffirmation } from '@/lib/ai'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const mood = searchParams.get('mood') || undefined

    const affirmation = await generateAffirmation(mood)

    return NextResponse.json({ affirmation })
  } catch (error) {
    console.error('Affirmation AI error:', error)
    return NextResponse.json(
      { error: 'Failed to generate affirmation' },
      { status: 500 }
    )
  }
}