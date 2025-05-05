import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Books | PaperSite',
  description: 'Browse and filter academic books by subject',
  metadataBase: new URL('https://papersite.vercel.app'),
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' }
  ],
  openGraph: {
    title: 'Books | PaperSite',
    description: 'Browse and filter academic books by subject',
    images: '/banner.jpg'
  },
  twitter: {
    title: 'Books | PaperSite',
    description: 'Browse and filter academic books by subject',
    card: 'summary_large_image',
    images: '/banner.jpg'
  }
}