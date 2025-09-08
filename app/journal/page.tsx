'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from '@/components/ui/toaster'

interface JournalEntry {
  _id: string
  title: string
  content: string
  mood: string
  aiAnalysis: {
    sentiment: string
    keywords: string[]
    suggestions: string[]
    riskLevel: string
    needsSupport?: boolean
  }
  createdAt: string
  updatedAt: string
}

const moodEmojis = {
  'very-sad': '😢',
  'sad': '😔',
  'neutral': '😐',
  'happy': '😊',
  'very-happy': '😄'
}

const moodColors = {
  'very-sad': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  'sad': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  'neutral': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  'happy': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  'very-happy': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
}

export default function JournalPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [newEntry, setNewEntry] = useState('')
  const [title, setTitle] = useState('')
  const [mood, setMood] = useState('neutral')
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [showSupportModal, setShowSupportModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
      return
    }
    if (session) {
      fetchEntries()
    }
  }, [session, status, router])

  const fetchEntries = async () => {
    try {
      setFetchLoading(true)
      const response = await fetch('/api/journal')
      if (response.ok) {
        const data = await response.json()
        setEntries(data.entries || [])
      } else {
        throw new Error('Failed to fetch entries')
      }
    } catch (error) {
      console.error('Failed to fetch entries:', error)
      toast.error('Failed to load journal entries')
    } finally {
      setFetchLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newEntry.trim()) {
      toast.error('Please write something in your journal')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newEntry,
          title: title || undefined,
          mood,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        
        if (data.needsSupport) {
          setShowSupportModal(true)
        }

        setNewEntry('')
        setTitle('')
        setMood('neutral')
        await fetchEntries()
        toast.success('Journal entry saved successfully!')
      } else {
        throw new Error('Failed to save entry')
      }
    } catch (error) {
      console.error('Failed to create entry:', error)
      toast.error('Failed to save journal entry')
    } finally {
      setLoading(false)
    }
  }

  const deleteEntry = async (entryId: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return

    try {
      const response = await fetch(`/api/journal/${entryId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchEntries()
        toast.success('Entry deleted successfully')
      } else {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete entry')
      }
    } catch (error) {
      console.error('Failed to delete entry:', error)
      toast.error('Failed to delete entry')
    }
  }

  const getSentimentColor = (sentiment: string) => {
    const colors = {
      positive: 'text-green-600 dark:text-green-400',
      neutral: 'text-gray-600 dark:text-gray-400',
      negative: 'text-orange-600 dark:text-orange-400',
      concerning: 'text-red-600 dark:text-red-400',
    }
    return colors[sentiment as keyof typeof colors] || colors.neutral
  }

  const getRiskLevelColor = (riskLevel: string) => {
    const colors = {
      low: 'text-green-600 dark:text-green-400',
      medium: 'text-yellow-600 dark:text-yellow-400',
      high: 'text-red-600 dark:text-red-400',
    }
    return colors[riskLevel as keyof typeof colors] || colors.low
  }

  const filteredEntries = entries.filter(entry =>
    entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.aiAnalysis?.keywords?.some(keyword => 
      keyword.toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  if (status === 'loading' || fetchLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-violet-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Your Journal
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Track your thoughts and emotions with AI-powered insights
            </p>
          </div>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors"
          >
            Back to Home
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search your entries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          />
        </div>

        {/* New Entry Form */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-8 border border-white/20">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            New Journal Entry
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Entry title (optional)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                How are you feeling?
              </label>
              <select
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="very-sad">😢 Very Sad</option>
                <option value="sad">😔 Sad</option>
                <option value="neutral">😐 Neutral</option>
                <option value="happy">😊 Happy</option>
                <option value="very-happy">😄 Very Happy</option>
              </select>
            </div>

            <textarea
              placeholder="What's on your mind today? Share your thoughts, feelings, or experiences..."
              value={newEntry}
              onChange={(e) => setNewEntry(e.target.value)}
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none"
            />
            
            <button
              type="submit"
              disabled={loading || !newEntry.trim()}
              className="px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-lg hover:from-violet-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Analyzing...
                </div>
              ) : (
                'Save Entry'
              )}
            </button>
          </form>
        </div>

        {/* Entries List */}
        <div className="space-y-6">
          {filteredEntries.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {searchTerm ? 'No matching entries found' : 'No journal entries yet'}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {searchTerm ? 'Try a different search term' : 'Start writing your first entry above'}
              </p>
            </div>
          ) : (
            filteredEntries.map((entry) => (
              <div key={entry._id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 hover:shadow-2xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {entry.title && (
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {entry.title}
                      </h3>
                    )}
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${moodColors[entry.mood as keyof typeof moodColors]}`}>
                      {moodEmojis[entry.mood as keyof typeof moodEmojis]} {entry.mood.replace('-', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(entry.createdAt).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => setSelectedEntry(entry)}
                      className="text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
                      aria-label="View details"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => deleteEntry(entry._id)}
                      className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      aria-label="Delete entry"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                <p className="text-gray-700 dark:text-gray-300 mb-4 whitespace-pre-wrap line-clamp-3">
                  {entry.content}
                </p>

                {entry.aiAnalysis && (
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <div className="flex items-center space-x-4 mb-2 text-sm">
                      <span className={`font-medium ${getSentimentColor(entry.aiAnalysis.sentiment)}`}>
                        Sentiment: {entry.aiAnalysis.sentiment}
                      </span>
                      <span className={`font-medium ${getRiskLevelColor(entry.aiAnalysis.riskLevel)}`}>
                        Risk: {entry.aiAnalysis.riskLevel}
                      </span>
                    </div>
                    
                    {entry.aiAnalysis.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {entry.aiAnalysis.keywords.slice(0, 5).map((keyword, index) => (
                          <span key={index} className="inline-block bg-violet-100 dark:bg-violet-800 text-violet-700 dark:text-violet-200 px-2 py-1 rounded text-xs">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Entry Detail Modal */}
        {selectedEntry && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {selectedEntry.title || 'Journal Entry'}
                </h3>
                <button
                  onClick={() => setSelectedEntry(null)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${moodColors[selectedEntry.mood as keyof typeof moodColors]}`}>
                  {moodEmojis[selectedEntry.mood as keyof typeof moodEmojis]} {selectedEntry.mood.replace('-', ' ')}
                </span>
                <span className="ml-4 text-sm text-gray-500 dark:text-gray-400">
                  {new Date(selectedEntry.createdAt).toLocaleString()}
                </span>
              </div>

              <div className="prose dark:prose-invert max-w-none mb-6">
                <p className="whitespace-pre-wrap">{selectedEntry.content}</p>
              </div>

              {selectedEntry.aiAnalysis && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">AI Analysis</h4>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Sentiment:</span>
                      <span className={`ml-2 font-medium ${getSentimentColor(selectedEntry.aiAnalysis.sentiment)}`}>
                        {selectedEntry.aiAnalysis.sentiment}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Risk Level:</span>
                      <span className={`ml-2 font-medium ${getRiskLevelColor(selectedEntry.aiAnalysis.riskLevel)}`}>
                        {selectedEntry.aiAnalysis.riskLevel}
                      </span>
                    </div>
                  </div>

                  {selectedEntry.aiAnalysis.keywords.length > 0 && (
                    <div className="mb-4">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-2">Keywords:</span>
                      <div className="flex flex-wrap gap-2">
                        {selectedEntry.aiAnalysis.keywords.map((keyword, index) => (
                          <span key={index} className="bg-violet-100 dark:bg-violet-800 text-violet-700 dark:text-violet-200 px-2 py-1 rounded text-sm">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedEntry.aiAnalysis.suggestions.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-2">AI Suggestions:</span>
                      <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        {selectedEntry.aiAnalysis.suggestions.map((suggestion, index) => (
                          <li key={index}>{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Support Modal */}
        {showSupportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                We're Here for You 💙
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                I noticed you might be going through a difficult time. Would you like to connect with support resources or emergency contacts?
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={() => {
                    setShowSupportModal(false)
                    router.push('/emergency')
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Emergency Contacts
                </button>
                <button
                  onClick={() => {
                    setShowSupportModal(false)
                    router.push('/anxiety-guide')
                  }}
                  className="flex-1 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
                >
                  Anxiety Guide
                </button>
                <button
                  onClick={() => setShowSupportModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Not Now
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}