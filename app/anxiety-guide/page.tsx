'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'

const initialExercises = [
  {
    key: "breathing-478",
    type: "breathing",
    title: "4-7-8 Breathing",
    description: "A calming breathing technique to ease anxiety.",
    steps: [
      { label: "Inhale", seconds: 4, instruction: "Breathe in deeply for 4 seconds", scale: 1.3, color: "#6ee7b7" },
      { label: "Hold", seconds: 7, instruction: "Hold your breath for 7 seconds", scale: 1.5, color: "#fcd34d" },
      { label: "Exhale", seconds: 8, instruction: "Exhale slowly for 8 seconds", scale: 1.0, color: "#f87171" },
    ],
    note: "This method promotes relaxation and stress relief.",
  },
  {
    key: "grounding-54321",
    type: "grounding",
    title: "5-4-3-2-1 Grounding",
    description: "A sensory exercise to anchor you in the present.",
    steps: [
      { label: "5 Sights", instruction: "Notice five things you see.", prompt: "I see..." },
      { label: "4 Touches", instruction: "Feel four things around you.", prompt: "I feel..." },
      { label: "3 Sounds", instruction: "Listen for three distinct sounds.", prompt: "I hear..." },
      { label: "2 Smells", instruction: "Identify two smells or recall them.", prompt: "I smell..." },
      { label: "1 Taste", instruction: "Focus on one taste or memory of it.", prompt: "I taste..." },
    ],
  },
]

