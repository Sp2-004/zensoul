'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

interface Track {
  title: string
  description: string
  youtube: string
  unavailable?: boolean
}

interface SoundGroup {
  section: string
  tracks: Track[]
}

const defaultSounds: SoundGroup[] = [
  {
    section: "Ocean & Water Sounds",
    tracks: [
      {
        title: "Calm Ocean Waves",
        description: "Gentle ocean waves for deep relaxation and sleep.",
        youtube: "https://www.youtube.com/watch?v=1ZYbU82GVz4"
      },
      {
        title: "Peaceful Rain",
        description: "Soft rainfall sounds to ease stress and anxiety.",
        youtube: "https://www.youtube.com/watch?v=OdIJ2x3nxzQ"
      }
    ]
  },
  {
    section: "Nature & Forest",
    tracks: [
      {
        title: "Forest Ambience",
        description: "Birds chirping and gentle forest sounds for mindfulness.",
        youtube: "https://www.youtube.com/watch?v=OdIJ2x3nxzQ"
      },
      {
        title: "Mountain Stream",
        description: "Flowing water and nature sounds for concentration.",
        youtube: "https://www.youtube.com/watch?v=1ZYbU82GVz4"
      }
    ]
  },
  {
    section: "Instrumental & Piano",
    tracks: [
      {
        title: "Peaceful Piano",
        description: "Soothing piano melodies for relaxation and study.",
        youtube: "https://www.youtube.com/watch?v=4D9G9bD4zQk"
      },
      {
        title: "Ambient Meditation",
        description: "Calming ambient music for meditation and yoga.",
        youtube: "https://www.youtube.com/watch?v=2OEL4P1Rz04"
      }
    ]
  }
]

const sadStressedFallback: SoundGroup[] = [
  {
    section: "Comfort & Healing",
    tracks: [
      {
        title: "Gentle Rain for Healing",
        description: "Soft rain sounds to comfort and heal emotional stress.",
        youtube: "https://www.youtube.com/watch?v=1ZYbU82GVz4"
      },
      {
        title: "Therapeutic Piano",
        description: "Gentle piano melodies for emotional comfort and peace.",
        youtube: "https://www.youtube.com/watch?v=4D9G9bD4zQk"
      }
    ]
  }
]

function getYouTubeVideoId(url: string) {
  const regExp = /(?:youtube\.com\/.*(?:\?|&)v=|youtube\.com\/embed\/|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/
  const match = url.match(regExp)
  if (match && match[1]) return match[1]
  try {
    const u = new URL(url)
    return u.searchParams.get("v") || ""
  } catch {
    return ""
  }
}

const isVideoAvailable = async (url: string): Promise<boolean> => {
  try {
    const videoId = getYouTubeVideoId(url)
    if (!videoId) return false
    const thumbnailResponse = await fetch(`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`)
    return thumbnailResponse.ok
  } catch (error) {
    console.error(`Error checking availability for ${url}:`, error)
    return false
  }
}

const cleanJsonResponse = (response: string): string => {
  let cleaned = response.replace(/```json\s*|\s*```|\n/g, '').trim()
  cleaned = cleaned.replace(/^\s+|\s+$/g, '')
  return cleaned
}

const callGeminiAPI = async (prompt: string) => {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY_HERE'
  const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'
  const body = {
    contents: [
      {
        parts: [
          { text: prompt }
        ]
      }
    ]
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': apiKey
      },
      body: JSON.stringify(body)
    })
    const data = await response.json()
    if (data.error) {
      return `Error: ${data.error.message || 'Unknown API error'}`
    }
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response text available.'
    return cleanJsonResponse(text)
  } catch (error) {
    console.error('Error calling Gemini API:', error)
    return 'Sorry, there was an error getting the AI response.'
  }
}

