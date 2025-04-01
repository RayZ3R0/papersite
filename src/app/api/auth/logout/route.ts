import { NextRequest, NextResponse } from 'next/server';
import { logoutUser } from '@/lib/auth';
import { withDb } from '@/lib/api-middleware';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

const handleLogout = async (request: NextRequest) => {
  try {
    // Clear auth cookies
    const cookieStore = cookies();
    cookieStore.delete('token');
    cookieStore.delete('refreshToken');

    // Call logout handler
    await logoutUser();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Failed to logout' },
      { status: 500 }
    );
  }
};

// Export handlers with middleware
export const POST = withDb(handleLogout);

// Handle CORS preflight requests
export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    }
  });
}