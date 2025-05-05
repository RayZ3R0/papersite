import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Edexcel Revision Notes | All Subjects",
  description: "Comprehensive Edexcel revision notes for all subjects. Free downloadable study materials created by top educators and examiners.",
  keywords: "edexcel notes, edexcel revision notes, a level revision notes, gcse revision notes, edexcel study material",
  metadataBase: new URL('https://papersite.vercel.app'),
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' }
  ],
  openGraph: {
    title: "Edexcel Revision Notes | All Subjects",
    description: "Comprehensive Edexcel revision notes for all subjects. Free downloadable study materials created by top educators and examiners.",
    images: '/banner.jpg'
  },
  twitter: {
    title: "Edexcel Revision Notes | All Subjects",
    description: "Comprehensive Edexcel revision notes for all subjects. Free downloadable study materials created by top educators and examiners.",
    card: 'summary_large_image',
    images: '/banner.jpg'
  }
}