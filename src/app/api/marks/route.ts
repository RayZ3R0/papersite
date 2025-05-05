import { NextRequest, NextResponse } from "next/server";

// Get base API URL from environment variable
const apiBaseUrl = process.env.PAPERVOID_API_URL || '';

// Remove trailing /api if present in env var to avoid double /api
const normalizedBaseUrl = apiBaseUrl.endsWith('/api')
  ? apiBaseUrl.slice(0, -4)
  : apiBaseUrl;

export async function GET(request: NextRequest) {
  try {
    // Get the path from query parameter
    const url = new URL(request.url);
    const path = url.searchParams.get('path') || '';
    
    // Construct the target URL
    const targetUrl = `${normalizedBaseUrl}/api/marks${path}`;
    
    console.log(`Proxying request to: ${targetUrl}`);
    
    // Forward the request
    const response = await fetch(targetUrl, {
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      cache: "no-store"
    });

    if (!response.ok) {
      console.error(`API error: ${response.status} ${response.statusText}`);
      return NextResponse.json({
        success: false,
        error: `API returned ${response.status}: ${response.statusText}`,
      }, { status: response.status });
    }

    // Handle the response
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      return NextResponse.json({
        success: true,
        data,
      });
    } else {
      const text = await response.text();
      console.error('Received non-JSON response:', text.substring(0, 200));
      return NextResponse.json({
        success: false,
        error: "Invalid response format from API",
      }, { status: 500 });
    }
  } catch (error) {
    console.error("Marks API proxy error:", error);
    return NextResponse.json({
      success: false,
      error: "Internal server error: " + (error instanceof Error ? error.message : String(error)),
    }, { status: 500 });
  }
}