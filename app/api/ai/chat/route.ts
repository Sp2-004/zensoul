import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { generateChatResponse } from '@/lib/ai'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { message } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const response = await generateChatResponse(message)

    return NextResponse.json({ response })
  } catch (error) {
    console.error('Chat AI error:', error)
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    )
  }
}