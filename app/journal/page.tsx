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
  'very-sad': 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800',
  'sad': 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800',
  'neutral': 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-700/20 dark:text-gray-300 dark:border-gray-600',
  'happy': 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800',
  'very-happy': 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800',
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
      neutral: 'text-slate-600 dark:text-slate-400',
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-slate-50 dark:from-slate-900 dark:via-gray-900 dark:to-slate-800">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-300">Loading your journal...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-slate-50 dark:from-slate-900 dark:via-gray-900 dark:to-slate-800">
      {/* Navigation */}
      <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50">
        <nav className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl px-8 py-4 shadow-2xl border border-gray-200/50 dark:border-slate-700/50">
          <div className="flex items-center space-x-8">
            <div className="text-slate-800 dark:text-white font-bold text-xl">ZenSoul</div>
            <div className="flex items-center space-x-6">
              <button
                onClick={() => router.push('/')}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
                </svg>
                <span>Home</span>
              </button>
              <div className="bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white px-4 py-2 rounded-xl text-sm font-medium shadow-sm">
                <svg className="w-4 h-4 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 102 0V3h4v1a1 1 0 102 0V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
                </svg>
                Journal
              </div>
            </div>
          </div>
        </nav>
      </div>

      <div className="pt-32 px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mb-4">
              Your Personal
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 mt-1">
                Journal
              </span>
            </h1>
            <p className="text-base md:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Track your thoughts and emotions with AI-powered insights that help you understand patterns and grow.
            </p>
          </div>

          {/* Search */}
          <div className="mb-12">
            <div className="relative max-w-2xl mx-auto">
              <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <input
                type="text"
                placeholder="Search your entries, keywords, or feelings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800 dark:text-white placeholder-slate-400 shadow-lg"
              />
            </div>
          </div>

          {/* New Entry Form */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 mb-12 border border-gray-100 dark:border-slate-700">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl mr-4">
                ✍️
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">New Journal Entry</h2>
                <p className="text-sm text-slate-600 dark:text-slate-300">Express your thoughts and feelings</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <input
                  type="text"
                  placeholder="Give your entry a title (optional)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800 dark:text-white placeholder-slate-400"
                />
              </div>
              
              <div className="flex items-center space-x-6">
                <label className="text-base font-medium text-slate-700 dark:text-slate-300">
                  How are you feeling today?
                </label>
                <select
                  value={mood}
                  onChange={(e) => setMood(e.target.value)}
                  className="px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800 dark:text-white"
                >
                  <option value="very-sad">😢 Very Sad</option>
                  <option value="sad">😔 Sad</option>
                  <option value="neutral">😐 Neutral</option>
                  <option value="happy">😊 Happy</option>
                  <option value="very-happy">😄 Very Happy</option>
                </select>
              </div>

              <textarea
                placeholder="What's on your mind today? Share your thoughts, feelings, experiences, or anything you'd like to reflect on..."
                value={newEntry}
                onChange={(e) => setNewEntry(e.target.value)}
                rows={8}
                className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800 dark:text-white placeholder-slate-400 resize-none"
              />
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading || !newEntry.trim()}
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 font-semibold shadow-lg hover:shadow-xl flex items-center space-x-3"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Analyzing & Saving...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                      </svg>
                      <span>Save Entry</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Entries List */}
          <div className="space-y-8">
            {filteredEntries.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-24 h-24 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-3">
                  {searchTerm ? 'No matching entries found' : 'Your journal is waiting'}
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-lg">
                  {searchTerm ? 'Try a different search term or create a new entry' : 'Start writing your first entry to begin your wellness journey'}
                </p>
              </div>
            ) : (
              filteredEntries.map((entry) => (
                <div key={entry._id} className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg hover:shadow-2xl p-8 border border-gray-100 dark:border-slate-700 transition-all duration-300 transform hover:scale-[1.02]">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-3">
                        {entry.title && (
                          <h3 className="text-2xl font-bold text-slate-800 dark:text-white">
                            {entry.title}
                          </h3>
                        )}
                        <span className={`px-4 py-2 rounded-2xl text-sm font-medium border ${moodColors[entry.mood as keyof typeof moodColors]}`}>
                          {moodEmojis[entry.mood as keyof typeof moodEmojis]} {entry.mood.replace('-', ' ')}
                        </span>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 text-sm">
                        {new Date(entry.createdAt).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setSelectedEntry(entry)}
                        className="p-3 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all duration-200"
                        aria-label="View details"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => deleteEntry(entry._id)}
                        className="p-3 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200"
                        aria-label="Delete entry"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <p className="text-slate-700 dark:text-slate-300 mb-6 text-lg leading-relaxed line-clamp-4">
                    {entry.content}
                  </p>

                  {entry.aiAnalysis && (
                    <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-slate-800 dark:text-white flex items-center">
                          <svg className="w-5 h-5 mr-2 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                          </svg>
                          AI Analysis
                        </h4>
                        <div className="flex items-center space-x-4 text-sm">
                          <span className={`font-medium ${getSentimentColor(entry.aiAnalysis.sentiment)}`}>
                            {entry.aiAnalysis.sentiment}
                          </span>
                          <span className={`font-medium ${getRiskLevelColor(entry.aiAnalysis.riskLevel)}`}>
                            {entry.aiAnalysis.riskLevel} risk
                          </span>
                        </div>
                      </div>
                      
                      {entry.aiAnalysis.keywords.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {entry.aiAnalysis.keywords.slice(0, 6).map((keyword, index) => (
                            <span key={index} className="bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full text-sm font-medium border border-purple-200 dark:border-purple-800">
                              {keyword}
                            </span>
                          ))}
                          {entry.aiAnalysis.keywords.length > 6 && (
                            <span className="text-slate-500 dark:text-slate-400 text-sm px-3 py-1">
                              +{entry.aiAnalysis.keywords.length - 6} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Entry Detail Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-1">
                    {selectedEntry.title || 'Journal Entry'}
                  </h3>
                  <p className="text-blue-100">
                    {new Date(selectedEntry.createdAt).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedEntry(null)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-8 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="mb-6">
                <span className={`px-4 py-2 rounded-2xl text-sm font-medium border ${moodColors[selectedEntry.mood as keyof typeof moodColors]}`}>
                  {moodEmojis[selectedEntry.mood as keyof typeof moodEmojis]} {selectedEntry.mood.replace('-', ' ')}
                </span>
              </div>

              <div className="prose dark:prose-invert max-w-none mb-8">
                <p className="text-lg leading-relaxed whitespace-pre-wrap text-slate-700 dark:text-slate-300">
                  {selectedEntry.content}
                </p>
              </div>

              {selectedEntry.aiAnalysis && (
                <div className="border-t border-slate-200 dark:border-slate-700 pt-8">
                  <h4 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center">
                    <svg className="w-6 h-6 mr-3 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    AI Analysis & Insights
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-slate-50 dark:bg-slate-700 p-6 rounded-2xl">
                      <h5 className="font-semibold text-slate-800 dark:text-white mb-2">Emotional Sentiment</h5>
                      <span className={`text-lg font-bold ${getSentimentColor(selectedEntry.aiAnalysis.sentiment)}`}>
                        {selectedEntry.aiAnalysis.sentiment.charAt(0).toUpperCase() + selectedEntry.aiAnalysis.sentiment.slice(1)}
                      </span>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-700 p-6 rounded-2xl">
                      <h5 className="font-semibold text-slate-800 dark:text-white mb-2">Risk Assessment</h5>
                      <span className={`text-lg font-bold ${getRiskLevelColor(selectedEntry.aiAnalysis.riskLevel)}`}>
                        {selectedEntry.aiAnalysis.riskLevel.charAt(0).toUpperCase() + selectedEntry.aiAnalysis.riskLevel.slice(1)} Risk
                      </span>
                    </div>
                  </div>

                  {selectedEntry.aiAnalysis.keywords.length > 0 && (
                    <div className="mb-8">
                      <h5 className="font-semibold text-slate-800 dark:text-white mb-4">Key Themes & Topics</h5>
                      <div className="flex flex-wrap gap-3">
                        {selectedEntry.aiAnalysis.keywords.map((keyword, index) => (
                          <span key={index} className="bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 px-4 py-2 rounded-xl font-medium border border-purple-200 dark:border-purple-800">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedEntry.aiAnalysis.suggestions.length > 0 && (
                    <div>
                      <h5 className="font-semibold text-slate-800 dark:text-white mb-4">Personalized Suggestions</h5>
                      <div className="space-y-3">
                        {selectedEntry.aiAnalysis.suggestions.map((suggestion, index) => (
                          <div key={index} className="flex items-start space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                            <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                            </svg>
                            <p className="text-blue-800 dark:text-blue-200">{suggestion}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Support Modal */}
      {showSupportModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-8 max-w-md w-full">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"/>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
                We're Here for You
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                I noticed you might be going through a difficult time. Would you like to connect with support resources?
              </p>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => {
                  setShowSupportModal(false)
                  router.push('/emergency')
                }}
                className="w-full px-6 py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-semibold transition-all duration-200 transform hover:scale-105"
              >
                Emergency Support
              </button>
              <button
                onClick={() => {
                  setShowSupportModal(false)
                  router.push('/anxiety-guide')
                }}
                className="w-full px-6 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl font-semibold transition-all duration-200 transform hover:scale-105"
              >
                Anxiety & Coping Guide
              </button>
              <button
                onClick={() => setShowSupportModal(false)}
                className="w-full px-6 py-4 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white rounded-2xl font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 transition-all duration-200"
              >
                Not Right Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}