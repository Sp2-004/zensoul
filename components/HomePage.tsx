'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import ChatBot from './ChatBot'
import ElevenLabsWidget from './ElevenLabsWidget'
import { useTheme } from './ThemeProvider'
import { toast } from './ui/toaster'

const affirmations = [
  "I am strong and capable of handling anything that comes my way.",
  "I am worthy of love, respect, and all good things in life.",
  "Each breath I take helps me feel calmer and more centered.",
  "This feeling is temporary, and I have the strength to get through it.",
  "I trust myself to make the right decisions for my wellbeing.",
  "I am doing my best, and that is more than enough."
]

export default function HomePage() {
  const [affirmation, setAffirmation] = useState('')
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { data: session } = useSession()
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    generateAffirmation()
  }, [])

  const generateAffirmation = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/ai/affirmation')
      if (response.ok) {
        const data = await response.json()
        setAffirmation(data.affirmation)
      } else {
        throw new Error('Failed to fetch affirmation')
      }
    } catch (error) {
      console.error('Affirmation error:', error)
      setAffirmation(affirmations[Math.floor(Math.random() * affirmations.length)])
    } finally {
      setLoading(false)
    }
  }

  const nextAffirmation = async () => {
    await generateAffirmation()
    toast.success('New affirmation generated!')
  }

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    toast.info('Signed out successfully')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-violet-200 dark:bg-violet-800 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-200 dark:bg-pink-800 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-70 animate-pulse"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 flex justify-between items-center p-6">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-violet-600 dark:text-violet-300">
            ZenSoul
          </h1>
          <span className="text-sm text-gray-600 dark:text-gray-300">
            Welcome, {session?.user?.name}
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? '🌞' : '🌙'}
          </button>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-4xl">
          {/* App Title */}
          <div className="text-center mb-12">
            <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-pink-600 dark:from-violet-300 dark:to-pink-300 select-none drop-shadow-lg mb-4">
              ZenSoul
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Your AI-powered mental wellness companion
            </p>
          </div>

          {/* Affirmation Card */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-12 text-center border border-white/20">
            <div className="mb-4">
              <span className="inline-block px-3 py-1 bg-violet-100 dark:bg-violet-800 text-violet-800 dark:text-violet-200 rounded-full text-sm font-medium">
                Daily Affirmation
              </span>
            </div>
            <div className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100 min-h-[3rem] flex items-center justify-center">
              {loading ? (
                <div className="animate-pulse">Loading your personalized affirmation...</div>
              ) : (
                affirmation
              )}
            </div>
            <button
              onClick={nextAffirmation}
              disabled={loading}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-full hover:from-violet-600 hover:to-purple-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Generate new affirmation"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              New Affirmation
            </button>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => router.push('/journal')}
              className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 text-left border border-white/20 hover:shadow-2xl transition-all transform hover:scale-105"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-2xl mr-4">
                  📝
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 group-hover:text-violet-600 dark:group-hover:text-violet-300 transition-colors">
                    Smart Journal
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    AI-powered insights and mood tracking
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => router.push('/anxiety-guide')}
              className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 text-left border border-white/20 hover:shadow-2xl transition-all transform hover:scale-105"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-rose-500 to-pink-600 rounded-xl flex items-center justify-center text-white text-2xl mr-4">
                  🧘
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 group-hover:text-rose-600 dark:group-hover:text-rose-300 transition-colors">
                    Anxiety Guide
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Breathing exercises and grounding techniques
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => router.push('/relaxing-sounds')}
              className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 text-left border border-white/20 hover:shadow-2xl transition-all transform hover:scale-105"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center text-white text-2xl mr-4">
                  🎵
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors">
                    Relaxing Sounds
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Curated music for relaxation and focus
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => router.push('/emergency')}
              className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 text-left border border-white/20 hover:shadow-2xl transition-all transform hover:scale-105"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-600 rounded-xl flex items-center justify-center text-white text-2xl mr-4">
                  🚨
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 group-hover:text-red-600 dark:group-hover:text-red-300 transition-colors">
                    Emergency Support
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Quick access to crisis resources
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </main>

      {/* AI Assistants */}
      <ChatBot />
      <ElevenLabsWidget />
    </div>
  )
}