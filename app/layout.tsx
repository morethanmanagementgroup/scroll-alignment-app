import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Scroll Alignment — Read what\'s been written in you.',
  description: 'Your birth code. Your current season. Your daily alignment. Scroll Alignment turns your personal rhythm, numerology, zodiac archetype, intention, and reflection into a daily operating system for your life.',
  keywords: 'numerology, scroll alignment, daily alignment, life path, Chinese zodiac, spiritual development, self-awareness',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Scroll',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#080810',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/scroll-mark.svg" />
      </head>
      <body className="bg-scroll-black min-h-screen antialiased">
        {children}
      </body>
    </html>
  )
}