export default function RelaxingSoundsPage() {
  const [userMood, setUserMood] = useState('')
  const [sounds, setSounds] = useState<SoundGroup[]>(defaultSounds)
  const [aiRecommendation, setAiRecommendation] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null)
  const router = useRouter()

  const filterAvailableSounds = async (soundsData: SoundGroup[]): Promise<SoundGroup[]> => {
    const updatedSounds = await Promise.all(soundsData.map(async (group) => ({
      ...group,
      tracks: await Promise.all(group.tracks.map(async (track) => {
        const isAvailable = await isVideoAvailable(track.youtube)
        return isAvailable ? track : { ...track, unavailable: true }
      }))
    })))
    return updatedSounds.filter(group => group.tracks.length > 0)
  }

  useEffect(() => {
    const checkDefaultSounds = async () => {
      const availableSounds = await filterAvailableSounds(defaultSounds)
      setSounds(availableSounds.length > 0 ? availableSounds : defaultSounds)
    }
    checkDefaultSounds()
  }, [])

  const getAiSounds = async () => {
    if (!userMood.trim()) return
    setIsLoading(true)
    setAiRecommendation('')

    const prompt = `Based on the user's mood/preference: "${userMood}". Create 2-3 categories of relaxing sounds with 2-3 tracks each. Focus on sounds that help with ${userMood}. Return a JSON array of categories with "section" and "tracks". Each track needs "title", "description", and "youtube" (valid YouTube URL). Example:
[
  {
    "section": "Ocean Sounds",
    "tracks": [
      {
        "title": "Gentle Waves",
        "description": "Soothing ocean waves for relaxation.",
        "youtube": "https://www.youtube.com/watch?v=1ZYbU82GVz4"
      }
    ]
  }
]`

    const response = await callGeminiAPI(prompt)
    try {
      const parsed: SoundGroup[] = JSON.parse(response)
      if (Array.isArray(parsed) && parsed.length > 0) {
        const availableSounds = await filterAvailableSounds(parsed)
        if (availableSounds.length === 0 && (userMood.toLowerCase().includes('sad') || userMood.toLowerCase().includes('stressed'))) {
          setSounds(sadStressedFallback)
          setAiRecommendation('Using curated sounds for emotional support.')
        } else {
          setSounds(availableSounds.length > 0 ? availableSounds : parsed)
          setAiRecommendation('AI-curated sounds loaded successfully!')
        }
      } else {
        setAiRecommendation('Using default sounds collection.')
        setSounds(defaultSounds)
      }
    } catch (error) {
      console.error('Error parsing AI response:', error)
      setAiRecommendation('Using default sounds collection.')
      setSounds(defaultSounds)
    }
    setIsLoading(false)
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
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
                <span>Home</span>
              </button>
              <div className="bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white px-4 py-2 rounded-xl text-sm font-medium shadow-sm">
                <svg className="w-4 h-4 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
                </svg>
                Relaxing Sounds
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
              AI-Curated
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 mt-1">
                Relaxing Sounds
              </span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              Discover personalized soundscapes designed to promote relaxation, focus, and inner peace based on your current mood.
            </p>
          </div>

          {/* AI Mood Input */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 mb-12 border border-gray-100 dark:border-slate-700">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center text-white text-2xl mr-4">
                🎵
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Personalized Sound Selection</h2>
                <p className="text-slate-600 dark:text-slate-300">Tell me your mood or what you need sounds for</p>
              </div>
            </div>

            <div className="flex gap-4">
              <input
                className="flex-1 px-6 py-4 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800 dark:text-white placeholder-slate-400"
                placeholder="E.g., feeling stressed, need focus music, want ocean sounds for sleep..."
                value={userMood}
                onChange={(e) => setUserMood(e.target.value)}
              />
              <motion.button
                className="px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-2xl font-semibold disabled:opacity-50 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={getAiSounds}
                disabled={isLoading || !userMood.trim()}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Curating...</span>
                  </div>
                ) : (
                  'Get AI Sounds'
                )}
              </motion.button>
            </div>

            {aiRecommendation && (
              <motion.div
                className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-2xl border border-purple-200 dark:border-purple-800"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center space-x-2 text-purple-800 dark:text-purple-200">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span className="font-semibold">Status:</span>
                  <span>{aiRecommendation}</span>
                </div>
              </motion.div>
            )}
          </div>

          {/* Sound Categories */}
          <div className="space-y-12">
            {sounds.map((group, idx) => (
              <motion.section
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-slate-700"
              >
                <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-8 text-center">
                  {group.section}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {group.tracks.map((track, tIdx) => {
                    const videoId = getYouTubeVideoId(track.youtube)
                    const isPlaying = currentlyPlaying === track.youtube

                    return (
                      <motion.div
                        key={tIdx}
                        className="group relative bg-slate-50 dark:bg-slate-700 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                        whileHover={{ y: -5 }}
                      >
                        {/* Thumbnail */}
                        <div className="relative aspect-video bg-slate-200 dark:bg-slate-600 overflow-hidden">
                          {videoId ? (
                            <img
                              src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                              alt={`${track.title} thumbnail`}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              onError={(e) => {
                                e.currentTarget.src = '/placeholder-image.jpg'
                                e.currentTarget.alt = `${track.title} thumbnail unavailable`
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <svg className="w-16 h-16 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
                              </svg>
                            </div>
                          )}

                          {/* Play overlay */}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
                              <svg className="w-8 h-8 text-slate-800 ml-1" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                              </svg>
                            </div>
                          </div>

                          {/* Status indicators */}
                          {track.unavailable && (
                            <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                              Unavailable
                            </div>
                          )}

                          {isPlaying && (
                            <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center">
                              <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-2"></div>
                              Playing
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="p-6">
                          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
                            {track.title}
                          </h3>
                          <p className="text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
                            {track.description}
                          </p>

                          <a
                            href={track.youtube}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => setCurrentlyPlaying(track.youtube)}
                            className="inline-flex items-center space-x-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                            aria-label={`Listen to ${track.title} on YouTube`}
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                            </svg>
                            <span>Listen on YouTube</span>
                          </a>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </motion.section>
            ))}
          </div>

          {/* Tips Section */}
          <div className="mt-16 bg-gradient-to-r from-blue-500 via-purple-500 to-teal-500 rounded-3xl p-8 text-white">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-4">Tips for Better Relaxation</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    🎧
                  </div>
                  <h4 className="font-semibold mb-2">Use Headphones</h4>
                  <p className="text-blue-100 text-sm">For the best immersive experience, use quality headphones or earbuds.</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    🌙
                  </div>
                  <h4 className="font-semibold mb-2">Create Ambiance</h4>
                  <p className="text-blue-100 text-sm">Dim the lights and find a comfortable position for maximum relaxation.</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    ⏰
                  </div>
                  <h4 className="font-semibold mb-2">Set a Timer</h4>
                  <p className="text-blue-100 text-sm">Use a gentle timer if you're using sounds for sleep or meditation.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}