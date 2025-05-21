import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'A-Level Textbooks & Study Books | PaperNexus',
  description: 'Access a comprehensive collection of A-Level textbooks, revision guides, and study materials for Physics, Chemistry, Biology, Mathematics and more. Filtered by subject and exam board.',
  keywords: 'a level textbooks, edexcel books, revision guides, study materials, exam preparation, academic books, physics textbooks, chemistry textbooks',
  metadataBase: new URL('https://papernexus.xyz'),
  alternates: {
    canonical: 'https://papernexus.xyz/books'
  },
  openGraph: {
    type: 'website',
    url: 'https://papernexus.xyz/books',
    title: 'A-Level Textbooks & Study Books | PaperNexus',
    description: 'Access a comprehensive collection of A-Level textbooks, revision guides, and study materials for Physics, Chemistry, Biology, Mathematics and more.',
    siteName: 'PaperNexus',
    images: [{
      url: `https://papernexus.xyz/api/og?title=${encodeURIComponent('A-Level Textbooks & Study Materials')}&type=books`,
      width: 1200,
      height: 630,
      alt: 'PaperNexus Academic Books Collection'
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'A-Level Textbooks & Study Books | PaperNexus',
    description: 'Access a comprehensive collection of A-Level textbooks and study materials',
    images: [{
      url: `https://papernexus.xyz/api/og?title=${encodeURIComponent('A-Level Textbooks & Study Materials')}&type=books`,
      width: 1200,
      height: 630,
      alt: 'PaperNexus Academic Books Collection'
    }],
    site: '@papernexus',
    creator: '@papernexus'
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' }
  ]
}