import { Metadata } from 'next'

export async function generateMetadata({ params }: { params: { subject: string } }): Promise<Metadata> {
  const subject = params.subject;
  const formattedSubject = subject.charAt(0).toUpperCase() + subject.slice(1);
  
  const title = `${formattedSubject} Past Papers & Mark Schemes | PaperNexus`;
  const description = `Download free Edexcel ${formattedSubject} past papers, mark schemes and examiner reports. Complete collection from 2015-2023 with detailed solutions and grade thresholds.`;

  return {
    title,
    description,
    keywords: [
      `${subject} past papers`,
      'edexcel past papers',
      `${subject} exam papers`,
      `${subject} mark schemes`,
      `${subject} revision`,
      'a level past papers',
      `${subject} practice papers`,
      'edexcel resources'
    ].join(', '),
    metadataBase: new URL('https://papernexus.xyz'),
    alternates: {
      canonical: `https://papernexus.xyz/papers/${subject}`
    },
    openGraph: {
      type: 'website',
      url: `https://papernexus.xyz/papers/${subject}`,
      title,
      description,
      siteName: 'PaperNexus',
      images: [{
        url: `https://papernexus.xyz/api/og?title=${encodeURIComponent(formattedSubject + ' Past Papers')}&type=papers&subject=${encodeURIComponent(subject)}`,
        width: 1200,
        height: 630,
        alt: `${formattedSubject} Past Papers Preview`
      }]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: `Download free Edexcel ${formattedSubject} past papers and mark schemes`,
      images: [{
        url: `https://papernexus.xyz/api/og?title=${encodeURIComponent(formattedSubject + ' Past Papers')}&type=papers&subject=${encodeURIComponent(subject)}`,
        width: 1200,
        height: 630,
        alt: `${formattedSubject} Past Papers Preview`
      }],
      site: '@papernexus',
      creator: '@papernexus'
    },
    themeColor: [
      { media: '(prefers-color-scheme: light)', color: '#ffffff' },
      { media: '(prefers-color-scheme: dark)', color: '#0f172a' }
    ]
  }
}

// Add verification for valid subjects
const validSubjects = [
  'physics',
  'chemistry',
  'biology',
  'mathematics',
  'accounting',
  'economics',
  'business',
  'psychology'
];

export function generateStaticParams() {
  return validSubjects.map(subject => ({
    subject
  }))
}