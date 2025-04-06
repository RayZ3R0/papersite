import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// Make route dynamic
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Read the subjects data file
    const subjectsPath = path.join(process.cwd(), 'src/lib/data/subjects.json');
    const subjectsData = await fs.readFile(subjectsPath, 'utf-8');
    const subjects = JSON.parse(subjectsData);

    // Clean up the response to only include necessary subject info
    const cleanSubjects = Object.entries(subjects.subjects).reduce((acc, [id, data]: [string, any]) => {
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