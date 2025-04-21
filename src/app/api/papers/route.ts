import { NextRequest } from 'next/server';

const API_BASE = process.env.PAPERVOID_API_URL;

if (!API_BASE) {
  throw new Error('PAPERVOID_API_URL environment variable is not set');
}

export async function GET(request: NextRequest) {
  try {
    // Get the path from the URL
    const path = request.nextUrl.searchParams.get('path');
    if (!path) {
      return new Response('Path is required', { status: 400 });
    }

    // Forward the request to the actual API
    const response = await fetch(`${API_BASE}${path}`);
    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.error('API error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
