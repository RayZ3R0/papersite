import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Raw to UMS Converter | Past Papers",
  description:
    "Convert raw marks to UMS scores for Edexcel International A Level examinations. View grade boundaries and complete conversion tables.",
  openGraph: {
    title: "Raw to UMS Converter",
    description:
      "Convert raw marks to UMS scores for Edexcel International A Level examinations. View grade boundaries and complete conversion tables.",
  },
};

export default function RawToUmsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="min-h-screen bg-background">
        {children}
      </div>
    </>
  );
}