import { Subject } from "@/types/ums";
import { NextRequest, NextResponse } from "next/server";

// Mock subjects data - in a real app this would come from a database
const mockSubjects: Subject[] = [
  {
    id: "math",
    name: "Mathematics",
    code: "MATH"
  },
  {
    id: "physics",
    name: "Physics",
    code: "PHYS"
  },
  {
    id: "chemistry",
    name: "Chemistry",
    code: "CHEM"
  }
];

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json(mockSubjects);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch subjects" },
      { status: 500 }
    );
  }
}