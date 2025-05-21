import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const title = searchParams.get('title') || 'PaperNexus'
    const type = searchParams.get('type') || 'default'
    const subject = searchParams.get('subject')

    // Load the font
    const inter = await fetch(
      new URL('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap')
    ).then((res) => res.arrayBuffer())

    let description = ''
    switch (type) {
      case 'papers':
        description = subject 
          ? `Download free ${subject} past papers and mark schemes`
          : 'Access thousands of A-Level past papers and mark schemes'
        break
      case 'notes':
        description = 'Comprehensive A-Level revision notes and study guides'
        break
      case 'books':
        description = 'Browse A-Level textbooks and study materials'
        break
      case 'forum':
        description = 'Join our academic community discussion'
        break
      case 'tools':
        description = 'Free A-Level study tools and calculators'
        break
      default:
        description = 'Your complete A-Level study companion'
    }

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0f172a',
            padding: '4rem',
          }}
        >
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
            <img
              src={`${process.env.NEXT_PUBLIC_BASE_URL}/logo.png`}
              alt="PaperNexus Logo"
              width="64"
              height="64"
            />
            <span style={{ 
              marginLeft: '1rem',
              fontSize: '2rem',
              fontWeight: 'bold',
              color: '#ffffff'
            }}>
              PaperNexus
            </span>
          </div>

          {/* Title */}
          <h1
            style={{
              fontSize: '3.5rem',
              fontWeight: 'bold',
              color: '#ffffff',
              textAlign: 'center',
              marginBottom: '1rem',
              maxWidth: '900px',
            }}
          >
            {title}
          </h1>

          {/* Description */}
          <p
            style={{
              fontSize: '1.8rem',
              color: '#94a3b8',
              textAlign: 'center',
              maxWidth: '800px',
            }}
          >
            {description}
          </p>

          {/* Footer */}
          <div
            style={{
              position: 'absolute',
              bottom: '2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#64748b',
            }}
          >
            <span>papernexus.xyz</span>
            {subject && <span>• {subject}</span>}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: 'Inter',
            data: inter,
            style: 'normal',
          },
        ],
      }
    )
  } catch (e) {
    console.error(e)
    return new Response('Failed to generate image', { status: 500 })
  }
}