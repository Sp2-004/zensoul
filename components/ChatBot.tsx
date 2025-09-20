'use client'

import { useState, useRef, useEffect } from 'react'
import { toast } from './ui/toaster'

// Define Mood type for type safety
type Mood = 'neutral' | 'sad' | 'happy' | 'anxious'

interface Message {
  id: string
  text: string
  isUser: boolean
  timestamp: Date
  musicUrl?: string
}

const moodMusic: Record<Mood, { title: string; id: string }[]> = {
  happy: [
    { title: "Happy Upbeat Music", id: "ZbZSe6N_BXs" },
    { title: "Feel Good Vibes", id: "4D9G9bD4zQk" }
  ],
  sad: [
    { title: "Calming Piano", id: "2OEL4P1Rz04" },
    { title: "Peaceful Meditation", id: "1ZYbU82GVz4" }
  ],
  anxious: [
    { title: "Anxiety Relief Music", id: "OdIJ2x3nxzQ" },
    { title: "Deep Relaxation", id: "4D9G9bD4zQk" }
  ],
  neutral: [
    { title: "Ambient Focus Music", id: "2OEL4P1Rz04" },
    { title: "Nature Sounds", id: "1ZYbU82GVz4" }
  ]
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm your AI wellness companion. I can help with mindfulness, play relaxing music, or just listen. How are you feeling today?",
      isUser: false,
      timestamp: new Date()
    }
  ])
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Listen for open chat bot events
    const handleOpenChatBot = () => {
      setIsOpen(true)
    }

    window.addEventListener('openChatBot', handleOpenChatBot)
    return () => window.removeEventListener('openChatBot', handleOpenChatBot)
  }, [])

  const detectMoodAndMusic = (text: string): { mood: Mood; needsMusic: boolean } => {
    const lowerText = text.toLowerCase()
    
    if (lowerText.includes('music') || lowerText.includes('play') || lowerText.includes('song')) {
      if (lowerText.includes('happy') || lowerText.includes('upbeat') || lowerText.includes('energetic')) {
        return { mood: 'happy', needsMusic: true }
      } else if (lowerText.includes('sad') || lowerText.includes('down') || lowerText.includes('depressed')) {
        return { mood: 'sad', needsMusic: true }
      } else if (lowerText.includes('anxious') || lowerText.includes('stressed') || lowerText.includes('worried')) {
        return { mood: 'anxious', needsMusic: true }
      } else {
        return { mood: 'neutral', needsMusic: true }
      }
    }

    // Detect mood without explicit music request
    if (lowerText.includes('happy') || lowerText.includes('good') || lowerText.includes('great')) {
      return { mood: 'happy', needsMusic: false }
    } else if (lowerText.includes('sad') || lowerText.includes('down') || lowerText.includes('upset')) {
      return { mood: 'sad', needsMusic: false }
    } else if (lowerText.includes('anxious') || lowerText.includes('stressed') || lowerText.includes('panic')) {
      return { mood: 'anxious', needsMusic: false }
    }

    return { mood: 'neutral', needsMusic: false }
  }

  const getRandomMusic = (mood: Mood) => {
    const musicList = moodMusic[mood]
    return musicList[Math.floor(Math.random() * musicList.length)]
  }

  const sendMessage = async () => {
    if (!inputText.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    const currentInput = inputText
    setInputText('')
    setIsTyping(true)

    try {
      const { mood, needsMusic } = detectMoodAndMusic(currentInput)
      
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: currentInput,
          context: `User mood detected: ${mood}${needsMusic ? ', music requested' : ''}`
        })
      })

      const data = await response.json()
      
      let aiResponse = data.response || "I'm here to support you. Would you like to try some breathing exercises or write in your journal?"
      let musicUrl = ''

      if (needsMusic) {
        const selectedMusic = getRandomMusic(mood)
        musicUrl = `https://www.youtube.com/embed/${selectedMusic.id}?autoplay=0&loop=1`
        aiResponse += ` I've also selected some ${mood === 'neutral' ? 'calming' : mood} music that might help. You can play it below.`
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        isUser: false,
        timestamp: new Date(),
        musicUrl: musicUrl || undefined
      }

      setMessages(prev => [...prev, aiMessage])
      
      if (needsMusic) {
        toast.success('Music recommendation added!')
      }
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm here to support you. Would you like to try some breathing exercises or write in your journal?",
        isUser: false,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
      toast.error('Failed to get AI response')
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearChat = () => {
    setMessages([
      {
        id: '1',
        text: "Hi! I'm your AI wellness companion. I can help with mindfulness, play relaxing music, or just listen. How are you feeling today?",
        isUser: false,
        timestamp: new Date()
      }
    ])
    toast.info('Chat cleared')
  }

  return (
    <>
      {/* Chat Bubble */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-violet-500 to-purple-600 rounded-full shadow-lg flex items-center justify-center text-white hover:shadow-xl transition-all duration-300 z-30 ${
          isOpen ? 'hidden' : 'animate-bounce'
        }`}
        aria-label="Open AI chat"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[32rem] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col z-40 border border-gray-200 dark:border-gray-700">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-violet-500 to-purple-600 rounded-t-2xl">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <span className="text-white font-semibold">AI Wellness Chat</span>
                <div className="text-xs text-white/80">Music & Support</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={clearChat}
                className="text-white/80 hover:text-white transition-colors"
                aria-label="Clear chat"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white transition-colors"
                aria-label="Close chat"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className="space-y-2">
                <div className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-xs px-4 py-3 rounded-2xl ${
                      message.isUser
                        ? 'bg-violet-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                    <div className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
                
                {/* Music Player */}
                {message.musicUrl && (
                  <div className="flex justify-start">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3 max-w-xs">
                      <div className="text-xs text-gray-600 dark:text-gray-300 mb-2">
                        🎵 Recommended Music
                      </div>
                      <iframe
                        width="280"
                        height="157"
                        src={message.musicUrl}
                        frameBorder="0"
                        allow="autoplay; encrypted-media"
                        allowFullScreen
                        className="rounded-lg"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-700 px-4 py-3 rounded-2xl">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Try: "I'm feeling anxious, play some music" or "I'm happy today"
            </div>
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="How are you feeling? Ask for music..."
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-violet-500 dark:bg-gray-700 dark:text-white text-sm"
                disabled={isTyping}
              />
              <button
                onClick={sendMessage}
                disabled={!inputText.trim() || isTyping}
                className="w-10 h-10 bg-violet-500 text-white rounded-full flex items-center justify-center hover:bg-violet-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Send message"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
