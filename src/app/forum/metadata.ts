import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Student Discussion Forum',
  description: 'Join our academic community to discuss A-Level subjects, share study tips, ask questions, and connect with fellow students. Get help with past papers, exam techniques, and subject-specific topics.',
  keywords: 'a level forum, student discussion, exam help, study discussion, academic community, subject help, exam preparation, student support',
  metadataBase: new URL('https://papernexus.xyz'),
  alternates: {
    canonical: 'https://papernexus.xyz/forum'
  },
  openGraph: {
    type: 'website',
    url: 'https://papernexus.xyz/forum',
    title: 'Student Discussion Forum',
    description: 'Join our academic community to discuss A-Level subjects, share study tips, ask questions, and connect with fellow students.',
    siteName: 'PaperNexus',
    images: [{
      url: `https://papernexus.xyz/api/og?title=${encodeURIComponent('Student Discussion Forum')}&type=forum`,
      width: 1200,
      height: 630,
      alt: 'PaperNexus Student Discussion Forum'
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Student Discussion Forum',
    description: 'Join our academic community to discuss A-Level subjects and get help',
    images: [{
      url: `https://papernexus.xyz/api/og?title=${encodeURIComponent('Student Discussion Forum')}&type=forum`,
      width: 1200,
      height: 630,
      alt: 'PaperNexus Student Discussion Forum'
    }],
    site: '@papernexus',
    creator: '@papernexus'
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' }
  ]
}