import { ImageResponse } from "next/og";

// Route segment config
export const runtime = "edge";
export const alt = "Edexcel Past Papers & Mark Schemes - Free Download";  // Enhanced alt text
export const contentType = "image/png";
export const size = {
  width: 1200,
  height: 630,
};

// Map subject IDs to more SEO-friendly full names
const subjectEnhancedNames: Record<string, string> = {
  mathematics: "Mathematics A-Level", 
  physics: "Physics A-Level",
  chemistry: "Chemistry A-Level",
  biology: "Biology A-Level",
  economics: "Economics A-Level",
  accounting: "Accounting A-Level",
  psychology: "Psychology A-Level",
  business: "Business A-Level"
  // Add more subjects with appropriate qualifications
};

export default async function Image({
  params,
}: {
  params: { subject: string };
}) {
  // Get enhanced subject name or format the param as fallback
  const subjectId = params.subject;
  const subjectName = subjectEnhancedNames[subjectId] || 
    subjectId.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          fontFamily: "sans-serif",
          padding: "40px",
          background: "linear-gradient(to right, #4a6cf7, #33bcef)",
          color: "white",
          position: "relative",
        }}
      >
        {/* Logo placeholder - ideally your actual site logo */}
        <div style={{ 
          position: "absolute", 
          top: 40, 
          left: 40, 
          fontSize: 24, 
          fontWeight: "bold" 
        }}>
          Edexcel Papers
        </div>
        
        {/* Main heading - using the enhanced subject name */}
        <div style={{ fontSize: 72, fontWeight: "bold", marginBottom: 20, textAlign: "center" }}>
          {subjectName} Past Papers
        </div>
        
        {/* SEO-rich subtitle */}
        <div style={{ fontSize: 32, opacity: 0.9, textAlign: "center" }}>
          Complete Exam Papers & Mark Schemes
        </div>
        
        {/* Features - important keywords */}
        <div style={{ 
          marginTop: 40, 
          fontSize: 26, 
          opacity: 0.95,
          background: "rgba(0,0,0,0.2)",
          padding: "12px 24px",
          borderRadius: "12px"
        }}>
          Free • Verified • Examiner-Approved • Latest Syllabus
        </div>
        
        {/* Call to action */}
        <div style={{ 
          position: "absolute", 
          bottom: 40, 
          fontSize: 28,
          fontWeight: "bold",
          background: "#ffffff",
          color: "#4a6cf7",
          padding: "12px 32px",
          borderRadius: "8px"
        }}>
          Download Now
        </div>
      </div>
    ),
    size,
  );
}