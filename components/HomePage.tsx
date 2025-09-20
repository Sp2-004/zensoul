'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useTheme } from './ThemeProvider'
import { toast } from './ui/toaster'
import ElevenLabsWidget from './ElevenLabsWidget'
import TavusWidget from './TavusWidget'
import ChatBot from './ChatBot'

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
  const [activeSection, setActiveSection] = useState('home')
  const [currentTime, setCurrentTime] = useState(new Date())
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()
  const { data: session } = useSession()
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    generateAffirmation()
    // Update time every minute
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
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

  const handleNavigation = (section: string, route?: string) => {
    setActiveSection(section)
    if (route) {
      router.push(route)
    }
  }

  const startVoiceSession = () => {
    console.log('Starting ElevenLabs voice session from homepage')
    const event = new CustomEvent('startElevenLabsVoice')
    window.dispatchEvent(event)
    toast.success('Opening voice therapy session...')
    
    // Debug: Also log to console
    console.log('Event dispatched: startElevenLabsVoice')
  }

  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-slate-50 dark:from-slate-900 dark:via-gray-900 dark:to-slate-800 page-transition">
      {/* Responsive Navigation Bar */}
      <div className="fixed top-4 sm:top-8 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-6xl px-4">
        <nav className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl px-4 sm:px-8 py-3 sm:py-4 shadow-2xl border border-gray-200/50 dark:border-slate-700/50">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="text-slate-800 dark:text-white font-bold text-lg sm:text-xl">
              ZenSoul
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              <button
                onClick={() => handleNavigation('home')}
                className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${activeSection === 'home'
                  ? 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700/50'
                  }`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
                <span>Home</span>
              </button>

              <button
                onClick={() => handleNavigation('journal', '/journal')}
                className="flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 102 0V3h4v1a1 1 0 102 0V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
                <span>Journal</span>
              </button>

              <button
                onClick={() => handleNavigation('wellness', '/anxiety-guide')}
                className="flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
                <span>Wellness</span>
              </button>

              <button
                onClick={() => handleNavigation('sounds', '/relaxing-sounds')}
                className="flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
                </svg>
                <span>Sounds</span>
              </button>

              <button
                onClick={() => handleNavigation('emergency', '/emergency')}
                className="flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>Emergency</span>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
              >
                {mobileMenuOpen ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>

            {/* Theme Toggle & Sign Out */}
            <div className="flex items-center space-x-3">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all duration-200"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </button>
              <button
                onClick={handleSignOut}
                className="hidden sm:block bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Sign Out
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-4 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 dark:border-slate-700/50 overflow-hidden">
            <div className="p-4 space-y-2">
              <button
                onClick={() => {
                  handleNavigation('journal', '/journal')
                  setMobileMenuOpen(false)
                }}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 102 0V3h4v1a1 1 0 102 0V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Journal</span>
              </button>

              <button
                onClick={() => {
                  handleNavigation('wellness', '/anxiety-guide')
                  setMobileMenuOpen(false)
                }}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Wellness</span>
              </button>

              <button
                onClick={() => {
                  handleNavigation('sounds', '/relaxing-sounds')
                  setMobileMenuOpen(false)
                }}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
                </svg>
                <span className="font-medium">Sounds</span>
              </button>

              <button
                onClick={() => {
                  handleNavigation('emergency', '/emergency')
                  setMobileMenuOpen(false)
                }}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Emergency</span>
              </button>

              <div className="border-t border-gray-200 dark:border-slate-600 pt-2 mt-2">
                <button
                  onClick={() => {
                    handleSignOut()
                    setMobileMenuOpen(false)
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="font-medium">Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="pt-24 sm:pt-32 px-4 sm:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Hero Section */}
            <div className="text-center mb-12 md:mb-16 lg:mb-20">
              <div className="mb-6 md:mb-8">
                <p className="text-base md:text-lg lg:text-xl text-slate-600 dark:text-slate-300 mb-2">
                  {getGreeting()}, <span className="font-semibold text-slate-800 dark:text-white">{session?.user?.name}</span>
                </p>
                <p className="text-xs md:text-sm lg:text-base text-slate-500 dark:text-slate-400">
                  {currentTime.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-800 dark:text-white mb-3 md:mb-4 leading-tight px-4">
                Your Mental Wellness
                <span className="block animate-gradient-text mt-1">
                  Journey Continues
                </span>
              </h1>

              <p className="text-sm md:text-base lg:text-lg text-slate-600 dark:text-slate-300 max-w-xl lg:max-w-2xl mx-auto leading-relaxed px-4">
                Take a moment to breathe, reflect, and connect with your inner peace.
                Your mental health journey is unique and valuable.
              </p>
            </div>

            {/* Featured Tavus AI Companion Section */}
            <div className="mb-12 md:mb-16 lg:mb-20">
              <div className="relative bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl md:rounded-2xl lg:rounded-3xl p-4 md:p-6 lg:p-10 text-white shadow-2xl overflow-hidden animate-tavus-glow">
                {/* Background decorations */}
                <div className="absolute top-0 right-0 w-24 md:w-32 lg:w-40 h-24 md:h-32 lg:h-40 bg-white/10 rounded-full -translate-y-12 md:-translate-y-16 lg:-translate-y-20 translate-x-12 md:translate-x-16 lg:translate-x-20"></div>
                <div className="absolute bottom-0 left-0 w-20 md:w-24 lg:w-32 h-20 md:h-24 lg:h-32 bg-white/10 rounded-full translate-y-10 md:translate-y-12 lg:translate-y-16 -translate-x-10 md:-translate-x-12 lg:-translate-x-16"></div>

                <div className="relative z-10">
                  <div className="flex flex-col lg:flex-row items-center justify-between">
                    <div className="flex-1 text-center lg:text-left mb-6 lg:mb-0">
                      <div className="flex flex-col md:flex-row items-center justify-center lg:justify-start mb-4 md:mb-6">
                        <div className="w-12 md:w-14 lg:w-16 h-12 md:h-14 lg:h-16 bg-white/20 rounded-xl lg:rounded-2xl flex items-center justify-center mb-3 md:mb-0 md:mr-4 lg:mr-6 backdrop-blur-sm">
                          <svg className="w-6 md:w-7 lg:w-8 h-6 md:h-7 lg:h-8" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-xl md:text-2xl lg:text-3xl font-bold mb-2">Tavus AI Companion</h3>
                          <div className="flex items-center justify-center lg:justify-start text-indigo-100">
                            <div className="w-2 md:w-3 h-2 md:h-3 bg-pink-300 rounded-full animate-pulse mr-2 md:mr-3"></div>
                            <span className="text-xs md:text-sm lg:text-base">Interactive Video AI • Real-time</span>
                          </div>
                        </div>
                      </div>

                      <p className="text-indigo-50 mb-4 md:mb-6 lg:mb-8 text-sm md:text-base lg:text-lg leading-relaxed max-w-xl lg:max-w-2xl mx-auto lg:mx-0">
                        Experience the future of mental health support with our lifelike AI companion.
                        Engage in natural video conversations with personalized emotional intelligence.
                      </p>

                      <div className="flex flex-col md:flex-row items-center justify-center lg:justify-start space-y-3 md:space-y-0 md:space-x-4 lg:space-x-6">
                        <button
                          onClick={() => {
                            console.log('Tavus button clicked')
                            const event = new CustomEvent('openTavusWidget')
                            window.dispatchEvent(event)
                            toast.info('Opening Tavus AI...')
                          }}
                          className="w-full md:w-auto bg-white text-indigo-600 px-4 md:px-6 lg:px-8 py-3 md:py-3 lg:py-4 rounded-xl lg:rounded-2xl font-semibold hover:bg-indigo-50 btn-cool flex items-center justify-center space-x-2 md:space-x-3 shadow-lg"
                        >
                          <svg className="w-4 md:w-5 lg:w-6 h-4 md:h-5 lg:h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                          <span className="text-sm md:text-base">Start AI Session</span>
                        </button>

                        <div className="flex items-center space-x-3 md:space-x-4 text-indigo-100 text-xs md:text-sm">
                          <div className="flex items-center">
                            <svg className="w-3 md:w-4 h-3 md:h-4 mr-1 md:mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span>Real-time AI</span>
                          </div>
                          <div className="flex items-center">
                            <svg className="w-3 md:w-4 h-3 md:h-4 mr-1 md:mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Video AI</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="hidden xl:block ml-8 lg:ml-10">
                      <div className="w-28 lg:w-32 xl:w-40 h-28 lg:h-32 xl:h-40 bg-white/10 rounded-2xl lg:rounded-3xl flex items-center justify-center backdrop-blur-sm">
                        <svg className="w-14 lg:w-16 xl:w-20 h-14 lg:h-16 xl:h-20" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Assistants Grid */}
            <div className="mb-12 md:mb-16 lg:mb-20">
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white mb-3">
                  AI-Powered Support
                </h2>
                <p className="text-sm md:text-base text-slate-600 dark:text-slate-300">
                  Choose your preferred way to connect with our AI wellness assistants
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* ElevenLabs Voice Therapy */}
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-xl hover-lift">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mr-3 backdrop-blur-sm">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4z" />
                        <path d="M5.5 9.643a.75.75 0 00-1.5 0V10c0 3.06 2.29 5.585 5.25 5.954V17.5h-1.5a.75.75 0 000 1.5h4.5a.75.75 0 000-1.5h-1.5v-1.546A6.001 6.001 0 0016 10v-.357a.75.75 0 00-1.5 0V10a4.5 4.5 0 01-9 0v-.357z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">Voice Therapy</h3>
                      <p className="text-emerald-100 text-sm">ElevenLabs AI</p>
                    </div>
                  </div>
                  <p className="text-emerald-50 text-sm mb-4 leading-relaxed">
                    Natural voice conversations with advanced speech AI for therapeutic support and guidance.
                  </p>
                  <div className="space-y-2">
                    <button
                      onClick={startVoiceSession}
                      className="w-full bg-white/20 hover:bg-white/30 text-white py-2 px-4 rounded-lg font-medium transition-colors backdrop-blur-sm"
                    >
                      Start Voice Session
                    </button>
                    <button
                      onClick={() => {
                        console.log('Direct ElevenLabs test button clicked')
                        const event = new CustomEvent('startElevenLabsVoice')
                        window.dispatchEvent(event)
                        toast.info('Debug: ElevenLabs event dispatched')
                      }}
                      className="w-full bg-white/10 hover:bg-white/20 text-white py-1 px-3 rounded text-xs transition-colors backdrop-blur-sm"
                    >
                      🔧 Test ElevenLabs
                    </button>
                  </div>
                </div>

                {/* Text Chat Assistant */}
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl hover-lift">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mr-3 backdrop-blur-sm">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">Chat Assistant</h3>
                      <p className="text-blue-100 text-sm">Text-based AI</p>
                    </div>
                  </div>
                  <p className="text-blue-50 text-sm mb-4 leading-relaxed">
                    Instant text-based support for quick questions, mood tracking, and mental health guidance.
                  </p>
                  <button
                    onClick={() => {
                      const event = new CustomEvent('openChatBot')
                      window.dispatchEvent(event)
                    }}
                    className="w-full bg-white/20 hover:bg-white/30 text-white py-2 px-4 rounded-lg font-medium transition-colors backdrop-blur-sm"
                  >
                    Open Chat
                  </button>
                </div>
              </div>
            </div>

            {/* Daily Affirmation */}
            <div className="mb-12 md:mb-16 lg:mb-20">
              <div className="bg-white dark:bg-slate-800 rounded-xl md:rounded-2xl lg:rounded-3xl shadow-xl p-4 md:p-6 lg:p-10 border border-gray-100 dark:border-slate-700">
                <div className="text-center">
                  <div className="inline-flex items-center px-3 md:px-4 lg:px-6 py-2 md:py-2 lg:py-3 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-xl lg:rounded-2xl text-xs md:text-sm font-medium mb-4 md:mb-6 lg:mb-8">
                    <svg className="w-3 md:w-4 lg:w-5 h-3 md:h-4 lg:h-5 mr-2 md:mr-2 lg:mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Today's Personal Affirmation
                  </div>

                  <div className="text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold text-slate-800 dark:text-white mb-6 md:mb-8 lg:mb-10 min-h-[3rem] md:min-h-[4rem] lg:min-h-[5rem] flex items-center justify-center px-4">
                    {loading ? (
                      <div className="animate-pulse text-slate-400 text-base md:text-lg lg:text-xl">Loading your personalized affirmation...</div>
                    ) : (
                      <span className="leading-relaxed text-center max-w-2xl md:max-w-3xl lg:max-w-4xl">{affirmation}</span>
                    )}
                  </div>

                  <button
                    onClick={nextAffirmation}
                    disabled={loading}
                    className="w-full md:w-auto bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 md:px-6 lg:px-10 py-3 md:py-3 lg:py-4 rounded-xl lg:rounded-2xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 md:space-x-3 mx-auto shadow-lg hover:shadow-xl"
                  >
                    <svg className="w-4 md:w-5 lg:w-6 h-4 md:h-5 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span className="text-sm md:text-base">Generate New Affirmation</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Wellness Journey */}
            <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-xl md:rounded-2xl lg:rounded-3xl p-4 md:p-6 lg:p-8 text-white shadow-lg">
              <div className="flex flex-col lg:flex-row items-center justify-between">
                <div className="flex-1 text-center lg:text-left mb-4 lg:mb-0">
                  <h3 className="text-xl md:text-2xl lg:text-3xl font-bold mb-3 md:mb-4">Your Wellness Journey</h3>
                  <p className="text-amber-100 mb-4 md:mb-6 lg:mb-8 text-sm md:text-base lg:text-lg leading-relaxed">
                    Every step you take towards better mental health matters.
                    Track your progress and celebrate your growth.
                  </p>
                  <button
                    onClick={() => handleNavigation('journal', '/journal')}
                    className="w-full md:w-auto bg-white text-amber-600 px-4 md:px-6 lg:px-8 py-3 md:py-3 lg:py-4 rounded-xl lg:rounded-2xl font-semibold hover:bg-amber-50 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    View Your Progress
                  </button>
                </div>
                <div className="hidden lg:block ml-6 lg:ml-8 text-4xl lg:text-6xl xl:text-8xl opacity-20">
                  📈
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* AI Assistants */}
        <TavusWidget />
        <ElevenLabsWidget />
        <ChatBot />
      </div>
  )
}