function FloatingShapes() {
  return (
    <svg className="fixed inset-0 w-full h-full z-0 pointer-events-none" aria-hidden="true">
      <defs>
        <radialGradient id="grad1" cx="50%" cy="50%" r="50%">
          <stop offset="0%" style={{ stopColor: "#bfdbfe", stopOpacity: 0.3 }} />
          <stop offset="100%" style={{ stopColor: "#bfdbfe", stopOpacity: 0 }} />
        </radialGradient>
        <radialGradient id="grad2" cx="50%" cy="50%" r="50%">
          <stop offset="0%" style={{ stopColor: "#fbcfe8", stopOpacity: 0.25 }} />
          <stop offset="100%" style={{ stopColor: "#fbcfe8", stopOpacity: 0 }} />
        </radialGradient>
      </defs>
      <motion.ellipse
        cx="20%" cy="30%" rx="200" ry="80"
        fill="url(#grad1)"
        animate={{ cy: ["30%", "50%", "30%"] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.ellipse
        cx="75%" cy="25%" rx="160" ry="70"
        fill="url(#grad2)"
        animate={{ cy: ["25%", "45%", "25%"] }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      />
    </svg>
  )
}

function BreathingStepCircle({ timer, step, isStarted, onStart, title }: any) {
  return (
    <motion.div
      className="flex flex-col items-center mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative flex items-center justify-center">
        <motion.div
          className="absolute w-64 h-64 rounded-full"
          style={{ background: `radial-gradient(circle, ${step.color}33 0%, transparent 70%)` }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.7, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="relative flex items-center justify-center rounded-full shadow-xl"
          style={{
            width: 180,
            height: 180,
            background: step.color,
            border: `8px solid ${step.color}cc`,
          }}
          animate={{ scale: step.scale, boxShadow: `0 0 40px ${step.color}66` }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          onClick={!isStarted ? onStart : undefined}
        >
          {!isStarted ? (
            <motion.button
              className="px-8 py-3 rounded-full bg-white text-gray-900 font-semibold text-lg shadow-lg hover:bg-gray-100"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onStart}
              aria-label="Start Breathing Exercise"
            >
              Start
            </motion.button>
          ) : (
            <motion.span
              className="text-5xl font-bold text-white"
              style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.2))" }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              key={timer}
              aria-live="polite"
            >
              {timer}
            </motion.span>
          )}
        </motion.div>
      </div>
      <motion.div
        className="mt-4 text-xl font-medium text-center"
        style={{ color: step.color }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {isStarted ? step.label : title}
      </motion.div>
    </motion.div>
  )
}

export default function AnxietyGuidePage() {
  const router = useRouter()
  const [exerciseIndex, setExerciseIndex] = useState(0)
  const [breathStep, setBreathStep] = useState(0)
  const [timer, setTimer] = useState(initialExercises[0].steps[0].seconds)
  const [isBreathingStarted, setIsBreathingStarted] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [groundStep, setGroundStep] = useState(0)
  const [groundingResponses, setGroundingResponses] = useState<{[key: number]: string}>({})
  const intervalRef = useRef<NodeJS.Timeout>()
  const [userMood, setUserMood] = useState('')
  const [aiTips, setAiTips] = useState('')
  const [aiFeedback, setAiFeedback] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [customExercises, setCustomExercises] = useState(initialExercises)
  const [exerciseTypeIndex, setExerciseTypeIndex] = useState(0)

  const currentExercise = customExercises[exerciseIndex]
  const isBreathing = currentExercise.type === "breathing"
  const isGrounding = currentExercise.type === "grounding" || currentExercise.type === "visualization" || currentExercise.type === "mindfulness"

  useEffect(() => {
    if (isBreathingStarted && isBreathing) {
      setTimer(currentExercise.steps[breathStep].seconds)
    }
  }, [breathStep, isBreathingStarted, isBreathing, currentExercise.steps])

  useEffect(() => {
    if (!isBreathing || !isBreathingStarted || isPaused) return
    intervalRef.current = setInterval(() => {
      setTimer((t) => {
        if (t > 1) return t - 1
        clearInterval(intervalRef.current)
        setTimeout(() => {
          setBreathStep((s) => (s + 1) % currentExercise.steps.length)
        }, 400)
        return 0
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [breathStep, isBreathing, isBreathingStarted, isPaused, currentExercise.steps])

  useEffect(() => {
    if (isBreathing) {
      setBreathStep(0)
      setTimer(currentExercise.steps[0].seconds)
      setIsBreathingStarted(false)
      setIsPaused(false)
      clearInterval(intervalRef.current)
    }
    if (isGrounding) {
      setGroundStep(0)
    }
  }, [exerciseIndex, isBreathing, isGrounding, currentExercise.steps])

  const handlePause = () => {
    setIsPaused((prev) => !prev)
    clearInterval(intervalRef.current)
  }

  const cleanApiResponse = (response: string): string => {
    const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) || response.match(/{[\s\S]*}/)
    return jsonMatch ? jsonMatch[1] || jsonMatch[0] : response.trim()
  }

  const formatFeedback = (rawFeedback: string): string => {
    const lines = rawFeedback.split('\n').filter(line => line.trim() && !line.includes('**Positive Feedback**') && !line.includes('**Psychological Suggestions**'))
    const positive = lines.find(line => line.includes('wonderful') || line.includes('great') || line.includes('fantastic')) || "Great job with your exercise!"
    const suggestions = lines
      .filter(line => line.startsWith('*') || line.includes('suggest') || line.includes('try') || line.includes('focus'))
      .slice(0, 3)
      .map(line => line.replace(/^\*\s*/, '- ').replace(/:\s*$/, ''))
      .join('\n')
    return `${positive}\n\nSuggestions:\n${suggestions || '- Try a calming activity like deep breathing.'}`
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
      return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response text available.'
    } catch (error) {
      console.error('Error calling Gemini API:', error)
      return 'Sorry, there was an error getting the AI response.'
    }
  }

  const getAiRecommendation = async () => {
    if (!userMood.trim()) return
    setIsLoading(true)
    setAiTips('')
    const exerciseTypes = ['breathing', 'grounding', 'visualization', 'mindfulness']
    const moodLower = userMood.toLowerCase()
    let preferredType = exerciseTypes[exerciseTypeIndex % exerciseTypes.length]

    // Adjust type based on mood for variety
    if (moodLower.includes('sad') || moodLower.includes('stressed')) {
      preferredType = preferredType === 'visualization' ? 'mindfulness' : preferredType
    } else if (moodLower.includes('anxious') || moodLower.includes('restless')) {
      preferredType = preferredType === 'breathing' ? 'grounding' : preferredType
    } else if (moodLower.includes('tense') || moodLower.includes('tight')) {
      preferredType = preferredType === 'breathing' ? 'mindfulness' : preferredType
    } else if (moodLower.includes('scared') || moodLower.includes('afraid')) {
      preferredType = preferredType === 'breathing' ? 'visualization' : preferredType
    }

    const prompt = `Based on the user's feeling: "${userMood}". Suggest a unique anxiety relief exercise of type "${preferredType}", different from "4-7-8 Breathing" and "5-4-3-2-1 Grounding". For breathing, each step must include label, seconds (number), instruction, scale (number like 1.3), color (hex like "#6ee7b7"). For others, each step must include label, instruction, prompt. Include a short tip (50 characters or less). Respond strictly with a JSON object: {"key": "custom", "type": "${preferredType}", "title": "Title here", "description": "Description here", "steps": [array of step objects], "note": "Optional note", "tips": "Short tip"}`
    const response = await callGeminiAPI(prompt)
    try {
      const cleanedResponse = cleanApiResponse(response)
      const parsed = JSON.parse(cleanedResponse)
      if (
        parsed.key &&
        parsed.type &&
        parsed.title &&
        parsed.description &&
        parsed.steps &&
        parsed.steps.length > 0 &&
        parsed.tips &&
        parsed.title !== "4-7-8 Breathing" &&
        parsed.title !== "5-4-3-2-1 Grounding"
      ) {
        parsed.key = `custom-${Date.now()}-${customExercises.length}`
        setCustomExercises((prev) => [...prev, parsed])
        setExerciseIndex(customExercises.length)
        setAiTips(parsed.tips)
        setExerciseTypeIndex((prev) => prev + 1)
      } else {
        setAiTips('Invalid exercise format. Try again.')
      }
    } catch (error) {
      console.error('Error parsing AI response:', error)
      setAiTips('Error loading exercise. Please try again.')
    }
    setIsLoading(false)
  }

  const getAiFeedback = async () => {
    const responsesText = Object.values(groundingResponses).join('\n')
    if (!responsesText.trim()) return
    setIsLoading(true)
    const prompt = `Analyze the user's responses in the "${currentExercise.title}" exercise: "${responsesText}". Provide concise positive feedback and 2-3 psychological suggestions for anxiety relief based on their input. For visualization exercises, suggest alternatives (e.g., sensory anchors, daily integrations) for when the user can't access their peaceful place. Return plain text with one positive feedback sentence and bullet points for suggestions.`
    const response = await callGeminiAPI(prompt)
    setAiFeedback(formatFeedback(response))
    setIsLoading(false)
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-blue-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
      <FloatingShapes />
      <motion.main
        className="relative max-w-2xl mx-auto p-8 mt-12 rounded-2xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.button
          className="mb-6 px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-gray-600 font-semibold"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push('/')}
          aria-label="Back to Home"
        >
          Back to Home
        </motion.button>

        <h1 className="text-4xl font-bold mb-6 text-center text-gray-900 dark:text-white">
          AI-Guided Anxiety Relief
        </h1>

        <section className="mb-8">
          <label className="block text-lg font-medium mb-2 text-gray-900 dark:text-white">
            How are you feeling? (Describe your anxiety)
          </label>
          <div className="flex gap-4">
            <input
              className="flex-1 p-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition"
              placeholder="E.g., I'm feeling overwhelmed and stressed..."
              value={userMood}
              onChange={(e) => setUserMood(e.target.value)}
            />
            <motion.button
              className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold disabled:opacity-50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={getAiRecommendation}
              disabled={isLoading || !userMood.trim()}
            >
              {isLoading ? 'Loading...' : 'Get AI Suggestion'}
            </motion.button>
          </div>
          {aiTips && (
            <motion.p
              className="mt-4 text-gray-700 dark:text-gray-300"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              AI Tips: {aiTips}
            </motion.p>
          )}
        </section>
        
        <nav className="flex justify-center mb-8 space-x-4">
          {customExercises.map((ex, idx) => (
            <motion.button
              key={ex.key}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                exerciseIndex === idx
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-gray-600"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setExerciseIndex(idx)}
              aria-current={exerciseIndex === idx ? "page" : undefined}
            >
              {ex.title}
            </motion.button>
          ))}
        </nav>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={currentExercise.key}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-2xl font-semibold mb-3 text-center text-gray-900 dark:text-white">
              {currentExercise.title}
            </h2>
            <p className="mb-8 text-center text-gray-600 dark:text-gray-300">
              {currentExercise.description}
            </p>

            {isBreathing && (
              <section className="mb-8">
                <BreathingStepCircle
                  timer={timer}
                  step={currentExercise.steps[breathStep]}
                  isStarted={isBreathingStarted}
                  onStart={() => setIsBreathingStarted(true)}
                  title={currentExercise.title}
                />
                <motion.p
                  className="text-center text-lg text-gray-700 dark:text-gray-300"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {isBreathingStarted ? currentExercise.steps[breathStep].instruction : "Tap Start to begin."}
                </motion.p>
                {isBreathingStarted && (
                  <div className="flex justify-center gap-4 mt-6">
                    <motion.button
                      className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold disabled:opacity-50"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        clearInterval(intervalRef.current)
                        setBreathStep((s) => Math.max(s - 1, 0))
                      }}
                      disabled={breathStep === 0}
                    >
                      Previous
                    </motion.button>
                    <motion.button
                      className="px-6 py-2 rounded-lg bg-yellow-500 text-white font-semibold"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handlePause}
                    >
                      {isPaused ? "Resume" : "Pause"}
                    </motion.button>
                    <motion.button
                      className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold disabled:opacity-50"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        clearInterval(intervalRef.current)
                        setBreathStep((s) => Math.min(s + 1, currentExercise.steps.length - 1))
                      }}
                      disabled={breathStep === currentExercise.steps.length - 1}
                    >
                      Next
                    </motion.button>
                  </div>
                )}
                <p className="mt-6 text-sm text-gray-500 dark:text-gray-400 text-center">
                  {currentExercise.note}
                </p>
              </section>
            )}

            {isGrounding && (
              <motion.section
                className="mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                <label className="block text-lg font-medium mb-2 text-gray-900 dark:text-white">
                  {currentExercise.steps[groundStep].label}
                </label>
                <p className="mb-4 text-gray-700 dark:text-gray-300">
                  {currentExercise.steps[groundStep].instruction}
                </p>
                <div className="relative">
                  <input
                    className="w-full p-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition"
                    placeholder={currentExercise.steps[groundStep].prompt}
                    value={groundingResponses[groundStep] || ""}
                    onChange={(e) => setGroundingResponses({
                      ...groundingResponses,
                      [groundStep]: e.target.value,
                    })}
                  />
                  <AnimatePresence>
                    {groundingResponses[groundStep]?.trim() && (
                      <motion.span
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                      >
                        ✓
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
                <div className="flex justify-between mt-4">
                  <motion.button
                    className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold disabled:opacity-50"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setGroundStep((s) => Math.max(s - 1, 0))}
                    disabled={groundStep === 0}
                  >
                    Previous
                  </motion.button>
                  <motion.button
                    className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold disabled:opacity-50"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setGroundStep((s) => Math.min(s + 1, currentExercise.steps.length - 1))}
                    disabled={groundStep === currentExercise.steps.length - 1}
                  >
                    Next
                  </motion.button>
                </div>
                <div className="flex justify-center mt-6">
                  <motion.button
                    className="px-6 py-2 rounded-lg bg-green-600 text-white font-semibold disabled:opacity-50"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={getAiFeedback}
                    disabled={isLoading || Object.keys(groundingResponses).length === 0}
                  >
                    {isLoading ? 'Loading...' : 'Get AI Feedback'}
                  </motion.button>
                </div>
                {aiFeedback && (
                  <motion.div
                    className="mt-4 text-gray-700 dark:text-gray-300 whitespace-pre-line"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {aiFeedback}
                  </motion.div>
                )}
              </motion.section>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.main>
    </div>
  )
}
