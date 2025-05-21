import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'UMS Grade Distribution Chart | PaperNexus',
  description: 'Visualize your A-Level UMS grade distribution and track your progress. Interactive charts and graphs to analyze performance across different subjects and units.',
  keywords: 'ums chart, grade distribution, a level grades, performance tracking, grade visualization, ums analysis, grade prediction, exam performance',
  metadataBase: new URL('https://papernexus.xyz'),
  alternates: {
    canonical: 'https://papernexus.xyz/tools/ums-chart'
  },
  openGraph: {
    type: 'website',
    url: 'https://papernexus.xyz/tools/ums-chart',
    title: 'UMS Grade Distribution Chart | PaperNexus',
    description: 'Visualize your A-Level UMS grade distribution and track your progress. Interactive charts and performance analysis tools.',
    siteName: 'PaperNexus',
    images: [{
      url: '/previews/ums-chart-preview.jpg',
      width: 1200,
      height: 630,
      alt: 'UMS Grade Distribution Chart Tool'
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'UMS Grade Distribution Chart | PaperNexus',
    description: 'Visualize your A-Level UMS grade distribution and track progress',
    images: [{
      url: '/previews/ums-chart-preview.jpg',
      width: 1200,
      height: 630,
      alt: 'UMS Grade Distribution Chart Tool'
    }],
    site: '@papernexus',
    creator: '@papernexus'
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' }
  ]
}