import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { replicaId, personaId } = await request.json()
    
    const apiKey = process.env.TAVUS_API_KEY
    
    console.log('=== DEBUG: Conversation Creation ===')
    console.log('Environment:', process.env.NODE_ENV)
    console.log('API Key Source:', process.env.TAVUS_API_KEY ? 'Environment Variable' : 'None')
    console.log('API Key Preview:', apiKey ? `${apiKey.substring(0, 8)}...` : 'None')
    console.log('Replica ID:', replicaId)
    console.log('=====================================')
    
    if (!apiKey) {
      return NextResponse.json(
        { 
          error: 'Tavus API key not configured',
          debug: {
            hasApiKey: false,
            replicaId: replicaId
          }
        },
        { status: 500 }
      )
    }

    if (!replicaId) {
      return NextResponse.json(
        { error: 'Replica ID is required' },
        { status: 400 }
      )
    }

    // Prepare payload like your friend's code
    const payload = { replica_id: replicaId }
    
    // Only add persona_id if explicitly provided and not empty
    if (personaId && personaId.trim() !== '') {
      payload.persona_id = personaId
    } else if (process.env.NEXT_PUBLIC_TAVUS_PERSONA_ID && process.env.NEXT_PUBLIC_TAVUS_PERSONA_ID.trim() !== '') {
      // Use default persona_id if available
      payload.persona_id = process.env.NEXT_PUBLIC_TAVUS_PERSONA_ID
    }

    console.log('Payload:', payload)

    // Call Tavus API to create conversation
    console.log('Making request to Tavus API...')
    const response = await fetch('https://tavusapi.com/v2/conversations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify(payload),
    })
    
    console.log('Tavus API response status:', response.status)

    if (!response.ok) {
      const errorData = await response.text()
      console.error('=== DEBUG: Conversation Creation Error ===')
      console.error('Status:', response.status)
      console.error('Status Text:', response.statusText)
      console.error('Error Data:', errorData)
      console.error('==========================================')
      
      return NextResponse.json(
        { 
          error: 'Failed to create Tavus conversation', 
          details: errorData,
          debug: {
            replicaId: replicaId,
            hasApiKey: !!apiKey,
            apiKeyLength: apiKey ? apiKey.length : 0,
            apiKeyPreview: apiKey ? `${apiKey.substring(0, 8)}...` : 'None',
            status: response.status,
            statusText: response.statusText
          }
        },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('Conversation created successfully:', data)
    
    return NextResponse.json({
      success: true,
      conversation_id: data.conversation_id,
      conversation_url: data.conversation_url,
      status: data.status,
      data
    })

  } catch (error) {
    console.error('Error creating Tavus conversation:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error.message,
        debug: {
          replicaId: replicaId,
          hasApiKey: !!process.env.TAVUS_API_KEY
        }
      },
      { status: 500 }
    )
  }
}