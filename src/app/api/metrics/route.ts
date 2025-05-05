import { NextResponse } from 'next/server';

interface PerformanceMetric {
  name: string;
  value: number;
  success: boolean;
  timestamp: number;
  metadata?: {
    userAgent?: string;
    platform?: string;
    [key: string]: any;
  };
}

export async function POST(request: Request) {
  try {
    const metric: PerformanceMetric = await request.json();

    // Add request metadata
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const platform = getPlatformFromUA(userAgent);

    const enrichedMetric = {
      ...metric,
      metadata: {
        ...metric.metadata,
        userAgent,
        platform,
        environment: process.env.NODE_ENV,
        region: process.env.VERCEL_REGION || 'unknown',
      },
    };

    // In production, log metrics
    if (process.env.NODE_ENV === 'production') {
      // Log to Vercel
      console.log(JSON.stringify({
        type: 'metric',
        ...enrichedMetric,
      }));
    }

    // In development, show metrics in console
    if (process.env.NODE_ENV === 'development') {
      console.log('[Performance Metric]', {
        name: enrichedMetric.name,
        value: `${enrichedMetric.value}ms`,
        success: enrichedMetric.success,
        platform,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Metrics Logger Failed]', error);
    return NextResponse.json(
      { error: 'Failed to log metric' },
      { status: 500 }
    );
  }
}

/**
 * Extract platform info from User-Agent string
 */
function getPlatformFromUA(ua: string): string {
  const lowerUA = ua.toLowerCase();
  
  if (/mobile/i.test(ua)) {
    if (lowerUA.includes('android')) return 'android';
    if (lowerUA.includes('iphone') || lowerUA.includes('ipad')) return 'ios';
    return 'mobile-other';
  }

  if (lowerUA.includes('windows')) return 'windows';
  if (lowerUA.includes('macintosh')) return 'macos';
  if (lowerUA.includes('linux')) return 'linux';
  
  return 'unknown';
}