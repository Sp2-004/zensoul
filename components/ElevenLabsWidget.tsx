'use client'

import { useEffect, useState } from 'react'

// Add custom element type for TypeScript
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'elevenlabs-convai': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        'agent-id'?: string
      }
    }
  }
}

const AGENT_ID =
  process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID ||
  'your_actual_agent_id_here' // Replace with your agent ID

export default function ElevenLabsWidget() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isActive, setIsActive] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    console.log('AGENT_ID:', AGENT_ID)

    if ((window as any).ElevenLabsConvAI) {
      setIsLoaded(true)
      return
    }

    const existingScript = document.getElementById('elevenlabs-convai-script')
    if (existingScript) return

    const loadScript = (attempt = 1, maxAttempts = 3) => {
      const script = document.createElement('script')
      script.id = 'elevenlabs-convai-script'
      script.src = 'https://elevenlabs.io/convai-widget/index.js'
      script.async = true
      script.onload = () => {
        setIsLoaded(true)
        setError(null)
        // Hide default rendering
        const defaultConvai = document.querySelector('elevenlabs-convai')
        if (defaultConvai instanceof HTMLElement) {
          defaultConvai.style.display = 'none'
        }
      }
      script.onerror = () => {
        if (attempt < maxAttempts) {
          console.warn(`Retrying to load ElevenLabs script (Attempt ${attempt + 1}/${maxAttempts})`)
          setTimeout(() => loadScript(attempt + 1, maxAttempts), 1000)
        } else {
          console.error('Failed to load ElevenLabs ConvAI script after retries ❌')
          setIsLoaded(false)
          setError('Failed to load AI assistant. Please check network or agent ID.')
        }
      }
      document.body.appendChild(script)
    }

    loadScript()

    return () => {
      const script = document.getElementById('elevenlabs-convai-script')
      if (script) script.remove()
    }
  }, [])

  const toggleConversation = () => {
    if (!isLoaded) return
    setIsActive((prev) => !prev)
  }

  return (
    <div className="fixed bottom-6 left-6 z-50">
      {isActive && (
        <div className="mb-4">
          {error ? (
            <p className="text-red-600 text-center p-4 bg-white rounded-lg shadow-md">{error}</p>
          ) : (
            <elevenlabs-convai
              agent-id={AGENT_ID}
              style={{ width: '100%', height: '400px', border: 'none' }}
            ></elevenlabs-convai>
          )}
        </div>
      )}
      <button
        onClick={toggleConversation}
        className="w-40 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full shadow-lg flex items-center justify-center text-white text-sm font-medium hover:shadow-xl transition-all duration-300 group"
        disabled={!isLoaded}
        aria-label={isActive ? 'Close Call' : 'Need Help? Start Call'}
      >
        {isActive ? 'Close Call' : 'Need Help? Start Call'}
      </button>
    </div>
  )
}
