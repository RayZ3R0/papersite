import { NextRequest, NextResponse } from 'next/server';
import subjectsData from '@/lib/data/subjects.json';

// Use Node.js runtime
export const runtime = 'nodejs';

// Make route dynamic
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Clean up the response to only include necessary subject info
    const cleanSubjects = Object.entries(subjectsData.subjects).reduce((acc, [id, data]: [string, any]) => {
      acc[id] = {
        id,
        name: data.name || id.charAt(0).toUpperCase() + id.slice(1),
        units: data.units.map((unit: any) => ({
          id: unit.id,
          name: unit.name,
          order: unit.order,
          description: unit.description
        }))
      };
      return acc;
    }, {} as Record<string, any>);

    return NextResponse.json({ subjects: cleanSubjects });
  } catch (error) {
    console.error('Error loading subjects:', error);
    return NextResponse.json(
      { error: 'Failed to load subjects' },
      { status: 500 }
    );
  }
}

// Allow caching for better performance
export const fetchCache = 'force-cache';
export const revalidate = 3600; // Revalidate every hour