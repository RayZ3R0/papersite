import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Raw to UMS Grade Calculator | PaperNexus',
  description: 'Convert raw marks to UMS scores and predict your grades for A-Level exams. Free online calculator with grade boundaries and UMS conversion tables for all subjects.',
  keywords: 'ums calculator, raw marks converter, grade calculator, a level grades, ums conversion, grade boundaries, ums marks, exam grade prediction',
  metadataBase: new URL('https://papernexus.xyz'),
  alternates: {
    canonical: 'https://papernexus.xyz/tools/raw-to-ums'
  },
  openGraph: {
    type: 'website',
    url: 'https://papernexus.xyz/tools/raw-to-ums',
    title: 'Raw to UMS Grade Calculator | PaperNexus',
    description: 'Convert raw marks to UMS scores and predict your grades for A-Level exams. Free online calculator with grade boundaries.',
    siteName: 'PaperNexus',
    images: [{
      url: '/previews/ums-calculator-preview.jpg',
      width: 1200,
      height: 630,
      alt: 'UMS Grade Calculator Tool'
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Raw to UMS Grade Calculator | PaperNexus',
    description: 'Convert raw marks to UMS scores and predict your A-Level grades',
    images: [{
      url: '/previews/ums-calculator-preview.jpg',
      width: 1200,
      height: 630,
      alt: 'UMS Grade Calculator Tool'
    }],
    site: '@papernexus',
    creator: '@papernexus'
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' }
  ]
}