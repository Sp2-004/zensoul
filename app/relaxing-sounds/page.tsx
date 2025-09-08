'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

// Define interfaces for type safety
interface Track {
  title: string
  description: string
  youtube: string
  unavailable?: boolean // Optional property for unavailable videos
}

interface SoundGroup {
  section: string
  tracks: Track[]
}

const defaultSounds: SoundGroup[] = [
  {
    section: "Relaxing Sounds",
    tracks: [
      {
        title: "Calm Ocean Waves",
        description: "Gentle ocean waves for relaxation.",
        youtube: "https://www.youtube.com/watch?v=1ZYbU82GVz4"
      },
      {
        title: "Nature Sounds",
        description: "Rain, birds, and nature ambiance.",
        youtube: "https://www.youtube.com/watch?v=OdIJ2x3nxzQ"
      }
    ]
  },
  {
    section: "Relaxing Piano Music",
    tracks: [
      {
        title: "Piano Relaxation",
        description: "Soothing piano for peace and sleep.",
        youtube: "https://www.youtube.com/watch?v=4D9G9bD4zQk"
      }
    ]
  },
  {
    section: "Meditation Music",
    tracks: [
      {
        title: "Calm Meditation",
        description: "Ambient music for meditation.",
        youtube: "https://www.youtube.com/watch?v=2OEL4P1Rz04"
      }
    ]
  },
  {
    section: "Forest Sounds",
    tracks: [
      {
        title: "Nature Meditation",
        description: "Forest ambience for focus and mindfulness.",
        youtube: "https://www.youtube.com/watch?v=OdIJ2x3nxzQ"
      }
    ]
  }
]

