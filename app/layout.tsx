import type React from 'react'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
//         throw new Error('Failed to fetch video info')

const inter = Inter({ subsets: ['latin'] })
//         throw new Error('Erro ao buscar informações do vídeo')

export const metadata: Metadata = {
  title: 'Youtuber Downloader',
  description: 'Baixe vídeos do YouTube com facilidade',
  keywords: 'youtube, downloader, video, download, mp3, mp4',
  authors: [
    {
      name: 'Lucas Oliveira',
      url: '',
    },
  ],
  creator: 'Lucas Oliveira',
  publisher: 'Lucas Oliveira',
  openGraph: {
    title: 'Youtuber Downloader',
    description: 'Baixe vídeos do YouTube com facilidade',
    url: 'https://youtuber-downloader.vercel.app',
    siteName: 'Youtuber Downloader',
    images: [
      {
        url: 'https://youtuber-downloader.vercel.app/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Youtuber Downloader',
      },
    ],
    locale: 'pt-BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Youtuber Downloader',
    description: 'Baixe vídeos do YouTube com facilidade',
    images: ['https://youtuber-downloader.vercel.app/og-image.png'],
    creator: '@lucas_oliveira',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  themeColor: '#ffffff',
  colorScheme: 'light dark',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    noimageindex: false,
    maxSnippet: -1,
    maxVideoPreview: -1,
    maxImagePreview: -1,
  },
  verification: {
    google: 'google-site-verification',
    yandex: 'yandex-verification',
    other: 'other-verification',
  },
  alternates: {
    canonical: 'https://youtuber-downloader.vercel.app',
    languages: {
      'en-US': 'https://youtuber-downloader.vercel.app/en',
      'pt-BR': 'https://youtuber-downloader.vercel.app/pt',
    },
  },
  description: 'Baixe vídeos do YouTube com facilidade',
  applicationName: 'Youtuber Downloader',
  category: 'video',
  publisher: 'Lucas Oliveira',
  creator: 'Lucas Oliveira',
  keywords: 'youtube, downloader, video, download, mp3, mp4',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.ClassName}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
