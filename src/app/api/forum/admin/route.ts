import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth/validation';

export async function POST(request: NextRequest) {
  try {
    // Verify admin role
    await requireRole(['admin']);

    // If we get here, the user is authenticated as admin
    return NextResponse.json({
      success: true,
      message: 'Admin action successful'
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
}

// Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      'Allow': 'POST, OPTIONS'
    }
  });
}