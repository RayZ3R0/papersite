import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Raw to UMS Converter | PaperNexus',
  description: 'Convert raw marks to UMS scores and view grade boundaries for Cambridge exams',
  metadataBase: new URL('https://papernexus.vercel.app'),
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' }
  ],
  openGraph: {
    title: 'Raw to UMS Converter | PaperNexus',
    description: 'Convert raw marks to UMS scores and view grade boundaries for Cambridge exams',
    images: '/banner.jpg'
  },
  twitter: {
    title: 'Raw to UMS Converter | PaperNexus',
    description: 'Convert raw marks to UMS scores and view grade boundaries for Cambridge exams',
    card: 'summary_large_image',
    images: '/banner.jpg'
  }
}