// Fallback sounds for sad or stressed moods
const sadStressedFallback: SoundGroup[] = [
  {
    section: "Soothing Ambiance",
    tracks: [
      {
        title: "Gentle Rain",
        description: "Soft rain sounds to ease stress and sadness.",
        youtube: "https://www.youtube.com/watch?v=1ZYbU82GVz4"
      },
      {
        title: "Calm Piano",
        description: "Gentle piano melodies for emotional comfort.",
        youtube: "https://www.youtube.com/watch?v=4D9G9bD4zQk"
      }
    ]
  },
  {
    section: "Relaxing Nature",
    tracks: [
      {
        title: "Forest Stream",
        description: "Calming stream and bird sounds for relaxation.",
        youtube: "https://www.youtube.com/watch?v=OdIJ2x3nxzQ"
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

// Check if a YouTube video is available
const isVideoAvailable = async (url: string): Promise<boolean> => {
  try {
    const videoId = getYouTubeVideoId(url)
    if (!videoId) return false
    const oembedResponse = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
    if (!oembedResponse.ok) return false
    const thumbnailResponse = await fetch(`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`)
    return thumbnailResponse.ok
  } catch (error) {
    console.error(`Error checking availability for ${url}:`, error)
    return false
  }
}

// Clean markdown from API response
const cleanJsonResponse = (response: string): string => {
  let cleaned = response.replace(/```json\s*|\s*```|\n/g, '').trim()
  cleaned = cleaned.replace(/^\s+|\s+$/g, '')
  console.log('Cleaned response:', cleaned)
  return cleaned
}

// Gemini API call function
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
      console.error('API error:', data.error)
      return `Error: ${data.error.message || 'Unknown API error'}`
    }
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response text available.'
    console.log('Raw API response:', text)
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
  const router = useRouter()

  // Filter out unavailable videos, with fallback to include them if too many are rejected
  const filterAvailableSounds = async (soundsData: SoundGroup[]): Promise<SoundGroup[]> => {
    const updatedSounds = await Promise.all(soundsData.map(async (group) => ({
      ...group,
      tracks: await Promise.all(group.tracks.map(async (track) => {
        const isAvailable = await isVideoAvailable(track.youtube)
        console.log(`Video ${track.title} (${track.youtube}) availability:`, isAvailable)
        return isAvailable ? track : { ...track, unavailable: true }
      }))
    })))
    return updatedSounds.filter(group => group.tracks.length > 0)
  }

  // Initial check for default sounds
  useEffect(() => {
    const checkDefaultSounds = async () => {
      const availableSounds = await filterAvailableSounds(defaultSounds)
      setSounds(availableSounds.length > 0 ? availableSounds : defaultSounds)
    }
    checkDefaultSounds()
  }, [])

  // Function to get AI-curated sounds based on user input
  const getAiSounds = async () => {
    if (!userMood.trim()) return
    setIsLoading(true)
    setAiRecommendation('')
    const prompt = `Based on the user's input: "${userMood}". Suggest a curated list of 2-4 relaxing sound categories and tracks to help with relaxation, focus, or sleep, specifically tailored for ${userMood} (e.g., soothing music for sadness or stress relief). Return a JSON array of categories, each with a "section" (string) and "tracks" (array of objects). Each track must have "title" (string), "description" (string), and "youtube" (valid YouTube URL with a unique video ID from recently available videos, ideally posted within the last year as of September 2025). Use diverse, currently accessible YouTube videos matching the theme. Do not include any text outside the JSON array. Example:
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
    console.log('API response for validation:', response)
    try {
      const parsed: SoundGroup[] = JSON.parse(response)
      console.log('Parsed API response:', parsed)
      if (Array.isArray(parsed) && parsed.length > 0) {
        const availableSounds = await filterAvailableSounds(parsed)
        if (availableSounds.length === 0 && (userMood.toLowerCase().includes('sad') || userMood.toLowerCase().includes('stressed'))) {
          setSounds(sadStressedFallback)
          setAiRecommendation('No available AI suggestions found. Using curated fallback for sad/stressed moods.')
        } else {
          setSounds(availableSounds.length > 0 ? availableSounds : parsed)
          setAiRecommendation('AI-curated sounds loaded successfully.')
        }
      } else {
        setAiRecommendation('Invalid sound format received from AI. Showing default sounds.')
        setSounds(defaultSounds)
      }
    } catch (error) {
      console.error('Error parsing AI response:', error)
      setAiRecommendation('Failed to parse AI response. Showing default sounds.')
      setSounds(defaultSounds)
    }
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-extrabold mb-2 text-center text-gray-900 dark:text-white">
          AI-Curated Relaxing Sounds
        </h1>
        <p className="mb-8 text-center text-gray-600 dark:text-gray-300">
          Describe your mood or desired sound (e.g., "sad", "stressed", "ocean waves") to get personalized relaxing sounds.
        </p>

        {/* Back to Home Button */}
        <div className="text-center mb-6">
          <motion.button
            className="px-6 py-2 rounded-lg bg-gray-600 text-white font-semibold hover:bg-gray-700 transition"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/')}
          >
            Back to Home
          </motion.button>
        </div>

        {/* User Input for Mood/Sound Preference */}
        <section className="mb-8">
          <label className="block text-lg font-medium mb-2 text-gray-900 dark:text-white">
            What kind of sounds would you like to hear?
          </label>
          <div className="flex gap-4">
            <input
              className="flex-1 p-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition"
              placeholder="E.g., sad, stressed, ocean waves..."
              value={userMood}
              onChange={(e) => setUserMood(e.target.value)}
            />
            <motion.button
              className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold disabled:opacity-50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={getAiSounds}
              disabled={isLoading || !userMood.trim()}
            >
              {isLoading ? 'Loading...' : 'Get AI Suggestions'}
            </motion.button>
          </div>
          {aiRecommendation && (
            <motion.p
              className={`mt-4 text-center ${aiRecommendation.includes('Invalid') || aiRecommendation.includes('Failed') ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {aiRecommendation}
            </motion.p>
          )}
        </section>

        {sounds.map((group, idx) => (
          <section key={idx} className="mb-10">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              {group.section}
            </h2>
            <div className="grid gap-6">
              {group.tracks.map((track, tIdx) => {
                const videoId = getYouTubeVideoId(track.youtube)
                return (
                  <div
                    key={tIdx}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5 flex flex-col items-center"
                  >
                    <div className="font-bold text-lg mb-1 text-center text-gray-900 dark:text-white">
                      {track.title}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-300 mb-4 text-center">
                      {track.description}
                    </div>
                    {videoId ? (
                      <a
                        href={track.youtube}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mb-4 relative block"
                        aria-label={`Watch ${track.title} on YouTube`}
                      >
                        <div className="overflow-hidden rounded-lg shadow-lg w-72 h-40 border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 flex items-center justify-center transition-transform transform hover:scale-105 relative">
                          {videoId && (
                            <img
                              src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                              alt={`${track.title} YouTube thumbnail`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = '/placeholder-image.jpg'
                                e.currentTarget.alt = `${track.title} thumbnail unavailable`
                              }}
                            />
                          )}
                          {track.unavailable && (
                            <span className="absolute bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold top-2 left-2">
                              Unavailable
                            </span>
                          )}
                          <span className="absolute bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-xs font-semibold bottom-3 right-3 flex items-center">
                            <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M10 15l5.19-3L10 9v6zm12-3c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-6zm-2 6H4v-6h16v6z"></path>
                            </svg>
                            YouTube
                          </span>
                        </div>
                      </a>
                    ) : (
                      <p className="text-red-500 text-sm">Invalid YouTube URL</p>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
