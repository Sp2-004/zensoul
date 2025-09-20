import './globals.css'
import { Poppins } from 'next/font/google'
import { ThemeProvider } from '@/components/ThemeProvider'
import { AuthProvider } from '@/components/AuthProvider'
import { Toaster } from '@/components/ui/toaster'
import Script from 'next/script'

const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900']
})

export const metadata = {
  title: 'ZenSoul - AI-Powered Mental Wellness',
  description: 'A comprehensive mental wellness app with AI-powered insights, voice conversations, and personalized support.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <Script 
          src="https://unpkg.com/@elevenlabs/convai-widget-embed" 
          strategy="afterInteractive"
          async 
        />
      </head>
      <body className={poppins.className}>
        <AuthProvider>
          <ThemeProvider>
            {children}
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}