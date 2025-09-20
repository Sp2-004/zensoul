"""
# ZenSoul - Mental Wellness Companion

ZenSoul is a modern web application designed to support your mental wellness journey. With a focus on user-friendly design and advanced AI integrations, ZenSoul offers personalized affirmations, voice therapy, chat-based support, and a journal to track your progress. Whether you're seeking a moment of calm or interactive guidance, ZenSoul is here to help.  

---

## Table of Contents
- Features
- Tech Stack
- Prerequisites
- Installation
- Usage
- Building for Production
- Contributing
- License
- Acknowledgments
- Contact

---

## Features
- **Personalized Affirmations**: Daily AI-generated affirmations to uplift your mindset.  
- **Voice Therapy**: Natural voice conversations powered by ElevenLabs AI.  
- **Chat Assistant**: Instant text-based support via an AI companion.  
- **Tavus AI Companion**: Interactive video-based AI for real-time emotional intelligence.  
- **Journal**: Track your mental wellness journey with an intuitive journaling feature.  
- **Responsive Design**: Seamless experience across desktop and mobile devices.  
- **Theme Toggle**: Switch between light and dark modes.  
- **Emergency Support**: Quick access to emergency resources.  

---

## Tech Stack
- **Frontend**: React with Next.js, Tailwind CSS, TypeScript  
- **AI Integrations**: ElevenLabs (voice therapy), Tavus (video AI), custom chatbot  
- **Authentication**: NextAuth  
- **State Management**: React Hooks  
- **Utilities**: Toast notifications  

---

## Prerequisites
Before you begin, ensure you have the following installed on your system:
- Node.js v18.x or later  
- npm v9.x or later  
- Git (for cloning the repository)  

---

## Installation

1. **Clone the Repository**  
   Run the following commands:  
   git clone https://github.com/your-username/zensoul.git  
   cd zensoul  

2. **Install Dependencies**  
   npm install  

3. **Set Up Environment Variables**  
   Create a `.env.local` file in the root directory and add:  

   NEXTAUTH_URL=http://localhost:3000  
   NEXTAUTH_SECRET=your-secret-key  
   ELEVENLABS_API_KEY=your-elevenlabs-api-key  
   TAVUS_API_KEY=your-tavus-api-key  

   ⚠️ Note: Obtain API keys for ElevenLabs and Tavus from their respective services.  

4. **Run the Development Server**  
   npm run dev  

   Then open your browser at:  
   http://localhost:3000  

---

## Usage
- **Sign In**: Access personalized content using NextAuth authentication.  
- **Navigation**: Explore Home, Journal, Wellness, Sounds, and Emergency sections.  
- **Affirmations**: Click *Generate New Affirmation* for daily affirmations.  
- **AI Support**: Use *Voice Therapy*, *Chat Assistant*, or the *Tavus AI Companion*.  
- **Theme Toggle**: Switch between light and dark modes.  
- **Sign Out**: End your session securely.  

---

## Building for Production
1. **Build the Project**  
   npm run build  

2. **Start the Production Server**  
   npm run start  

   The app will be live at:  
   http://localhost:3000  

---

## License
This project is licensed under the **MIT License**.  
You are free to use, modify, and distribute it as per the license terms.  

 
---

_Last updated: 03:46 PM IST, Saturday, September 20, 2025_
"""
