import { ConversionData } from "@/types/conversion";
import { NextRequest, NextResponse } from "next/server";

// This would ideally come from a database
const mockUMSData = (session: string): ConversionData => ({
  metadata: {
    qualificationType: "GCE",
    session,
    subject: "Mathematics",
    unit: "Core Mathematics 1",
    recordCount: 100,
    timestamp: new Date().toISOString(),
  },
  data: Array.from({ length: 75 }, (_, i) => {
    // Create a slightly different curve for each session
    const sessionOffset = session === "Jan 2024" ? 5 : session === "Jun 2024" ? -3 : 0;
    const RAW = i;
    const UMS = Math.min(
      100,
      Math.max(
        0,
        Math.round(
          ((i + sessionOffset) / 75) * 100 + 
          Math.sin((i / 75) * Math.PI * 2) * 5
        )
      )
    );
    
    // Assign grades based on UMS
    let GRADE = "U";
    if (UMS >= 80) GRADE = "A";
    else if (UMS >= 70) GRADE = "B";
    else if (UMS >= 60) GRADE = "C";
    else if (UMS >= 50) GRADE = "D";
    else if (UMS >= 40) GRADE = "E";
    
    return { RAW, UMS, GRADE };
  }),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { subjectId: string; unitId: string } }
) {
  try {
    // In a real application, fetch data from database based on subjectId and unitId
    // For now, return mock data for different sessions
    const sessions = {
      "Jan 2024": mockUMSData("Jan 2024"),
      "Jun 2024": mockUMSData("Jun 2024"),
      "Jan 2025": mockUMSData("Jan 2025"),
    };

    return NextResponse.json(sessions);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch UMS data" },
      { status: 500 }
    );
  }
}