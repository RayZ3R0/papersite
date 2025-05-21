import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Search A-Level Resources',
  description: 'Search through our collection of A-Level past papers, notes, textbooks and study materials. Find resources by subject, topic, or exam board.',
  keywords: 'search papers, find resources, a level search, study material search, exam paper search',
  metadataBase: new URL('https://papernexus.xyz'),
  alternates: {
    canonical: 'https://papernexus.xyz/search'
  },
  openGraph: {
    type: 'website',
    url: 'https://papernexus.xyz/search',
    title: 'Search A-Level Resources',
    description: 'Search through our collection of A-Level study resources',
    siteName: 'PaperNexus',
    images: [{
      url: `https://papernexus.xyz/api/og?title=${encodeURIComponent('Search A-Level Resources')}&type=search`,
      width: 1200,
      height: 630,
      alt: 'PaperNexus Resource Search'
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Search A-Level Resources',
    description: 'Search through our collection of A-Level study resources',
    images: [{
      url: `https://papernexus.xyz/api/og?title=${encodeURIComponent('Search A-Level Resources')}&type=search`,
      width: 1200,
      height: 630,
      alt: 'PaperNexus Resource Search'
    }],
    site: '@papernexus',
    creator: '@papernexus'
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' }
  ],
  robots: {
    index: false,
    follow: false
  }
}