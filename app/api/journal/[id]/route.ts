import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectToDatabase from '@/lib/mongodb'
import User from '@/lib/models/User'
import JournalEntry from '@/lib/models/JournalEntry'

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = await params
    const { id } = resolvedParams
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
    console.error('API DELETE /journal/[id] error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
