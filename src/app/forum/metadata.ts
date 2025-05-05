import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Forum | PaperSite',
  description: 'Join discussions about academic papers, subjects, and more',
  metadataBase: new URL('https://papersite.vercel.app'),
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' }
  ],
  openGraph: {
    title: 'Forum | PaperSite',
    description: 'Join discussions about academic papers, subjects, and more',
    images: '/banner.jpg'
  },
  twitter: {
    title: 'Forum | PaperSite',
    description: 'Join discussions about academic papers, subjects, and more',
    card: 'summary_large_image',
    images: '/banner.jpg'
  }
}