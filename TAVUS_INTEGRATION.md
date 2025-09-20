# Tavus AI Integration - ZenSoul Mental Wellness App

## Overview
ZenSoul now features Tavus AI Companion as the primary AI interaction method, providing lifelike video conversations for mental health support.

## Features

### 🎥 Tavus AI Companion (Primary)
- **Interactive Video AI**: Real-time video conversations with lifelike AI companion
- **Demo Mode**: Free demo experience with no token usage
- **Live Sessions**: Full Tavus integration with your persona and replica IDs
- **Natural Conversations**: Advanced emotional intelligence and personalized responses
- **Mental Health Focus**: Specialized for wellness and therapeutic conversations

### 🎙️ ElevenLabs Voice Therapy (Secondary)
- **Voice-only AI**: Audio-based therapeutic conversations
- **Multiple Agents**: Fallback system with multiple agent IDs
- **HIPAA Compliant**: Secure and private voice interactions

### 💬 Text Chat Assistant (Tertiary)
- **Quick Support**: Instant text-based assistance
- **Mood Tracking**: Simple chat interface for basic support

## Configuration

### Environment Variables
```env
# Tavus AI Configuration
NEXT_PUBLIC_TAVUS_PERSONA_ID=p531b1660da7
NEXT_PUBLIC_TAVUS_REPLICA_ID=r9fa0878977a
TAVUS_API_KEY=your_tavus_api_key_here

# ElevenLabs Configuration (Fallback)
ELEVENLABS_AGENT_ID=agent_0901k4n1sv5nf8stzfm9254037ad
ELEVENLABS_API_KEY=sk_a49f5e8464189efbdb7c44bf4f2bb74185fb46681e09363f
NEXT_PUBLIC_ELEVENLABS_AGENT_ID=agent_0901k4n1sv5nf8stzfm9254037ad
```

## UI Hierarchy

1. **Tavus AI Companion** - Featured prominently on homepage with demo video
2. **ElevenLabs Voice Therapy** - Secondary option in AI assistants grid
3. **Text Chat** - Tertiary option for quick support

## Demo Mode Features

- **No Token Usage**: Free demo experience for users to try Tavus
- **Interactive Chat**: Simulated conversation with AI responses
- **Video Preview**: Visual representation of the Tavus interface
- **Upgrade Path**: Easy transition to live Tavus sessions

## Technical Implementation

### Components
- `TavusWidget.tsx` - Main Tavus AI component with demo and live modes
- `ElevenLabsWidget.tsx` - Voice therapy fallback option
- `ChatBot.tsx` - Text-based assistant

### Styling
- Custom animations for Tavus branding (`animate-tavus-glow`)
- Gradient text effects (`animate-gradient-text`)
- Cool hover effects (`hover-lift`, `btn-cool`)
- Glassmorphism design elements

## User Experience Flow

1. **Homepage**: User sees Tavus AI prominently featured
2. **Demo Mode**: Click "Try Demo (Free)" to experience Tavus without tokens
3. **Live Session**: Upgrade to full Tavus experience with real API calls
4. **Fallback Options**: ElevenLabs and text chat available as alternatives

## Benefits

- **Cost-Effective**: Demo mode allows unlimited free trials
- **Professional**: Video AI provides more engaging experience than voice-only
- **Scalable**: Multiple AI options for different user preferences
- **Modern**: Cutting-edge Tavus technology showcases innovation

## Future Enhancements

- Integration with Tavus conversation analytics
- Custom persona training for mental health specialization
- Multi-language support through Tavus
- Advanced emotion recognition and response