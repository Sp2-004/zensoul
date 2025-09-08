import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectToDatabase from '@/lib/mongodb'
import User from '@/lib/models/User'
import JournalEntry from '@/lib/models/JournalEntry'
import { analyzeJournalEntry } from '@/lib/ai'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()
    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const entries = await JournalEntry.find({ userId: user._id }).sort({ createdAt: -1 })
    return NextResponse.json({ entries }, { status: 200 })
  } catch (error) {
    console.error('API GET /journal error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { content, title, mood, tags } = await req.json()
    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    await connectToDatabase()
    let user = await User.findOne({ email: session.user.email })
    if (!user) {
      user = await User.create({
        email: session.user.email,
        password: 'hashed_password_here', // Replace with actual hashed password logic
        name: session.user.name || 'Anonymous',
      })
      console.log('New user created:', user.email)
    }

    let aiAnalysis = {}
    try {
      aiAnalysis = await analyzeJournalEntry(content) || {}
    } catch (aiError) {
      console.warn('AI analysis failed, proceeding without it:', aiError)
    }

    const entry = await JournalEntry.create({
      userId: user._id,
      content,
      title: title || '',
      mood: mood || 'neutral',
      tags: tags || [],
      aiAnalysis,
    })

    return NextResponse.json(entry, { status: 201 })
  } catch (error) {
    console.error('API POST /journal error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Record<string, string> }) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    if (!id) {
      return NextResponse.json({ error: 'Entry ID is required' }, { status: 400 })
    }

    await connectToDatabase()
    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const entry = await JournalEntry.findOneAndDelete({ _id: id, userId: user._id })
    if (!entry) {
      return NextResponse.json({ error: 'Entry not found or unauthorized' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Entry deleted successfully' }, { status: 200 })
  } catch (error) {
    console.error('API DELETE /journal error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
