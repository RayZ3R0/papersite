import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'A-Level Exam Schedule & Calendar',
  description: 'View and track your A-Level exam schedule. Comprehensive calendar with countdown timers for Physics, Chemistry, Biology, Mathematics and more subjects.',
  keywords: 'a level exam dates, exam schedule, exam calendar, exam countdown, exam timetable, revision planning',
  metadataBase: new URL('https://papernexus.xyz'),
  alternates: {
    canonical: 'https://papernexus.xyz/exams'
  },
  openGraph: {
    type: 'website',
    url: 'https://papernexus.xyz/exams',
    title: 'A-Level Exam Schedule & Calendar',
    description: 'View and track your A-Level exam schedule. Comprehensive calendar with countdown timers.',
    siteName: 'PaperNexus',
    images: [{
      url: `https://papernexus.xyz/api/og?title=${encodeURIComponent('A-Level Exam Schedule & Calendar')}&type=exams`,
      width: 1200,
      height: 630,
      alt: 'A-Level Exam Calendar'
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'A-Level Exam Schedule & Calendar',
    description: 'View and track your A-Level exam schedule',
    images: [{
      url: `https://papernexus.xyz/api/og?title=${encodeURIComponent('A-Level Exam Schedule & Calendar')}&type=exams`,
      width: 1200,
      height: 630,
      alt: 'A-Level Exam Calendar'
    }],
    site: '@papernexus',
    creator: '@papernexus'
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' }
  ]
}