import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Student Profile & Dashboard',
  description: 'Manage your A-Level study preferences, track exam progress, and customize your learning experience. Access personalized study tools and resources.',
  keywords: 'student profile, exam tracking, study preferences, learning dashboard, grade tracking, subject preferences',
  metadataBase: new URL('https://papernexus.xyz'),
  alternates: {
    canonical: 'https://papernexus.xyz/profile'
  },
  openGraph: {
    type: 'website',
    url: 'https://papernexus.xyz/profile',
    title: 'Student Profile & Dashboard',
    description: 'Manage your A-Level study preferences and track your exam progress',
    siteName: 'PaperNexus',
    images: [{
      url: `https://papernexus.xyz/api/og?title=${encodeURIComponent('Student Profile & Dashboard')}&type=profile`,
      width: 1200,
      height: 630,
      alt: 'PaperNexus Student Dashboard'
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Student Profile & Dashboard',
    description: 'Manage your A-Level study preferences and track progress',
    images: [{
      url: `https://papernexus.xyz/api/og?title=${encodeURIComponent('Student Profile & Dashboard')}&type=profile`,
      width: 1200,
      height: 630,
      alt: 'PaperNexus Student Dashboard'
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