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
      url: `https://i.imgur.com/lSEDPga.png`,
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
      url: `https://i.imgur.com/lSEDPga.png`,
      width: 1200,
      height: 630,
      alt: 'A-Level Revision Notes Preview'
    }],
    site: '@papernexus',
    creator: '@papernexus'
  },
  // Discord uses OpenGraph but with some specific considerations
  // Discord will use the OG tags, but we can add additional properties
  other: {
    // Discord-specific
    'og:image:width': '1200',
    'og:image:height': '630',
    'theme-color': '#5865F2', // Discord brand color for embeds

    // Facebook-specific (already covered by OpenGraph but can be more specific)
    'fb:app_id': '', // Add your Facebook App ID if you have one

    // Pinterest-specific
    'pinterest:image': 'https://i.imgur.com/lSEDPga.png',
    'pinterest:description': 'Download comprehensive A-Level revision notes and study guides for all subjects.',

    // WhatsApp and other messaging platforms
    'og:site': 'PaperNexus',
    'og:image:alt': 'A-Level Revision Notes Preview',

    // LinkedIn-specific
    'linkedin:title': 'Free A-Level Notes & Study Materials',
    'linkedin:description': 'Download comprehensive A-Level revision notes and study guides for all subjects. Expert-curated content including topic summaries, exam tips, and detailed explanations.',
    
    // General social media
    'article:publisher': 'https://papernexus.xyz',
    'article:modified_time': new Date().toISOString(),
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' }
  ]
}