export default function PDFLoadingState() {
  return (
    <div className="w-full h-[600px] bg-surface rounded-lg p-4 animate-pulse">
      <div className="w-full h-full flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        <div className="text-text-muted">Loading PDF...</div>
      </div>
    </div>
  );
}