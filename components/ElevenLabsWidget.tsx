'use client'

import { useState, useEffect } from 'react'
import { toast } from './ui/toaster'

// Declare the ElevenLabs custom element
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'elevenlabs-convai': any
    }
  }
}

const PRIMARY_AGENT_ID = 'agent_0901k4n1sv5nf8stzfm9254037ad'

export default function ElevenLabsWidget() {
  const [isActive, setIsActive] = useState(false)
  const [scriptLoaded, setScriptLoaded] = useState(false)

  useEffect(() => {
    // Load ElevenLabs script
    const loadElevenLabsScript = () => {
      if (document.querySelector('script[src*="elevenlabs"]')) {
        console.log('ElevenLabs script already loaded')
        setScriptLoaded(true)
        return
      }

      const script = document.createElement('script')
      script.src = 'https://elevenlabs.io/convai-widget/index.js'
      script.async = true
      script.onload = () => {
        console.log('ElevenLabs script loaded successfully')
        setScriptLoaded(true)
      }
      script.onerror = () => {
        console.log('Failed to load ElevenLabs script')
        setScriptLoaded(false)
      }
      document.head.appendChild(script)
    }

    loadElevenLabsScript()
  }, [])

  useEffect(() => {
    const handleStartElevenLabsVoice = () => {
      console.log('ElevenLabs voice event received')
      
      // Close Tavus if it's open
      const closeTavusEvent = new CustomEvent('closeTavus')
      window.dispatchEvent(closeTavusEvent)
      
      setIsActive(true)
      toast.success('Opening ElevenLabs Voice Therapy...')
    }

    const handleCloseElevenLabs = () => {
      console.log('Close ElevenLabs event received')
      setIsActive(false)
    }

    window.addEventListener('startElevenLabsVoice', handleStartElevenLabsVoice)
    window.addEventListener('closeElevenLabs', handleCloseElevenLabs)

    return () => {
      window.removeEventListener('startElevenLabsVoice', handleStartElevenLabsVoice)
      window.removeEventListener('closeElevenLabs', handleCloseElevenLabs)
    }
  }, [])

  const toggleConversation = () => {
    setIsActive(!isActive)
  }

  return (
    <>
      {/* ElevenLabs Voice Widget - Bottom Panel */}
      {isActive && (
        <div className="fixed bottom-0 left-0 right-0 z-35 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-t-2xl shadow-2xl max-w-4xl mx-auto border-t border-gray-200 dark:border-slate-700">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-3 text-white rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base font-bold">ElevenLabs Voice Therapy</h3>
                    <div className="flex items-center text-emerald-100">
                      <div className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse mr-2"></div>
                      <span className="text-xs">AI Voice Assistant Active</span>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={toggleConversation}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* ElevenLabs Widget Content */}
            <div className="p-2">
              {scriptLoaded ? (
                <div className="bg-slate-50 dark:bg-slate-700 rounded-xl overflow-hidden">
                  <elevenlabs-convai 
                    agent-id={PRIMARY_AGENT_ID}
                    style={{
                      width: '100%',
                      height: '350px',
                      border: 'none',
                      borderRadius: '12px',
                      backgroundColor: 'transparent'
                    }}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-slate-600 dark:text-slate-300 text-sm">Loading ElevenLabs Voice Interface...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}