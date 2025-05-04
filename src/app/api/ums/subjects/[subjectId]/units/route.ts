import { Unit } from "@/types/ums";
import { NextRequest, NextResponse } from "next/server";

// Mock units data - in a real app this would come from a database
const mockUnits: Record<string, Unit[]> = {
  "math": [
    {
      id: "c1",
      name: "Core Mathematics 1",
      code: "C1",
      subjectId: "math"
    },
    {
      id: "c2",
      name: "Core Mathematics 2",
      code: "C2",
      subjectId: "math"
    },
    {
      id: "s1",
      name: "Statistics 1",
      code: "S1",
      subjectId: "math"
    }
  ],
  "physics": [
    {
      id: "ph1",
      name: "Physics Unit 1",
      code: "PH1",
      subjectId: "physics"
    },
    {
      id: "ph2",
      name: "Physics Unit 2",
      code: "PH2",
      subjectId: "physics"
    }
  ],
  "chemistry": [
    {
      id: "ch1",
      name: "Chemistry Unit 1",
      code: "CH1",
      subjectId: "chemistry"
    },
    {
      id: "ch2",
      name: "Chemistry Unit 2",
      code: "CH2",
      subjectId: "chemistry"
    }
  ]
};

export async function GET(
  request: NextRequest,
  { params }: { params: { subjectId: string } }
) {
  try {
    const units = mockUnits[params.subjectId] || [];
    return NextResponse.json(units);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch units" },
      { status: 500 }
    );
  }
}