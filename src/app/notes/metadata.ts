import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Free A-Level Notes & Study Materials',
  description: 'Download comprehensive A-Level revision notes and study guides for all subjects. Expert-curated content including topic summaries, exam tips, and detailed explanations.',
  keywords: 'a level notes, edexcel revision notes, gcse study materials, physics notes, chemistry notes, biology notes, math notes, revision guides, exam preparation',
  metadataBase: new URL('https://papernexus.xyz'),
  alternates: {
    canonical: 'https://papernexus.xyz/notes'
  },
  openGraph: {
    type: 'website',
    url: 'https://papernexus.xyz/notes',
    title: 'Free A-Level Notes & Study Materials',
    description: 'Download comprehensive A-Level revision notes and study guides for all subjects. Expert-curated content including topic summaries, exam tips, and detailed explanations.',
    siteName: 'PaperNexus',
    images: [{
      url: `https://papernexus.xyz/api/og?title=${encodeURIComponent('A-Level Revision Notes & Study Materials')}&type=notes`,
      width: 1200,
      height: 630,
      alt: 'A-Level Revision Notes Preview'
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free A-Level Notes & Study Materials',
    description: 'Download comprehensive A-Level revision notes and study guides',
    images: [{
      url: `https://papernexus.xyz/api/og?title=${encodeURIComponent('A-Level Revision Notes & Study Materials')}&type=notes`,
      width: 1200,
      height: 630,
      alt: 'A-Level Revision Notes Preview'
    }],
    site: '@papernexus',
    creator: '@papernexus'
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' }
  ]
}