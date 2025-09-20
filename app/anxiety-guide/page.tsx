'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'

interface BreathingStep {
  label: string
  seconds: number
  instruction: string
  scale: number
  color: string
}

interface GroundingStep {
  label: string
  instruction: string
  prompt: string
}

interface Exercise {
  key: string
  type: string
  title: string
  description: string
  steps: BreathingStep[] | GroundingStep[]
  note?: string
}

const initialExercises: Exercise[] = [
  {
    key: "breathing-478",
    type: "breathing",
    title: "4-7-8 Breathing",
    description: "A calming breathing technique to ease anxiety and promote relaxation.",
    steps: [
      { label: "Inhale", seconds: 4, instruction: "Breathe in deeply through your nose", scale: 1.3, color: "#10b981" },
      { label: "Hold", seconds: 7, instruction: "Hold your breath gently", scale: 1.5, color: "#f59e0b" },
      { label: "Exhale", seconds: 8, instruction: "Exhale slowly through your mouth", scale: 1.0, color: "#3b82f6" },
    ],
    note: "This technique activates your parasympathetic nervous system for deep relaxation.",
  },
  {
    key: "grounding-54321",
    type: "grounding",
    title: "5-4-3-2-1 Grounding",
    description: "A sensory exercise to anchor you in the present moment and reduce anxiety.",
    steps: [
      { label: "5 Things You See", instruction: "Look around and notice five things you can see.", prompt: "I can see..." },
      { label: "4 Things You Touch", instruction: "Feel four different textures around you.", prompt: "I can feel..." },
      { label: "3 Things You Hear", instruction: "Listen for three distinct sounds.", prompt: "I can hear..." },
      { label: "2 Things You Smell", instruction: "Identify two scents or recall pleasant ones.", prompt: "I can smell..." },
      { label: "1 Thing You Taste", instruction: "Focus on one taste in your mouth.", prompt: "I can taste..." },
    ],
  },
]

