import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function analyzeJournalEntry(content: string) {
  try {
    // Use the correct model name
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
    const prompt = `
      Analyze the following journal entry and provide insights:
      ${content}
    `
    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text()
  } catch (error) {
    throw error
  }
}

export async function generateChatResponse(message: string) {
  try {
    // Use the correct model name
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
    const prompt = `
      ${message}
    `
    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text()
  } catch (error) {
    throw error
  }
}

export async function generateAffirmation(mood?: string) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

    const prompt = `
    Generate a personalized, uplifting affirmation for someone who might be feeling ${mood || 'neutral'}.
    Make it personal, positive, and empowering. 
    
    Guidelines:
    - Use "I am" or "I" statements
    - Focus on inner strength and self-worth
    - Be specific to the mood if provided
    - Keep it under 25 words
    - Make it feel genuine and meaningful
    - Avoid clichés
    
    Return only the affirmation text, no quotes or extra formatting.
    `

    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text().trim()
  } catch (error) {
    console.error('Affirmation AI error:', error)
    const fallbacks = [
      "I am stronger than I know and capable of handling whatever comes my way.",
      "I deserve peace, happiness, and all the good things life has to offer.",
      "Every breath I take fills me with calm and centers my mind.",
      "I trust myself to make choices that honor my wellbeing.",
      "I am worthy of love, respect, and compassion - especially from myself."
    ]
    return fallbacks[Math.floor(Math.random() * fallbacks.length)]
  }
}