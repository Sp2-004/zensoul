'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

const defaultSounds = [
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

// Clean markdown from API response
const cleanJsonResponse = (response: string): string => {
  // Remove markdown code block markers and extra whitespace
  let cleaned = response.replace(/```json\s*|\s*```/g, '').trim()
  // Remove any leading/trailing newlines or spaces
  cleaned = cleaned.replace(/^\s+|\s+$/g, '')
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
          {
            text: prompt
          }
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
  const [sounds, setSounds] = useState(defaultSounds)
  const [aiRecommendation, setAiRecommendation] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Function to get AI-curated sounds based on user input
  const getAiSounds = async () => {
    if (!userMood.trim()) return
    setIsLoading(true)
    setAiRecommendation('')
    const prompt = `Based on the user's input: "${userMood}". Suggest a curated list of relaxing sound categories and tracks to help with relaxation, focus, or sleep. Each category should have a section name and a list of tracks, where each track includes a title, description, and a valid YouTube URL. Respond strictly with a JSON object, no other text or explanations: [
      {
        "section": "Category name",
        "tracks": [
          {
            "title": "Track title",
            "description": "Track description",
            "youtube": "Valid YouTube URL"
          }
        ]
      }
    ]`
    const response = await callGeminiAPI(prompt)
    setAiRecommendation(response)
    try {
      const parsed = JSON.parse(response)
      if (Array.isArray(parsed) && parsed.every(category => 
        category.section && Array.isArray(category.tracks) && 
        category.tracks.every((track: any) => track.title && track.description && track.youtube)
      )) {
        setSounds(parsed)
      } else {
        setAiRecommendation('Invalid sound format received from AI. Showing default sounds.')
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
          Describe your mood or desired sound (e.g., "ocean waves" or "feeling stressed") to get personalized relaxing sounds.
        </p>

        {/* User Input for Mood/Sound Preference */}
        <section className="mb-8">
          <label className="block text-lg font-medium mb-2 text-gray-900 dark:text-white">
            What kind of sounds would you like to hear?
          </label>
          <div className="flex gap-4">
            <input
              className="flex-1 p-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition"
              placeholder="E.g., ocean waves, feeling stressed..."
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
              className="mt-4 text-gray-700 dark:text-gray-300"
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
                          <img
                            src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                            alt={`${track.title} YouTube thumbnail`}
                            className="w-full h-full object-cover"
                          />
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
