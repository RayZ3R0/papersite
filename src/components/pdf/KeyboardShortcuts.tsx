interface ShortcutItemProps {
  keys: string[];
  description: string;
}

function ShortcutItem({ keys, description }: ShortcutItemProps) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm group">
      <span className="text-text-muted group-hover:text-text transition-colors">{description}</span>
      <div className="flex items-center gap-1">
        {keys.map((key, index) => (
          <span key={`${key}-${index}`} className="flex items-center">
            <kbd className="px-2 py-1 bg-surface-alt rounded-md font-mono text-xs shadow-sm
              group-hover:bg-primary group-hover:text-white transition-colors">
              {key}
            </kbd>
            {index < keys.length - 1 && <span className="text-text-muted px-1">+</span>}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function KeyboardShortcuts() {
  return (
    <div
      className="fixed bottom-4 right-4 p-4 bg-surface rounded-lg border border-border shadow-lg w-96 z-50
        animate-in slide-in-from-bottom-2 fade-in duration-200"
      role="dialog"
      aria-label="Keyboard shortcuts"
    >
      <h3 className="font-medium mb-4 text-text">Keyboard Shortcuts</h3>
      <div className="space-y-6">
        <div>
          <h4 className="text-xs font-medium text-text-muted uppercase mb-2">Navigation</h4>
          <div className="space-y-2">
            <ShortcutItem keys={["←"]} description="Previous page" />
            <ShortcutItem keys={["→"]} description="Next page" />
            <ShortcutItem keys={["Home"]} description="First page" />
            <ShortcutItem keys={["End"]} description="Last page" />
          </div>
        </div>

        <div>
          <h4 className="text-xs font-medium text-text-muted uppercase mb-2">Zoom & Rotation</h4>
          <div className="space-y-2">
            <ShortcutItem keys={["Ctrl", "+"]} description="Zoom in" />
            <ShortcutItem keys={["Ctrl", "-"]} description="Zoom out" />
            <ShortcutItem keys={["R"]} description="Rotate clockwise" />
            <ShortcutItem keys={["Shift", "R"]} description="Rotate counter-clockwise" />
          </div>
        </div>

        <div>
          <h4 className="text-xs font-medium text-text-muted uppercase mb-2">General</h4>
          <div className="space-y-2">
            <ShortcutItem keys={["/"]} description="Toggle keyboard shortcuts" />
            <ShortcutItem keys={["Esc"]} description="Close keyboard shortcuts" />
          </div>
        </div>
      </div>
    </div>
  );
}