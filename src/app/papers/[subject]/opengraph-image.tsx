import { ImageResponse } from "next/og";

// Route segment config
export const runtime = "edge";
export const alt = "Edexcel Past Papers";
export const contentType = "image/png";
export const size = {
  width: 1200,
  height: 630,
};

export default async function Image({
  params,
}: {
  params: { subject: string };
}) {
  const subject = params.subject
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

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
          backgroundColor: "#f8f9fa",
          fontFamily: "sans-serif",
          padding: "40px",
          background: "linear-gradient(to right, #4a6cf7, #33bcef)",
          color: "white",
        }}
      >
        <div style={{ fontSize: 60, fontWeight: "bold", marginBottom: 20 }}>
          {subject} Past Papers
        </div>
        <div style={{ fontSize: 30, opacity: 0.9 }}>
          Edexcel Exam Papers & Mark Schemes
        </div>
        <div style={{ marginTop: 40, fontSize: 24, opacity: 0.7 }}>
          Free Download • A-Level & GCSE
        </div>
      </div>
    ),
    size,
  );
}
