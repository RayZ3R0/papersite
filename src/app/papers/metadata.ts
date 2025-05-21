import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'A-Level Past Papers & Mark Schemes | PaperNexus',
  description: 'Download free A-Level past papers, mark schemes and examiner reports for all subjects. Access comprehensive study materials, practice papers, and revision resources for Edexcel examinations.',
  keywords: 'a level past papers, edexcel papers, mark schemes, examiner reports, practice papers, revision materials, exam preparation, study resources',
  metadataBase: new URL('https://papernexus.xyz'),
  alternates: {
    canonical: 'https://papernexus.xyz/papers'
  },
  openGraph: {
    type: 'website',
    url: 'https://papernexus.xyz/papers',
    title: 'A-Level Past Papers & Mark Schemes | PaperNexus',
    description: 'Download free A-Level past papers, mark schemes and examiner reports for all subjects. Access comprehensive study materials and revision resources.',
    siteName: 'PaperNexus',
    images: [{
      url: '/previews/papers-preview.jpg',
      width: 1200,
      height: 630,
      alt: 'A-Level Past Papers Collection'
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'A-Level Past Papers & Mark Schemes | PaperNexus',
    description: 'Download free A-Level past papers and study materials for all subjects',
    images: [{
      url: '/previews/papers-preview.jpg',
      width: 1200,
      height: 630,
      alt: 'A-Level Past Papers Collection'
    }],
    site: '@papernexus',
    creator: '@papernexus'
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' }
  ]
}