function BreathingStepCircle({ timer, step, isStarted, onStart, title }: any) {
  return (
    <motion.div
      className="flex flex-col items-center mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative flex items-center justify-center">
        <motion.div
          className="absolute w-80 h-80 rounded-full"
          style={{ background: `radial-gradient(circle, ${step.color}20 0%, transparent 70%)` }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="relative flex items-center justify-center rounded-full shadow-2xl backdrop-blur-sm"
          style={{
            width: 200,
            height: 200,
            background: `linear-gradient(135deg, ${step.color}dd, ${step.color}aa)`,
            border: `4px solid ${step.color}`,
          }}
          animate={{ 
            scale: step.scale, 
            boxShadow: `0 0 60px ${step.color}40, 0 0 100px ${step.color}20` 
          }}
          transition={{ duration: 1, ease: "easeInOut" }}
          onClick={!isStarted ? onStart : undefined}
        >
          {!isStarted ? (
            <motion.button
              className="px-8 py-4 rounded-2xl bg-white/90 text-slate-800 font-bold text-xl shadow-lg hover:bg-white transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onStart}
              aria-label="Start Breathing Exercise"
            >
              Start
            </motion.button>
          ) : (
            <motion.span
              className="text-4xl font-bold text-white"
              style={{ filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.3))" }}
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
        className="mt-6 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="text-xl font-bold text-slate-800 dark:text-white mb-2">
          {isStarted ? step.label : title}
        </div>
        {isStarted && (
          <div className="text-base text-slate-600 dark:text-slate-300">
            {step.instruction}
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

export default function AnxietyGuidePage() {
  const router = useRouter()
  const [exerciseIndex, setExerciseIndex] = useState(0)
  const [breathStep, setBreathStep] = useState(0)
  const [timer, setTimer] = useState((initialExercises[0].steps[0] as BreathingStep).seconds)
  const [isBreathingStarted, setIsBreathingStarted] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [groundStep, setGroundStep] = useState(0)
  const [groundingResponses, setGroundingResponses] = useState<{[key: number]: string}>({})
  const intervalRef = useRef<NodeJS.Timeout>()
  const [userMood, setUserMood] = useState('')
  const [aiTips, setAiTips] = useState('')
  const [aiFeedback, setAiFeedback] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [customExercises, setCustomExercises] = useState<Exercise[]>(initialExercises)
  const [exerciseTypeIndex, setExerciseTypeIndex] = useState(0)

  const currentExercise = customExercises[exerciseIndex]
  const isBreathing = currentExercise.type === "breathing"
  const isGrounding = currentExercise.type === "grounding" || currentExercise.type === "visualization" || currentExercise.type === "mindfulness"

  useEffect(() => {
    if (!isBreathing || !isBreathingStarted || isPaused) return;
    intervalRef.current = setInterval(() => {
      setTimer((t) => {
        if (t > 1) return t - 1;
        clearInterval(intervalRef.current);
        setTimeout(() => {
          setBreathStep((s) => (s + 1) % currentExercise.steps.length);
        }, 400);
        return 0;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [breathStep, isBreathing, isBreathingStarted, isPaused, currentExercise.steps]);

  useEffect(() => {
    if (isBreathing) {
      setBreathStep(0)
      setTimer((currentExercise.steps[0] as BreathingStep).seconds)
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

    if (moodLower.includes('sad') || moodLower.includes('stressed')) {
      preferredType = preferredType === 'visualization' ? 'mindfulness' : preferredType
    } else if (moodLower.includes('anxious') || moodLower.includes('restless')) {
      preferredType = preferredType === 'breathing' ? 'grounding' : preferredType
    }

    const prompt = `Based on the user's feeling: "${userMood}". Suggest a unique anxiety relief exercise of type "${preferredType}", different from "4-7-8 Breathing" and "5-4-3-2-1 Grounding". For breathing, each step must include label, seconds (number), instruction, scale (number like 1.3), color (hex like "#10b981"). For others, each step must include label, instruction, prompt. Include a short tip (50 characters or less). Respond strictly with a JSON object: {"key": "custom", "type": "${preferredType}", "title": "Title here", "description": "Description here", "steps": [array of step objects], "note": "Optional note", "tips": "Short tip"}`
    
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
    const prompt = `Analyze the user's responses in the "${currentExercise.title}" exercise: "${responsesText}". Provide concise positive feedback and 2-3 psychological suggestions for anxiety relief based on their input. Return plain text with one positive feedback sentence and bullet points for suggestions.`
    const response = await callGeminiAPI(prompt)
    setAiFeedback(formatFeedback(response))
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
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
                </svg>
                <span>Home</span>
              </button>
              <div className="bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white px-4 py-2 rounded-xl text-sm font-medium shadow-sm">
                <svg className="w-4 h-4 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"/>
                </svg>
                Wellness Guide
              </div>
            </div>
          </div>
        </nav>
      </div>

      <div className="pt-32 px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mb-4">
              AI-Guided
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 mt-1">
                Anxiety Relief
              </span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              Personalized breathing exercises and grounding techniques powered by AI to help you find calm and peace.
            </p>
          </div>

          {/* AI Mood Input */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 mb-12 border border-gray-100 dark:border-slate-700">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-2xl flex items-center justify-center text-white text-2xl mr-4">
                🤖
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">AI Personalization</h2>
                <p className="text-slate-600 dark:text-slate-300">Tell me how you're feeling for a customized exercise</p>
              </div>
            </div>

            <div className="flex gap-4">
              <input
                className="flex-1 px-6 py-4 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800 dark:text-white placeholder-slate-400"
                placeholder="E.g., I'm feeling overwhelmed and stressed about work..."
                value={userMood}
                onChange={(e) => setUserMood(e.target.value)}
              />
              <motion.button
                className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-2xl font-semibold disabled:opacity-50 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={getAiRecommendation}
                disabled={isLoading || !userMood.trim()}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating...</span>
                  </div>
                ) : (
                  'Get AI Exercise'
                )}
              </motion.button>
            </div>
            
            {aiTips && (
              <motion.div
                className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-200 dark:border-emerald-800"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center space-x-2 text-emerald-800 dark:text-emerald-200">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                  </svg>
                  <span className="font-semibold">AI Tip:</span>
                  <span>{aiTips}</span>
                </div>
              </motion.div>
            )}
          </div>
          
          {/* Exercise Navigation */}
          <div className="flex justify-center mb-12">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-2 shadow-lg border border-gray-100 dark:border-slate-700">
              <div className="flex space-x-2">
                {customExercises.map((ex, idx) => (
                  <motion.button
                    key={ex.key}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                      exerciseIndex === idx
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                        : "text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setExerciseIndex(idx)}
                    aria-current={exerciseIndex === idx ? "page" : undefined}
                  >
                    {ex.title}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Exercise Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentExercise.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 mb-12 border border-gray-100 dark:border-slate-700"
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-4">
                  {currentExercise.title}
                </h2>
                <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                  {currentExercise.description}
                </p>
              </div>

              {isBreathing && (
                <div className="text-center">
                  <BreathingStepCircle
                    timer={timer}
                    step={currentExercise.steps[breathStep] as BreathingStep}
                    isStarted={isBreathingStarted}
                    onStart={() => setIsBreathingStarted(true)}
                    title={currentExercise.title}
                  />
                  
                  {isBreathingStarted && (
                    <div className="flex justify-center gap-4 mt-8">
                      <motion.button
                        className="px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white rounded-xl font-semibold disabled:opacity-50 hover:bg-slate-300 dark:hover:bg-slate-600 transition-all duration-200"
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
                        className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handlePause}
                      >
                        {isPaused ? "Resume" : "Pause"}
                      </motion.button>
                      <motion.button
                        className="px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white rounded-xl font-semibold disabled:opacity-50 hover:bg-slate-300 dark:hover:bg-slate-600 transition-all duration-200"
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
                  
                  {currentExercise.note && (
                    <p className="mt-8 text-slate-500 dark:text-slate-400 text-center italic">
                      {currentExercise.note}
                    </p>
                  )}
                </div>
              )}

              {isGrounding && (
                <motion.div
                  className="max-w-2xl mx-auto"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-2xl font-bold text-slate-800 dark:text-white">
                        {currentExercise.steps[groundStep].label}
                      </h3>
                      <span className="text-sm text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-full">
                        {groundStep + 1} of {currentExercise.steps.length}
                      </span>
                    </div>
                    <p className="text-lg text-slate-600 dark:text-slate-300 mb-6">
                      {currentExercise.steps[groundStep].instruction}
                    </p>
                    
                    <div className="relative">
                      <input
                        className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800 dark:text-white placeholder-slate-400"
                        placeholder={(currentExercise.steps[groundStep] as GroundingStep).prompt}
                        value={groundingResponses[groundStep] || ""}
                        onChange={(e) => setGroundingResponses({
                          ...groundingResponses,
                          [groundStep]: e.target.value,
                        })}
                      />
                      <AnimatePresence>
                        {groundingResponses[groundStep]?.trim() && (
                          <motion.div
                            className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                          >
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                            </svg>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                  
                  <div className="flex justify-between mb-8">
                    <motion.button
                      className="px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white rounded-xl font-semibold disabled:opacity-50 hover:bg-slate-300 dark:hover:bg-slate-600 transition-all duration-200"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setGroundStep((s) => Math.max(s - 1, 0))}
                      disabled={groundStep === 0}
                    >
                      Previous
                    </motion.button>
                    <motion.button
                      className="px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white rounded-xl font-semibold disabled:opacity-50 hover:bg-slate-300 dark:hover:bg-slate-600 transition-all duration-200"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setGroundStep((s) => Math.min(s + 1, currentExercise.steps.length - 1))}
                      disabled={groundStep === currentExercise.steps.length - 1}
                    >
                      Next
                    </motion.button>
                  </div>
                  
                  <div className="text-center">
                    <motion.button
                      className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl font-semibold disabled:opacity-50 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={getAiFeedback}
                      disabled={isLoading || Object.keys(groundingResponses).length === 0}
                    >
                      {isLoading ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Analyzing...</span>
                        </div>
                      ) : (
                        'Get AI Feedback'
                      )}
                    </motion.button>
                  </div>
                  
                  {aiFeedback && (
                    <motion.div
                      className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-200 dark:border-blue-800"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">AI Feedback</h4>
                          <div className="text-blue-700 dark:text-blue-300 whitespace-pre-line">
                            {aiFeedback}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}