'use client'

import { useState, useEffect, useRef } from 'react'
import { toast } from './ui/toaster'

interface TavusWidgetProps {
    className?: string
}

export default function TavusWidget({ className = '' }: TavusWidgetProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [conversationStarted, setConversationStarted] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [conversationUrl, setConversationUrl] = useState<string | null>(null)
    const iframeRef = useRef<HTMLIFrameElement>(null)

    useEffect(() => {
        // Listen for voice therapy events from other components
        // Listen for Tavus widget open events only
        const handleOpenTavus = () => {
            console.log('Open Tavus event received')
            // Close ElevenLabs if it's open
            const closeElevenLabsEvent = new CustomEvent('closeElevenLabs')
            window.dispatchEvent(closeElevenLabsEvent)
            
            setIsOpen(true)
            // Don't auto-start, let user click the button
        }

        // Listen for close Tavus events
        const handleCloseTavus = () => {
            console.log('Close Tavus event received')
            setIsOpen(false)
            setConversationStarted(false)
            setError(null)
            setConversationUrl(null)
        }

        window.addEventListener('openTavusWidget', handleOpenTavus)
        window.addEventListener('closeTavus', handleCloseTavus)

        return () => {
            window.removeEventListener('openTavusWidget', handleOpenTavus)
            window.removeEventListener('closeTavus', handleCloseTavus)
        }
    }, [])

    const startTavusSession = async () => {
        if (isLoading || conversationStarted) {
            console.log('Session already starting or started')
            return
        }

        setIsLoading(true)
        setError(null)

        try {
            const replicaId = process.env.NEXT_PUBLIC_TAVUS_REPLICA_ID
            const personaId = process.env.NEXT_PUBLIC_TAVUS_PERSONA_ID

            console.log('Starting Tavus session with:', { replicaId, personaId })

            if (!replicaId) {
                throw new Error('Tavus Replica ID is missing')
            }

            // Create conversation via API
            const response = await fetch('/api/tavus/create-conversation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    replicaId: replicaId,
                    personaId: personaId
                })
            })

            const data = await response.json()
            console.log('API Response:', data)

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create conversation')
            }

            if (data.conversation_url) {
                setConversationUrl(data.conversation_url)
                setConversationStarted(true)
                toast.success('Connected to Tavus AI companion!')
            } else {
                throw new Error('No conversation URL received')
            }

        } catch (error) {
            console.error('Failed to start Tavus session:', error)
            const errorMessage = error instanceof Error ? error.message : 'Failed to connect to Tavus AI'
            setError(errorMessage)
            toast.error(errorMessage)
        } finally {
            setIsLoading(false)
        }
    }

    const retryConnection = () => {
        setError(null)
        setConversationUrl(null)
        setConversationStarted(false)
        startTavusSession()
    }

    const toggleWidget = () => {
        setIsOpen(!isOpen)
        if (!isOpen) {
            // Reset state when opening
            setConversationStarted(false)
            setError(null)
            setConversationUrl(null)
        }
    }

    return (
        <>

            {/* Tavus Widget Modal */}
            {isOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] overflow-hidden border border-gray-200 dark:border-slate-700">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-4 text-white">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold">Tavus AI Companion</h3>
                                        <div className="flex items-center space-x-2 text-indigo-100">
                                            <div className={`w-2 h-2 rounded-full ${error ? 'bg-red-400' : conversationStarted ? 'bg-green-400 animate-pulse' : 'bg-yellow-400 animate-pulse'
                                                }`}></div>
                                            <span className="text-sm">
                                                {error ? 'Connection Error' : conversationStarted ? 'Connected' : isLoading ? 'Connecting...' : 'Ready'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    {error && (
                                        <button
                                            onClick={retryConnection}
                                            className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-medium transition-colors backdrop-blur-sm"
                                        >
                                            Retry
                                        </button>
                                    )}
                                    <button
                                        onClick={toggleWidget}
                                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="h-[calc(100%-72px)]">
                            {error ? (
                                <div className="w-full h-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
                                    <div className="text-center p-8">
                                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Connection Error</h4>
                                        <p className="text-slate-600 dark:text-slate-300 mb-4 max-w-md mx-auto">{error}</p>
                                        <button
                                            onClick={retryConnection}
                                            className="px-6 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-medium transition-colors"
                                        >
                                            Try Again
                                        </button>
                                    </div>
                                </div>
                            ) : isLoading ? (
                                <div className="w-full h-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
                                    <div className="text-center p-8">
                                        <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
                                        <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Connecting to Tavus AI</h4>
                                        <p className="text-slate-600 dark:text-slate-300">Creating your conversation session...</p>
                                    </div>
                                </div>
                            ) : conversationUrl ? (
                                <div className="w-full h-full relative">
                                    {/* Tavus Conversation Iframe */}
                                    <iframe
                                        ref={iframeRef}
                                        src={conversationUrl}
                                        className="w-full h-full border-0"
                                        allow="camera; microphone; autoplay; encrypted-media; fullscreen; display-capture"
                                        allowFullScreen
                                        title="Tavus AI Wellness Companion"
                                        onLoad={() => {
                                            console.log('Tavus conversation loaded successfully')
                                        }}
                                        onError={(e) => {
                                            console.error('Tavus conversation failed to load:', e)
                                            setError('Failed to load Tavus conversation. Please try again.')
                                        }}
                                    />

                                    {/* Status Overlay */}
                                    <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-sm pointer-events-none">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                            <span>Live Conversation</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="w-full h-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
                                    <div className="text-center p-8">
                                        <div className="w-24 h-24 bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                                            <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                            </svg>
                                        </div>
                                        <h4 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
                                            Tavus AI Companion
                                        </h4>
                                        <p className="text-slate-600 dark:text-slate-300 text-sm mb-6">
                                            Ready to start your AI wellness conversation
                                        </p>
                                        <button
                                            onClick={startTavusSession}
                                            disabled={isLoading}
                                            className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                                        >
                                            {isLoading ? 'Connecting...' : 'Start Conversation'}
                                        </button>
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